import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calcularGestacao, nomeTrimestre } from "@/lib/gestacao";
import { sair } from "@/app/gestante/actions";
import { alternarSinalizacao } from "./actions";

export const dynamic = "force-dynamic";

const configurado =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function dumParaData(dum: string): Date {
  const [ano, mes, dia] = dum.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

interface ItemGestante {
  profileId: string;
  gestacaoId: string | null;
  nome: string;
  semanas: number | null;
  trimestre: 1 | 2 | 3 | null;
  progresso: number;
  total: number;
  feitos: number;
  sinalizada: boolean;
}

export default async function GestorPage() {
  if (!configurado) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("papel")
    .eq("id", user.id)
    .maybeSingle();
  if (perfil?.papel !== "gestor") redirect("/gestante");

  const [gestantesRes, gestacoesRes, eventosRes, sinalizacoesRes] = await Promise.all([
    supabase.from("profiles").select("id, nome").eq("papel", "gestante"),
    supabase.from("gestacoes").select("id, gestante_id, dum"),
    supabase.from("eventos").select("gestacao_id, status"),
    supabase.from("sinalizacoes").select("gestacao_id"),
  ]);

  const gestacaoPorGestante = new Map<string, { id: string; dum: string }>();
  for (const g of gestacoesRes.data ?? []) {
    gestacaoPorGestante.set(g.gestante_id, { id: g.id, dum: g.dum });
  }
  const eventosPorGestacao = new Map<string, { total: number; feitos: number }>();
  for (const e of eventosRes.data ?? []) {
    const cur = eventosPorGestacao.get(e.gestacao_id) ?? { total: 0, feitos: 0 };
    cur.total += 1;
    if (e.status === "concluido") cur.feitos += 1;
    eventosPorGestacao.set(e.gestacao_id, cur);
  }
  const sinalizadas = new Set((sinalizacoesRes.data ?? []).map((s) => s.gestacao_id));

  const itens: ItemGestante[] = (gestantesRes.data ?? []).map((p) => {
    const g = gestacaoPorGestante.get(p.id) ?? null;
    let semanas: number | null = null;
    let trimestre: 1 | 2 | 3 | null = null;
    let progresso = 0;
    if (g) {
      const info = calcularGestacao(dumParaData(g.dum));
      semanas = info.semanas;
      trimestre = info.trimestre;
      progresso = info.progresso;
    }
    const ev = g ? eventosPorGestacao.get(g.id) : undefined;
    return {
      profileId: p.id,
      gestacaoId: g?.id ?? null,
      nome: p.nome,
      semanas,
      trimestre,
      progresso,
      total: ev?.total ?? 0,
      feitos: ev?.feitos ?? 0,
      sinalizada: g ? sinalizadas.has(g.id) : false,
    };
  });

  itens.sort(
    (a, b) =>
      Number(b.sinalizada) - Number(a.sinalizada) ||
      (b.semanas ?? -1) - (a.semanas ?? -1),
  );

  const totalSinalizadas = itens.filter((i) => i.sinalizada).length;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-5 py-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Painel do gestor</h1>
          <p className="text-sm text-tinta-suave">Acompanhamento das gestantes</p>
        </div>
        <form action={sair}>
          <button type="submit" className="text-sm font-semibold text-rosa">
            Sair
          </button>
        </form>
      </header>

      <div className="flex gap-2">
        <div className="flex-1 rounded-2xl bg-superficie p-4 text-center shadow-sm">
          <p className="text-2xl font-bold">{itens.length}</p>
          <p className="text-xs text-tinta-suave">gestantes</p>
        </div>
        <div className="flex-1 rounded-2xl bg-superficie p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-rosa">{totalSinalizadas}</p>
          <p className="text-xs text-tinta-suave">sinalizadas</p>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        {itens.length === 0 && (
          <p className="rounded-2xl bg-superficie p-4 text-sm text-tinta-suave shadow-sm">
            Nenhuma gestante cadastrada ainda.
          </p>
        )}

        {itens.map((i) => (
          <div
            key={i.profileId}
            className={`flex items-center gap-3 rounded-2xl bg-superficie p-4 shadow-sm ${
              i.sinalizada ? "ring-2 ring-rosa/40" : ""
            }`}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rosa-claro text-base font-semibold text-rosa-escuro"
              aria-hidden
            >
              {i.nome.charAt(0).toUpperCase()}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{i.nome}</p>
              {i.semanas !== null && i.trimestre !== null ? (
                <>
                  <p className="text-sm text-tinta-suave">
                    {i.semanas} semanas · {nomeTrimestre(i.trimestre)} · {i.feitos}/{i.total} exames
                  </p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-borda">
                    <div
                      className="h-full rounded-full bg-rosa"
                      style={{ width: `${Math.round(i.progresso * 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-tinta-suave">ainda não iniciou o acompanhamento</p>
              )}
            </div>

            {i.gestacaoId && (
              <form action={alternarSinalizacao}>
                <input type="hidden" name="gestacaoId" value={i.gestacaoId} />
                <button
                  type="submit"
                  aria-label={i.sinalizada ? "Remover sinalização" : "Sinalizar"}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    i.sinalizada
                      ? "bg-rosa text-superficie"
                      : "border border-rosa text-rosa"
                  }`}
                >
                  {i.sinalizada ? "★ sinalizada" : "sinalizar"}
                </button>
              </form>
            )}
          </div>
        ))}
      </section>

      <p className="pb-4 pt-1 text-center text-xs text-tinta-suave">
        Leitura das pacientes garantida por RLS (papel gestor).
      </p>
    </main>
  );
}
