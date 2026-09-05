import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import Menu from "@/components/Menu";

export default async function CabinetPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // Пользователь приложения
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, name, username")
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

  // Баланс
  const { data: balance, error: balanceError } = await supabase
    .from("user_balances")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (balanceError) {
    console.error("BALANCE ERROR:", balanceError);
  }

  // Получаем меню на ближайшие будущие рабочие дни.
  // Не вычисляем сегодняшнюю дату через JS,
  // чтобы не было проблем с часовым поясом.
  const { data: menuDays, error: menuError } = await supabase
    .from("menu_days")
    .select(`
      menu_date,
      hot_name,
      hot_price,
      buffet_name,
      buffet_price
    `)
    .order("menu_date", { ascending: true });

  if (menuError) {
    console.error("MENU ERROR:", menuError);

    return (
      <main style={{ padding: 40 }}>
        <h1>Ошибка загрузки меню</h1>
        <p>{menuError.message}</p>
      </main>
    );
  }

  // Все заказы текущего пользователя
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(`
      id,
      order_date,
      meal_type,
      price,
      status,
      is_paid,
      created_at,
      confirmed_at
    `)
    .eq("user_id", user.id)
    .order("order_date", { ascending: false });

  if (ordersError) {
    console.error("ORDERS ERROR:", ordersError);

    return (
      <main style={{ padding: 40 }}>
        <h1>Ошибка загрузки заказов</h1>
        <p>{ordersError.message}</p>
      </main>
    );
  }

  // Сегодня в часовом поясе столовой
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Almaty",
  }).format(new Date());

  // Оставляем только будущие рабочие дни
  const availableMenuDays = (menuDays || []).filter((day) => {
    const date = new Date(`${day.menu_date}T00:00:00`);

    const dayOfWeek = date.getDay();

    // 0 = воскресенье, 6 = суббота
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    return day.menu_date > today && isWeekday;
  });

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <h1>👤 Личный кабинет</h1>

      {/* Пользователь и баланс */}
      <div
        style={{
          marginTop: 24,
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 12,
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          {user.name}
        </h2>

        <div style={{ color: "#666" }}>
          Логин: {user.username}
        </div>

        <div
          style={{
            marginTop: 16,
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          💰 Баланс: {Number(balance?.balance || 0)} ₸
        </div>
      </div>

      {/* Новый заказ */}
      <h2 style={{ marginTop: 36 }}>
        🍽️ Новый заказ
      </h2>

      <Menu
        menuDays={availableMenuDays}
        orders={orders || []}
      />

      {/* История */}
      <h2 style={{ marginTop: 48 }}>
        📋 Мои заказы
      </h2>

      {!orders || orders.length === 0 ? (
        <p style={{ color: "#666" }}>
          Заказов пока нет.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <strong>
                  Заказ №{order.id}
                </strong>

                {order.price !== null && (
                  <strong>
                    {Number(order.price)} ₸
                  </strong>
                )}
              </div>

              <div
                style={{
                  marginTop: 8,
                  color: "#666",
                }}
              >
                📅 На дату:{" "}
                {order.order_date
                  ? order.order_date
                      .split("-")
                      .reverse()
                      .join(".")
                  : "Дата не указана"}
              </div>

              <div style={{ marginTop: 6 }}>
                {order.meal_type === "hot"
                  ? "🍲 Горячее"
                  : order.meal_type === "buffet"
                  ? "🥗 Буфет"
                  : "⚠️ Тип питания не указан"}
              </div>

              <div
                style={{
                  marginTop: 6,
                  color:
                    order.status === "confirmed"
                      ? "#174"
                      : "#666",
                }}
              >
                Статус:{" "}
                {order.status === "draft"
                  ? "🕐 Ожидает экспорта"
                  : order.status === "confirmed"
                  ? "✅ Подтверждён"
                  : order.status}
              </div>

              {order.status === "confirmed" && (
                <div
                  style={{
                    marginTop: 6,
                    color: order.is_paid ? "#174" : "#900",
                  }}
                >
                  {order.is_paid
                    ? "💚 Оплачен"
                    : "⚠️ Есть задолженность"}
                </div>
              )}

              <div
                style={{
                  marginTop: 8,
                  color: "#666",
                  fontSize: 13,
                }}
              >
                Создан:{" "}
                {new Date(order.created_at).toLocaleString(
                  "ru-RU"
                )}
              </div>

              {order.confirmed_at && (
                <div
                  style={{
                    marginTop: 4,
                    color: "#666",
                    fontSize: 13,
                  }}
                >
                  Подтверждён:{" "}
                  {new Date(order.confirmed_at).toLocaleString(
                    "ru-RU"
                  )}
                </div>
              )}

              {order.status === "draft" && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 10,
                    borderRadius: 8,
                    background: "#f5f5f5",
                    fontSize: 13,
                    color: "#666",
                  }}
                >
                  Заказ можно изменить или отменить до
                  экспорта отчёта.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}