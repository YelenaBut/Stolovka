import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const userId = Number(body.userId);
    const items = body.items;

    if (!userId) {
      return NextResponse.json(
        { error: "Пользователь не выбран" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Заказ пустой" },
        { status: 400 }
      );
    }

    // Проверяем позиции заказа
    for (const item of items) {
      if (
        !Number.isInteger(Number(item.menuId)) ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        return NextResponse.json(
          { error: "Некорректные данные заказа" },
          { status: 400 }
        );
      }
    }

    // Оформляем заказ и списываем баланс
    const { data, error } = await supabase.rpc(
      "create_order_with_balance",
      {
        p_user_id: userId,
        p_items: items,
      }
    );

    if (error) {
      console.error("CREATE ORDER RPC ERROR:", error);

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: data,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return NextResponse.json(
      { error: "Не удалось создать заказ" },
      { status: 500 }
    );
  }
}