import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const userId = Number(body.userId);
    const amount = Number(body.amount);

    if (!userId) {
      return NextResponse.json(
        { error: "Сотрудник не выбран" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Введите корректную сумму" },
        { status: 400 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Сотрудник не найден" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("balance_transactions")
      .insert({
        user_id: userId,
        amount,
        transaction_type: "deposit",
        comment: "Пополнение баланса",
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DEPOSIT ERROR:", error);

    return NextResponse.json(
      { error: "Не удалось пополнить баланс" },
      { status: 500 }
    );
  }
}