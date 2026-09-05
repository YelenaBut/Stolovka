"use client";

import { useState } from "react";

type Order = {
  id: number;
  user_name: string;
  meal_type: "hot" | "buffet";
  price: number;
  is_paid: boolean;
  status: "draft" | "confirmed";
  order_date: string;
};

type Props = {
  orders: Order[];
};

export default function AdminOrders({ orders }: Props) {
  const [exporting, setExporting] = useState(false);
  const [exportText, setExportText] = useState("");
  const [message, setMessage] = useState("");

  async function exportOrders() {
    const confirmed = window.confirm(
      "Экспорт зафиксирует сегодняшние заказы. После этого их нельзя будет изменить или удалить. Продолжить?"
    );

    if (!confirmed) {
      return;
    }

    setExporting(true);
    setMessage("");
    setExportText("");

    try {
      const response = await fetch(
        "/api/admin/export-orders",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Ошибка экспорта"
        );
      }

      setExportText(data.text);

      setMessage(
        "✅ Заказы успешно зафиксированы и экспортированы."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? "❌ " + error.message
          : "❌ Ошибка экспорта"
      );
    } finally {
      setExporting(false);
    }
  }

  async function copyToClipboard() {
    if (!exportText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        exportText
      );

      setMessage(
        "✅ Текст скопирован. Можно отправлять в WhatsApp."
      );
    } catch {
      setMessage(
        "❌ Не удалось скопировать текст."
      );
    }
  }

  return (
    <div style={{ marginTop: 40 }}>
      <h2>📋 Экспорт заказов</h2>

      <p
        style={{
          color: "#666",
          marginBottom: 20,
        }}
      >
        Экспорт фиксирует сегодняшние заказы.
        После экспорта изменить или удалить их
        будет нельзя.
      </p>

      <button
        onClick={exportOrders}
        disabled={exporting}
        style={{
          padding: "12px 20px",
          borderRadius: 8,
          border: "none",
          background: exporting
            ? "#aaa"
            : "#1976d2",
          color: "white",
          fontSize: 16,
          cursor: exporting
            ? "default"
            : "pointer",
        }}
      >
        {exporting
          ? "Экспортируем..."
          : "📤 Экспортировать заказы"}
      </button>

      {message && (
        <p
          style={{
            marginTop: 16,
            fontWeight: 500,
          }}
        >
          {message}
        </p>
      )}

      {exportText && (
        <div style={{ marginTop: 24 }}>
          <h3>📱 Текст для WhatsApp</h3>

          <textarea
            value={exportText}
            readOnly
            rows={12}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ccc",
              fontFamily: "monospace",
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={copyToClipboard}
            style={{
              marginTop: 12,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            📋 Скопировать для WhatsApp
          </button>
        </div>
      )}

      {!exportText && orders.length > 0 && (
        <p
          style={{
            marginTop: 24,
            color: "#666",
          }}
        >
          Сегодня есть незафиксированные заказы:
          {" "}
          {orders.filter(
            (order) => order.status === "draft"
          ).length}
        </p>
      )}

      {!exportText && orders.length === 0 && (
        <p
          style={{
            marginTop: 24,
            color: "#666",
          }}
        >
          Заказов пока нет.
        </p>
      )}
    </div>
  );
}