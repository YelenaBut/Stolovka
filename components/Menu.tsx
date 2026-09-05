"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MenuDay = {
  menu_date: string;
  hot_name: string | null;
  hot_price: number | null;
  buffet_name: string | null;
  buffet_price: number | null;
};

type ExistingOrder = {
  id: number;
  order_date: string;
  meal_type: "hot" | "buffet";
  price: number | null;
  status: "draft" | "confirmed";
  is_paid: boolean;
};

type Props = {
  menuDays: MenuDay[];
  orders: ExistingOrder[];
};

function formatDateRu(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}

export default function Menu({
  menuDays = [],
  orders = [],
}: Props) {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(
    menuDays.length > 0 ? menuDays[0].menu_date : ""
  );

  const [selectedMeal, setSelectedMeal] = useState<
    "hot" | "buffet" | null
  >(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedMenu = menuDays.find(
    (day) => day.menu_date === selectedDate
  );

  const existingOrder = orders.find(
    (order) => order.order_date === selectedDate
  );

  const createOrder = async () => {
    if (!selectedDate || !selectedMeal) {
      setError("Выберите дату и тип питания.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderDate: selectedDate,
          mealType: selectedMeal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не удалось создать заказ");
      }

      setMessage("Заказ успешно создан.");
      setSelectedMeal(null);

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось создать заказ"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOrder = async (
    orderId: number,
    mealType: "hot" | "buffet"
  ) => {
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          mealType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не удалось изменить заказ");
      }

      setMessage("Заказ изменён.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось изменить заказ"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteOrder = async (orderId: number) => {
    const confirmed = window.confirm(
      "Вы действительно хотите удалить этот заказ?"
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не удалось удалить заказ");
      }

      setMessage("Заказ удалён.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось удалить заказ"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section style={{ marginTop: 30 }}>
      <h2>Меню</h2>

      {menuDays.length === 0 ? (
        <p>Меню на ближайшие дни пока не опубликовано.</p>
      ) : (
        <>
          {/* Даты */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 25,
            }}
          >
            {menuDays.map((day) => {
              const isSelected = day.menu_date === selectedDate;
              const hasOrder = orders.some(
                (order) => order.order_date === day.menu_date
              );

              return (
                <button
                  key={day.menu_date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day.menu_date);
                    setSelectedMeal(null);
                    setMessage("");
                    setError("");
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: isSelected
                      ? "2px solid #000"
                      : "1px solid #ccc",
                    background: isSelected ? "#f0f0f0" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  {formatDateRu(day.menu_date)}
                  {hasOrder ? " ✓" : ""}
                </button>
              );
            })}
          </div>

          {/* Меню выбранного дня */}
          {selectedMenu && (
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 20,
                marginBottom: 25,
              }}
            >
              <h3>{formatDateRu(selectedMenu.menu_date)}</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 15,
                  marginTop: 15,
                }}
              >
                {/* Горячее */}
                <button
                  type="button"
                  disabled={!!existingOrder || isSubmitting}
                  onClick={() => setSelectedMeal("hot")}
                  style={{
                    textAlign: "left",
                    padding: 18,
                    borderRadius: 10,
                    border:
                      selectedMeal === "hot"
                        ? "2px solid #000"
                        : "1px solid #ccc",
                    background:
                      selectedMeal === "hot"
                        ? "#f5f5f5"
                        : "#fff",
                    cursor:
                      existingOrder || isSubmitting
                        ? "default"
                        : "pointer",
                    opacity: existingOrder ? 0.6 : 1,
                  }}
                >
                  <strong>🍲 Горячее</strong>

                  <div style={{ marginTop: 8 }}>
                    {selectedMenu.hot_name || "Не указано"}
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <strong>
                      {selectedMenu.hot_price !== null
                        ? Number(selectedMenu.hot_price) + " ₸"
                        : "Цена не указана"}
                    </strong>
                  </div>
                </button>

                {/* Буфет */}
                {selectedMenu.buffet_name && (
                  <button
                    type="button"
                    disabled={!!existingOrder || isSubmitting}
                    onClick={() => setSelectedMeal("buffet")}
                    style={{
                      textAlign: "left",
                      padding: 18,
                      borderRadius: 10,
                      border:
                        selectedMeal === "buffet"
                          ? "2px solid #000"
                          : "1px solid #ccc",
                      background:
                        selectedMeal === "buffet"
                          ? "#f5f5f5"
                          : "#fff",
                      cursor:
                        existingOrder || isSubmitting
                          ? "default"
                          : "pointer",
                      opacity: existingOrder ? 0.6 : 1,
                    }}
                  >
                    <strong>🥗 Буфет</strong>

                    <div style={{ marginTop: 8 }}>
                      {selectedMenu.buffet_name}
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <strong>
                        {selectedMenu.buffet_price !== null
                          ? `${Number(
                              selectedMenu.buffet_price
                            )} ₸`
                          : "Цена не указана"}
                      </strong>
                    </div>
                  </button>
                )}
              </div>

              {/* Уже существует заказ */}
              {existingOrder && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    borderRadius: 10,
                    background: "#f7f7f7",
                  }}
                >
                  <div>
                    Ваш заказ:{" "}
                    <strong>
                      {existingOrder.meal_type === "hot"
                        ? "🍲 Горячее"
                        : "🥗 Буфет"}
                    </strong>
                  </div>

                  {existingOrder.status === "draft" ? (
                    <>
                      <p>
                        Заказ ещё можно изменить или отменить.
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          marginTop: 15,
                        }}
                      >
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            updateOrder(
                              existingOrder.id,
                              existingOrder.meal_type === "hot"
                                ? "buffet"
                                : "hot"
                            )
                          }
                          style={{
                            padding: "10px 16px",
                            borderRadius: 8,
                            border: "1px solid #999",
                            background: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          {existingOrder.meal_type === "hot"
                            ? "Изменить на буфет"
                            : "Изменить на горячее"}
                        </button>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            deleteOrder(existingOrder.id)
                          }
                          style={{
                            padding: "10px 16px",
                            borderRadius: 8,
                            border: "1px solid #c00",
                            background: "#fff",
                            color: "#c00",
                            cursor: "pointer",
                          }}
                        >
                          Удалить заказ
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        Заказ подтверждён и больше не может быть
                        изменён.
                      </p>

                      {existingOrder.price !== null && (
                        <p>
                          Цена:{" "}
                          <strong>
                            {Number(existingOrder.price)} ₸
                          </strong>
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Создание нового заказа */}
              {!existingOrder && (
                <div style={{ marginTop: 20 }}>
                  <button
                    type="button"
                    disabled={!selectedMeal || isSubmitting}
                    onClick={createOrder}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 8,
                      border: "none",
                      background: selectedMeal
                        ? "#000"
                        : "#ccc",
                      color: "#fff",
                      cursor:
                        selectedMeal && !isSubmitting
                          ? "pointer"
                          : "default",
                    }}
                  >
                    {isSubmitting
                      ? "Сохранение..."
                      : "Оформить заказ"}
                  </button>
                </div>
              )}

              {/* Сообщения */}
              {message && (
                <p
                  style={{
                    marginTop: 15,
                    color: "green",
                  }}
                >
                  {message}
                </p>
              )}

              {error && (
                <p
                  style={{
                    marginTop: 15,
                    color: "red",
                  }}
                >
                  {error}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

