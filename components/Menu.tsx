"use client";

import { useState } from "react";

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
};

type User = {
  id: number;
  name: string;
};

type Props = {
  menu: MenuItem[];
  users: User[];
};

export default function Menu({ menu, users }: Props) {
  const [selectedUser, setSelectedUser] = useState<number | "">("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState<number | null>(null);
  const [error, setError] = useState("");

  const changeQuantity = (id: number, change: number) => {
    setCart((current) => {
      const newQuantity = (current[id] || 0) + change;

      const updated = { ...current };

      if (newQuantity <= 0) {
        delete updated[id];
      } else {
        updated[id] = newQuantity;
      }

      return updated;
    });
  };

  const total = menu.reduce((sum, item) => {
    const quantity = cart[item.id] || 0;
    return sum + Number(item.price) * quantity;
  }, 0);

  const hasItems = Object.keys(cart).length > 0;

const createOrder = async () => {
  if (!selectedUser) {
    setError("Выберите сотрудника");
    return;
  }

  const items = Object.entries(cart).map(([menuId, quantity]) => ({
    menuId: Number(menuId),
    quantity,
  }));

  if (items.length === 0) {
    setError("Добавьте хотя бы одно блюдо");
    return;
  }

  setIsSubmitting(true);
  setError("");

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: selectedUser,
        items,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Ошибка оформления заказа");
    }

    setOrderCreated(result.orderId);
    setCart({});
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Не удалось оформить заказ"
    );
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <div>
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <label
          htmlFor="user"
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: "bold",
          }}
        >
          Кто вы?
        </label>

        <select
          id="user"
          value={selectedUser}
          onChange={(e) =>
            setSelectedUser(
              e.target.value ? Number(e.target.value) : ""
            )
          }
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        >
          <option value="">Выберите сотрудника</option>

          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {menu.map((item) => {
          const quantity = cart[item.id] || 0;

const createOrder = async () => {
  if (!selectedUser) {
    setError("Выберите сотрудника");
    return;
  }

  const items = Object.entries(cart).map(
    ([menuId, quantity]) => ({
      menuId: Number(menuId),
      quantity,
    })
  );

  if (items.length === 0) {
    setError("Добавьте хотя бы одно блюдо");
    return;
  }

  setIsSubmitting(true);
  setError("");

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: selectedUser,
        items,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Ошибка");
    }

    setOrderCreated(result.orderId);
    setCart({});
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Не удалось оформить заказ"
    );
  } finally {
    setIsSubmitting(false);
  }
};
          return (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <strong>{item.name}</strong>

                {item.description && (
                  <div
                    style={{
                      color: "#666",
                      marginTop: 4,
                    }}
                  >
                    {item.description}
                  </div>
                )}

                <div style={{ marginTop: 6 }}>
                  <strong>{item.price} ₸</strong>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <button
                  onClick={() => changeQuantity(item.id, -1)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    background: "white",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                >
                  −
                </button>

                <strong>{quantity}</strong>

                <button
                  onClick={() => changeQuantity(item.id, 1)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    background: "white",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
{error && (
  <div
    style={{
      marginTop: 16,
      padding: 12,
      borderRadius: 8,
      background: "#fee",
      color: "#900",
    }}
  >
    {error}
  </div>
)}

{orderCreated && (
  <div
    style={{
      marginTop: 16,
      padding: 16,
      borderRadius: 10,
      background: "#efe",
      color: "#174",
    }}
  >
    <strong>✅ Заказ №{orderCreated} оформлен!</strong>
    <div style={{ marginTop: 6 }}>
      Деньги пока не отмечены как оплаченные.
    </div>
  </div>
)}
      {hasItems && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            marginTop: 24,
            padding: 20,
            background: "white",
            border: "1px solid #ddd",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            <strong>Итого:</strong>
            <strong>{total} ₸</strong>
          </div>

<button
  onClick={createOrder}
  disabled={!selectedUser || isSubmitting}
  style={{
    width: "100%",
    padding: 14,
    border: "none",
    borderRadius: 10,
    background:
      selectedUser && !isSubmitting ? "#111" : "#aaa",
    color: "white",
    fontSize: 16,
    cursor:
      selectedUser && !isSubmitting
        ? "pointer"
        : "not-allowed",
  }}
>
  {isSubmitting
    ? "Оформляем..."
    : "Оформить заказ"}
</button>
        </div>
      )}
    </div>
  );
}