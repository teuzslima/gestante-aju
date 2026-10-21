import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PainelGestante, { type EventoRow } from "@/components/PainelGestante";

export const dynamic = "force-dynamic";

const configurado =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function GestantePage() {
  if (!configurado) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, papel")
    .eq("id", user.id)
    .maybeSingle();

  // Gestor usa o painel de acompanhamento, não a tela da gestante.
  if (profile?.papel === "gestor") redirect("/gestor");

  const { data: gestacao } = await supabase
    .from("gestacoes")
    .select("id, dum")
    .eq("gestante_id", user.id)
    .maybeSingle();

  let eventos: EventoRow[] = [];
  if (gestacao) {
    const { data } = await supabase
      .from("eventos")
      .select("id, tipo, titulo, data, status")
      .eq("gestacao_id", gestacao.id)
      .order("data", { ascending: true });
    eventos = (data ?? []) as EventoRow[];
  }

  return (
    <PainelGestante
      nome={profile?.nome ?? "gestante"}
      dum={gestacao?.dum ?? null}
      eventos={eventos}
    />
  );
}
