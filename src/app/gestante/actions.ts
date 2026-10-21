"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function sessao() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

// Cria ou atualiza a gestação da gestante (uma por usuária).
export async function salvarDum(formData: FormData) {
  const dum = String(formData.get("dum") ?? "");
  if (!dum) return;
  const { supabase, user } = await sessao();

  const { data: existente } = await supabase
    .from("gestacoes")
    .select("id")
    .eq("gestante_id", user.id)
    .maybeSingle();

  if (existente) {
    await supabase.from("gestacoes").update({ dum }).eq("id", existente.id);
  } else {
    await supabase.from("gestacoes").insert({ gestante_id: user.id, dum });
  }
  revalidatePath("/gestante");
}

export async function adicionarEvento(formData: FormData) {
  const tipo = String(formData.get("tipo") ?? "consulta");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const data = String(formData.get("data") ?? "");
  if (!titulo || !data) return;

  const { supabase, user } = await sessao();
  const { data: gestacao } = await supabase
    .from("gestacoes")
    .select("id")
    .eq("gestante_id", user.id)
    .maybeSingle();
  if (!gestacao) return;

  await supabase
    .from("eventos")
    .insert({ gestacao_id: gestacao.id, tipo, titulo, data, status: "agendado" });
  revalidatePath("/gestante");
}

// Alterna o status do evento entre "agendado" e "concluido".
export async function alternarEvento(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id) return;
  const novo = status === "concluido" ? "agendado" : "concluido";
  const { supabase } = await sessao();
  await supabase.from("eventos").update({ status: novo }).eq("id", id);
  revalidatePath("/gestante");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
