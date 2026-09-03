"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Ошибка входа");
      }

      console.log("LOGIN SUCCESS:", result);

      alert(`Добро пожаловать, ${result.user.name}!`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не удалось войти"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: 400,
        margin: "80px auto",
        padding: 24,
      }}
    >
      <h1>🍽️ Столовая</h1>

      <h2 style={{ marginTop: 30 }}>
        Вход
      </h2>

      <form
        onSubmit={handleLogin}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginTop: 24,
        }}
      >
        <div>
          <label
            htmlFor="username"
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: "bold",
            }}
          >
            Логин
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Введите логин"
            required
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #ccc",
              borderRadius: 8,
              fontSize: 16,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: "bold",
            }}
          >
            Пароль
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            required
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #ccc",
              borderRadius: 8,
              fontSize: 16,
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: "#fee",
              color: "#900",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: 14,
            border: "none",
            borderRadius: 8,
            background: isLoading ? "#aaa" : "#111",
            color: "white",
            fontSize: 16,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Входим..." : "Войти"}
        </button>
      </form>
    </main>
  );
}