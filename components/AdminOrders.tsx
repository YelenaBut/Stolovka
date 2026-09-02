"use client";

type OrderItem = {
  id: number;
  item_name: string;
  price: number;
  quantity: number;
  total: number;
};

type Order = {
  id: number;
  total_amount: number;
  is_paid: boolean;
  paid_at: string | null;
  created_at: string;
  users: {
  name: string;
  }[] | null;
  order_items: OrderItem[];
};

type Props = {
  orders: Order[];
};

export default function AdminOrders({ orders }: Props) {
  return (
    <div style={{ marginTop: 40 }}>
      <h2>📋 Заказы</h2>

      {orders.length === 0 ? (
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
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <strong style={{ fontSize: 18 }}>
                  Заказ №{order.id}
                </strong>

                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: order.is_paid
                      ? "#efe"
                      : "#fff3cd",
                    color: order.is_paid
                      ? "#174"
                      : "#856404",
                  }}
                >
                  {order.is_paid
                    ? "✅ Оплачен"
                    : "⏳ Не оплачен"}
                </span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <strong>Сотрудник:</strong>{" "}
                {order.users?.[0]?.name || "Не указан"}
              </div>

              <div style={{ marginBottom: 12 }}>
                <strong>Состав:</strong>

                <ul style={{ marginTop: 8 }}>
                  {order.order_items.map((item) => (
                    <li key={item.id}>
                      {item.item_name} × {item.quantity} —{" "}
                      {Number(item.total).toLocaleString(
                        "ru-RU"
                      )}{" "}
                      ₸
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  borderTop: "1px solid #eee",
                  paddingTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <strong>
                  Итого:{" "}
                  {Number(order.total_amount).toLocaleString(
                    "ru-RU"
                  )}{" "}
                  ₸
                </strong>

                <span style={{ color: "#666" }}>
                  {new Date(order.created_at).toLocaleString(
                    "ru-RU"
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}