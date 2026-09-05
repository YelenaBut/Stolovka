import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return {
      supabase,
      user: null,
      response: NextResponse.json(
        { error: "Необходимо войти в систему" },
        { status: 401 }
      ),
    };
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, name, username")
    .eq("auth_user_id", authUser.id)
    .single();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      response: NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 403 }
      ),
    };
  }

  return {
    supabase,
    user,
    response: null,
  };
}


// ============================================================
// СОЗДАНИЕ ЗАКАЗА
// ============================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const orderDate = body.orderDate;
    const mealType = body.mealType;

    if (!orderDate) {
      return NextResponse.json(
        { error: "Не указана дата заказа" },
        { status: 400 }
      );
    }

    if (mealType !== "hot" && mealType !== "buffet") {
      return NextResponse.json(
        { error: "Выберите горячее или буфет" },
        { status: 400 }
      );
    }

    const { supabase, user, response } = await getCurrentUser();

    if (response) {
      return response;
    }

    const { data, error } = await supabase.rpc(
      "create_daily_order",
      {
        p_user_id: user!.id,
        p_order_date: orderDate,
        p_meal_type: mealType,
      }
    );

    if (error) {
      console.error("CREATE DAILY ORDER RPC ERROR:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: data,
    });
  } catch (error) {
    console.error("CREATE DAILY ORDER ERROR:", error);

    return NextResponse.json(
      { error: "Не удалось создать заказ" },
      { status: 500 }
    );
  }
}


// ============================================================
// ИЗМЕНЕНИЕ ЗАКАЗА
// ============================================================

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const orderId = Number(body.orderId);
    const mealType = body.mealType;

    if (!Number.isInteger(orderId)) {
      return NextResponse.json(
        { error: "Некорректный номер заказа" },
        { status: 400 }
      );
    }

    if (mealType !== "hot" && mealType !== "buffet") {
      return NextResponse.json(
        { error: "Некорректный тип питания" },
        { status: 400 }
      );
    }

    const { supabase, user, response } = await getCurrentUser();

    if (response) {
      return response;
    }

    // Проверяем, что заказ принадлежит текущему пользователю
    // и ещё не подтверждён
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_date, status")
      .eq("id", orderId)
      .eq("user_id", user!.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Заказ не найден" },
        { status: 404 }
      );
    }

    if (order.status !== "draft") {
      return NextResponse.json(
        { error: "Подтверждённый заказ нельзя изменить" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        meal_type: mealType,
      })
      .eq("id", orderId)
      .eq("user_id", user!.id)
      .eq("status", "draft");

    if (updateError) {
      console.error("UPDATE ORDER ERROR:", updateError);

      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);

    return NextResponse.json(
      { error: "Не удалось изменить заказ" },
      { status: 500 }
    );
  }
}


// ============================================================
// ОТМЕНА ЗАКАЗА
// ============================================================

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const orderId = Number(body.orderId);

    if (!Number.isInteger(orderId)) {
      return NextResponse.json(
        { error: "Некорректный номер заказа" },
        { status: 400 }
      );
    }

    const { supabase, user, response } = await getCurrentUser();

    if (response) {
      return response;
    }

    // Удаляем только собственный draft-заказ.
    // confirmed удалить нельзя.
    const { data: deletedOrder, error: deleteError } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId)
      .eq("user_id", user!.id)
      .eq("status", "draft")
      .select("id")
      .single();

    if (deleteError || !deletedOrder) {
      return NextResponse.json(
        {
          error:
            "Заказ не найден или уже подтверждён и не может быть отменён",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: deletedOrder.id,
    });
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);

    return NextResponse.json(
      { error: "Не удалось отменить заказ" },
      { status: 500 }
    );
  }
}