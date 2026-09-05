import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json(
      { error: "Необходимо войти в систему" },
      { status: 401 }
    );
  }

  const { data: admin, error: adminError } = await supabase
    .from("users")
    .select("id, name, is_admin")
    .eq("auth_user_id", authUser.id)
    .single();

  if (
    adminError ||
    !admin ||
    !admin.is_admin
  ) {
    return NextResponse.json(
      { error: "Доступ запрещён" },
      { status: 403 }
    );
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Almaty",
  }).format(new Date());

  const {
    data: finalizedOrders,
    error: finalizeError,
  } = await supabase.rpc(
    "finalize_daily_orders",
    {
      p_order_date: today,
    }
  );

  if (finalizeError) {
    return NextResponse.json(
      { error: finalizeError.message },
      { status: 500 }
    );
  }

  const orders = finalizedOrders || [];

  const hotOrders = orders.filter(
    (order: any) => order.meal_type === "hot"
  );

  const buffetOrders = orders.filter(
    (order: any) => order.meal_type === "buffet"
  );

  const totalAmount = orders.reduce(
    (sum: number, order: any) =>
      sum + Number(order.price || 0),
    0
  );

  const lines = [
    "Заказы на " +
      new Date(today + "T00:00:00").toLocaleDateString(
        "ru-RU"
      ),
    "",
  ];

  orders.forEach((order: any) => {
    const mealName =
      order.meal_type === "hot"
        ? "горячее"
        : "буфет";

    lines.push(
      order.user_name +
        " — " +
        mealName +
        " — " +
        Number(order.price).toLocaleString("ru-RU") +
        " ₸"
    );
  });

  lines.push("");
  lines.push("Всего: " + orders.length + " заказа(ов)");
  lines.push("Горячее: " + hotOrders.length);
  lines.push("Буфет: " + buffetOrders.length);
  lines.push(
    "Сумма: " +
      totalAmount.toLocaleString("ru-RU") +
      " ₸"
  );

  return NextResponse.json({
    date: today,
    orders: orders,
    text: lines.join("\n"),
    totalOrders: orders.length,
    hotOrders: hotOrders.length,
    buffetOrders: buffetOrders.length,
    totalAmount: totalAmount,
  });
}