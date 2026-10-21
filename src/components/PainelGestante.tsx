"use client";

import { useMemo, useState } from "react";
import { calcularGestacao, diasAteData, formatarData, nomeTrimestre } from "@/lib/gestacao";
import { AVISO_CONTEUDO, conteudoDaSemana } from "@/lib/conteudo";
import { adicionarEvento, alternarEvento, sair, salvarDum } from "@/app/gestante/actions";

export type EventoRow = {
  id: string;
  tipo: "consulta" | "exame";
  titulo: string;
  data: string;
  status: "agendado" | "concluido" | "atrasado";
};

export default function PainelGestante({
  nome,
  dum,
  eventos,
}: {
  nome: string;
  dum: string | null;
  eventos: EventoRow[];
}) {
  const [dumLocal, setDumLocal] = useState<string>(dum ?? "");

  const info = useMemo(() => {
    if (!dumLocal) return null;
    const [ano, mes, dia] = dumLocal.split("-").map(Number);
    if (!ano || !mes || !dia) return null;
    return calcularGestacao(new Date(ano, mes - 1, dia));
  }, [dumLocal]);

  const lembretes = useMemo(() => {
    const pendentes = eventos
      .filter((e) => e.status !== "concluido")
      .map((e) => ({ ...e, dias: diasAteData(e.data) }))
      .sort((a, b) => a.dias - b.dias);
    return {
      proximo: pendentes.find((e) => e.dias >= 0) ?? null,
      atrasados: pendentes.filter((e) => e.dias < 0),
    };
  }, [eventos]);

  const conteudo = info ? conteudoDaSemana(info.semanas) : null;

  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-5 py-6">
      <header className="flex items-center justify-between">
        <span className="text-sm font-semibold text-tinta-suave">
          Olá, {nome.split(" ")[0]} 👋
        </span>
        <form action={sair}>
          <button type="submit" className="text-sm font-semibold text-rosa">
            Sair
          </button>
        </form>
      </header>

      {/* Semana gestacional */}
      {info ? (
        <section className="flex items-center gap-5 rounded-[20px] bg-superficie p-5 shadow-sm">
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
              <circle cx="60" cy="60" r={R} fill="none" stroke="var(--color-borda)" strokeWidth="12" />
              <circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke="var(--color-rosa)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - info.progresso)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold leading-none">{info.semanas}</span>
              <span className="text-xs text-tinta-suave">semanas</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="w-fit rounded-full bg-verde-claro px-2.5 py-0.5 text-xs font-semibold text-verde">
              {nomeTrimestre(info.trimestre)}
            </span>
            <p className="text-sm text-tinta-suave">
              {info.semanas} semanas e {info.dias} {info.dias === 1 ? "dia" : "dias"}
            </p>
            <p className="mt-1 text-sm">
              <strong>DPP:</strong> {formatarData(info.dpp)}
            </p>
            <p className="text-sm text-tinta-suave">faltam {info.diasRestantes} dias 💛</p>
          </div>
        </section>
      ) : (
        <section className="rounded-[20px] bg-superficie p-5 text-center shadow-sm">
          <p className="text-sm text-tinta-suave">
            Informe a data da sua última menstruação para começar a acompanhar.
          </p>
        </section>
      )}

      {/* Lembretes */}
      {(lembretes.proximo || lembretes.atrasados.length > 0) && (
        <section className="rounded-2xl bg-superficie p-4 shadow-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-suave">
            Lembretes
          </h2>
          {lembretes.proximo && (
            <p className="text-sm">
              🔔 Próxima {lembretes.proximo.tipo === "exame" ? "exame" : "consulta"}:{" "}
              <strong>{lembretes.proximo.titulo}</strong> —{" "}
              {lembretes.proximo.dias === 0
                ? "hoje"
                : `em ${lembretes.proximo.dias} ${lembretes.proximo.dias === 1 ? "dia" : "dias"}`}
            </p>
          )}
          {lembretes.atrasados.map((a) => (
            <p key={a.id} className="mt-1 text-sm text-rosa-escuro">
              ⚠️ Atrasado: {a.titulo} (há {Math.abs(a.dias)}{" "}
              {Math.abs(a.dias) === 1 ? "dia" : "dias"})
            </p>
          ))}
        </section>
      )}

      {/* Dicas do trimestre */}
      {conteudo && (
        <details className="rounded-2xl bg-superficie p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-semibold">
            💡 Dicas do seu trimestre
          </summary>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <p className="font-medium">{conteudo.titulo}</p>
            <p className="text-tinta-suave">{conteudo.resumo}</p>
            <ul className="list-disc pl-5 text-tinta-suave">
              {conteudo.dicas.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <p className="font-medium">Exames comuns</p>
            <ul className="list-disc pl-5 text-tinta-suave">
              {conteudo.exames.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-tinta-suave">{AVISO_CONTEUDO}</p>
          </div>
        </details>
      )}

      {/* Salvar DUM */}
      <form
        action={salvarDum}
        className="flex items-center justify-between gap-2 rounded-2xl bg-superficie p-4 text-sm shadow-sm"
      >
        <label className="font-medium" htmlFor="dum">
          Data da última menstruação
        </label>
        <div className="flex items-center gap-2">
          <input
            id="dum"
            name="dum"
            type="date"
            value={dumLocal}
            onChange={(e) => setDumLocal(e.target.value)}
            className="rounded-lg border border-borda px-2 py-1 text-tinta"
            required
          />
          <button type="submit" className="rounded-full bg-rosa px-3 py-1.5 text-xs font-semibold text-superficie">
            Salvar
          </button>
        </div>
      </form>

      {/* Consultas e exames */}
      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-tinta-suave">
          Consultas e exames
        </h2>

        {eventos.length === 0 && (
          <p className="rounded-2xl bg-superficie p-4 text-sm text-tinta-suave shadow-sm">
            Nenhuma consulta ou exame cadastrado ainda.
          </p>
        )}

        {eventos.map((e) => (
          <div
            key={e.id}
            className="flex items-center gap-3 rounded-2xl bg-superficie p-4 shadow-sm"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                e.status === "concluido" ? "bg-verde-claro" : "bg-rosa-claro"
              }`}
              aria-hidden
            >
              {e.tipo === "exame" ? "🧪" : "🩺"}
            </span>
            <div className="flex-1">
              <p className="font-medium">{e.titulo}</p>
              <p className="text-sm text-tinta-suave">
                {e.tipo === "exame" ? "Exame" : "Consulta"} ·{" "}
                {new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR")}
              </p>
            </div>
            <form action={alternarEvento}>
              <input type="hidden" name="id" value={e.id} />
              <input type="hidden" name="status" value={e.status} />
              <button
                type="submit"
                className={`text-sm font-semibold ${
                  e.status === "concluido" ? "text-verde" : "text-rosa"
                }`}
              >
                {e.status === "concluido" ? "✓ feito" : "marcar"}
              </button>
            </form>
          </div>
        ))}
      </section>

      {/* Novo evento */}
      <form
        action={adicionarEvento}
        className="flex flex-col gap-2 rounded-2xl bg-superficie p-4 shadow-sm"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wide text-tinta-suave">
          Adicionar consulta ou exame
        </h2>
        <div className="flex gap-2">
          <select name="tipo" className="rounded-lg border border-borda px-2 py-2 text-sm">
            <option value="consulta">Consulta</option>
            <option value="exame">Exame</option>
          </select>
          <input
            name="data"
            type="date"
            required
            className="flex-1 rounded-lg border border-borda px-2 py-2 text-sm"
          />
        </div>
        <input
          name="titulo"
          placeholder="Ex.: Consulta de pré-natal"
          required
          className="rounded-lg border border-borda px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-full bg-rosa px-4 py-2 text-sm font-semibold text-superficie"
        >
          Adicionar
        </button>
      </form>

      <p className="pb-4 pt-1 text-center text-xs text-tinta-suave">
        Seus dados são protegidos por RLS — só você vê a sua gestação.
      </p>
    </main>
  );
}
