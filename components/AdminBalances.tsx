"use client";

import { useState } from "react";

type Balance = {
  user_id: number;
  name: string;
  balance: number;
};

type Props = {
  balances: Balance[];
};

export default function AdminBalances({ balances }: Props) {
  const [data, setData] = useState(balances);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  const deposit = async (userId: number) => {
    const amount = Number(amounts[userId]);

    if (!amount || amount <= 0) {
      setError("Введите корректную сумму");
      return;
    }

    setLoading(userId);
    setError("");

    try {
      const response = await fetch("/api/balance/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Ошибка пополнения");
      }

      setData((current) =>
        current.map((user) =>
          user.user_id === userId
            ? {
                ...user,
                balance: Number(user.balance) + amount,
              }
            : user
        )
      );

      setAmounts((current) => ({
        ...current,
        [userId]: "",
      }));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не удалось пополнить баланс"
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      {error && (
        <div
          style={{
            padding: 12,
            marginBottom: 16,
            background: "#fee",
            border: "1px solid #fcc",
            borderRadius: 8,
            color: "#900",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {data.map((user) => (
          <div
            key={user.user_id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <div>
              <strong style={{ fontSize: 18 }}>
                {user.name}
              </strong>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                {Number(user.balance).toLocaleString("ru-RU")} ₸
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                type="number"
                min="1"
                placeholder="Сумма"
                value={amounts[user.user_id] || ""}
                onChange={(e) =>
                  setAmounts((current) => ({
                    ...current,
                    [user.user_id]: e.target.value,
                  }))
                }
                style={{
                  width: 120,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />

              <button
                onClick={() => deposit(user.user_id)}
                disabled={loading === user.user_id}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: 8,
                  background: "#111",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {loading === user.user_id
                  ? "..."
                  : "Пополнить"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}