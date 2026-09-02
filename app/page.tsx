import { supabase } from "@/lib/supabase";
import Menu from "@/components/Menu";

export default async function Home() {
  const { data: menu, error: menuError } = await supabase
    .from("menu")
    .select("*")
    .eq("is_active", true)
    .order("id");

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, name")
    .order("name");

  if (menuError || usersError) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Ошибка</h1>
        <pre>
          {menuError?.message || usersError?.message}
        </pre>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <h1>🍲 Столовая</h1>

      <p>Меню на сегодня</p>

      <Menu
        menu={menu || []}
        users={users || []}
      />
    </main>
  );
}