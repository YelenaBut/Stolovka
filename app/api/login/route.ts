import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "Введите логин и пароль" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, username, auth_user_id")
      .eq("username", username)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    if (!user.auth_user_id) {
      return NextResponse.json(
        { error: "Для этого пользователя ещё не настроен вход" },
        { status: 400 }
      );
    }

    const email = `${username}@stolovaya.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { error: "Ошибка входа" },
      { status: 500 }
    );
  }
}