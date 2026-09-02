import { supabase } from "@/lib/supabase";
import AdminBalances from "@/components/AdminBalances";
import AdminOrders from "@/components/AdminOrders";

export default async function AdminPage() {
  const { data: balances, error: balancesError } =
    await supabase
      .from("user_balances")
      .select("*")
      .order("name");

  const { data: orders, error: ordersError } =
    await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        is_paid,
        paid_at,
        created_at,
        users (
          name
        ),
        order_items (
          id,
          item_name,
          price,
          quantity,
          total
        )
      `)
      .order("created_at", { ascending: false });

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

      <p style={{ color: "#666", marginBottom: 24 }}>
        Здесь можно пополнять баланс сотрудников.
      </p>

      <AdminBalances balances={balances || []} />

      <AdminOrders orders={orders || []} />
    </main>
  );
}