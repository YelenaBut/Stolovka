"use client";

import { useState } from "react";

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
};

type Props = {
  menu: MenuItem[];
};

export default function Menu({ menu }: Props) {
  const [cart, setCart] = useState<Record<number, number>>({});

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

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 24,
        }}
      >
        {menu.map((item) => {
          const quantity = cart[item.id] || 0;

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
            style={{
              width: "100%",
              padding: 14,
              border: "none",
              borderRadius: 10,
              background: "#111",
              color: "white",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Оформить заказ
          </button>
        </div>
      )}
    </div>
  );
}