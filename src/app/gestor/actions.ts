"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Liga/desliga a sinalização de uma gestação (só gestor, garantido pelo RLS).
export async function alternarSinalizacao(formData: FormData) {
  const gestacaoId = String(formData.get("gestacaoId") ?? "");
  if (!gestacaoId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existente } = await supabase
    .from("sinalizacoes")
    .select("id")
    .eq("gestacao_id", gestacaoId)
    .maybeSingle();

  if (existente) {
    await supabase.from("sinalizacoes").delete().eq("id", existente.id);
  } else {
    await supabase
      .from("sinalizacoes")
      .insert({ gestacao_id: gestacaoId, gestor_id: user.id });
  }
  revalidatePath("/gestor");
}
