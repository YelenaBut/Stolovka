export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import AdminBalances from "@/components/AdminBalances";
import AdminOrders from "@/components/AdminOrders";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, name, username, is_admin")
    .eq("auth_user_id", authUser.id)
    .single();

  if (userError || !user) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Ошибка</h1>
        <p>Пользователь не найден.</p>
      </main>
    );
  }

  if (!user.is_admin) {
    return (
      <main style={{ padding: 40 }}>
        <h1>⛔ Доступ запрещён</h1>
        <p>У вас нет прав администратора.</p>
      </main>
    );
  }

  const {
    data: balances,
    error: balancesError,
  } = await supabase
    .from("user_balances")
    .select("*")
    .order("name");

  const {
    data: orders,
    error: ordersError,
  } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
      order_date,
      meal_type,
      price,
      is_paid,
      status,
      confirmed_at
    `)
    .order("order_date", { ascending: true })
    .order("id", { ascending: true });

  if (balancesError || ordersError) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Ошибка</h1>

        <pre>
          {balancesError?.message ||
            ordersError?.message}
        </pre>
      </main>
    );
  }

  const userIds = [
    ...new Set(
      (orders || []).map(
        (order) => order.user_id
      )
    ),
  ];

  let usersMap: Record<number, string> = {};

  if (userIds.length > 0) {
    const { data: orderUsers } = await supabase
      .from("users")
      .select("id, name")
      .in("id", userIds);

    usersMap = Object.fromEntries(
      (orderUsers || []).map((item) => [
        item.id,
        item.name,
      ])
    );
  }

  const adminOrders = (orders || []).map(
    (order) => ({
      id: order.id,
      user_name:
        usersMap[order.user_id] ||
        "Не указан",
      meal_type: order.meal_type,
      price: Number(order.price || 0),
      is_paid: order.is_paid,
      status: order.status,
      order_date: order.order_date,
    })
  );

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <h1>👨‍💼 Админка</h1>

      <h2 style={{ marginTop: 30 }}>
        💰 Балансы сотрудников
      </h2>

      <p
        style={{
          color: "#666",
          marginBottom: 24,
        }}
      >
        Здесь можно пополнять баланс сотрудников.
      </p>

      <AdminBalances
        balances={balances || []}
      />

      <AdminOrders
        orders={adminOrders}
      />
    </main>
  );
}