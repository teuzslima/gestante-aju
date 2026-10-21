"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calcularGestacao,
  formatarData,
  nomeTrimestre,
} from "@/lib/gestacao";

// DUM de exemplo: ~20 semanas antes de hoje, para a tela já nascer preenchida.
function dumPadrao(): string {
  const d = new Date();
  d.setDate(d.getDate() - 140);
  return d.toISOString().slice(0, 10);
}

const eventos = [
  { tipo: "Consulta", titulo: "Consulta de pré-natal", data: "em 5 dias", status: "agendado" as const },
  { tipo: "Exame", titulo: "Ultrassom morfológico", data: "em 12 dias", status: "agendado" as const },
  { tipo: "Exame", titulo: "Hemograma completo", data: "há 3 dias", status: "concluido" as const },
];

const checklist = [
  { label: "Cartão da gestante em dia", feito: true },
  { label: "Vacina dTpa", feito: true },
  { label: "Exame de glicemia", feito: false },
  { label: "Suplementação de ácido fólico", feito: true },
];

export default function GestantePage() {
  const [dum, setDum] = useState<string>(dumPadrao);

  const info = useMemo(() => {
    const [ano, mes, dia] = dum.split("-").map(Number);
    return calcularGestacao(new Date(ano, mes - 1, dia));
  }, [dum]);

  // anel de progresso
  const R = 52;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - info.progresso);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-5 py-6">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-rosa">
          ← Início
        </Link>
        <span className="text-sm font-semibold text-tinta-suave">Minha gestação</span>
      </header>

      {/* Cartão principal: semana gestacional */}
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
              strokeDashoffset={offset}
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

      {/* Ajuste da DUM */}
      <label className="flex items-center justify-between rounded-2xl bg-superficie p-4 text-sm shadow-sm">
        <span className="font-medium">Data da última menstruação (DUM)</span>
        <input
          type="date"
          value={dum}
          onChange={(e) => setDum(e.target.value)}
          className="rounded-lg border border-borda px-2 py-1 text-tinta"
        />
      </label>

      {/* Próximos eventos */}
      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-tinta-suave">
          Consultas e exames
        </h2>
        {eventos.map((e) => (
          <div
            key={e.titulo}
            className="flex items-center gap-3 rounded-2xl bg-superficie p-4 shadow-sm"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                e.status === "concluido" ? "bg-verde-claro" : "bg-rosa-claro"
              }`}
              aria-hidden
            >
              {e.tipo === "Exame" ? "🧪" : "🩺"}
            </span>
            <div className="flex-1">
              <p className="font-medium">{e.titulo}</p>
              <p className="text-sm text-tinta-suave">
                {e.tipo} · {e.data}
              </p>
            </div>
            {e.status === "concluido" ? (
              <span className="text-sm font-semibold text-verde">✓ feito</span>
            ) : (
              <span className="text-sm font-semibold text-rosa">agendado</span>
            )}
          </div>
        ))}
      </section>

      {/* Checklist do pré-natal */}
      <section className="rounded-2xl bg-superficie p-4 shadow-sm">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-suave">
          Checklist do pré-natal
        </h2>
        <ul className="flex flex-col gap-2">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-superficie ${
                  item.feito ? "bg-verde" : "border border-borda bg-creme"
                }`}
                aria-hidden
              >
                {item.feito ? "✓" : ""}
              </span>
              <span className={item.feito ? "text-tinta-suave line-through" : ""}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="pb-4 pt-2 text-center text-xs text-tinta-suave">
        Dados de demonstração · versão em desenvolvimento
      </p>
    </main>
  );
}
