import Link from "next/link";

const features = [
  { icone: "🗓️", titulo: "Consultas e exames", texto: "Tudo organizado num só lugar, com lembretes." },
  { icone: "📈", titulo: "Semana a semana", texto: "Acompanhe a idade gestacional e o que esperar." },
  { icone: "🩺", titulo: "Conectado à saúde", texto: "A equipe da Prefeitura acompanha o seu pré-natal." },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-10">
      <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-rosa-claro px-3 py-1 text-xs font-semibold text-rosa-escuro">
        🥇 1º lugar · DemoDay Unit
      </span>

      <h1 className="text-4xl font-bold leading-tight">
        Seu pré-natal,
        <br />
        <span className="text-rosa">organizado e no seu tempo.</span>
      </h1>
      <p className="mt-4 text-base text-tinta-suave">
        O <strong>Gestante Aju</strong> reúne consultas, exames e orientações do seu
        acompanhamento pré-natal — e te deixa no comando da sua saúde durante a gravidez.
      </p>

      <Link
        href="/gestante"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-rosa px-6 py-4 text-base font-semibold text-superficie shadow-lg shadow-rosa/20 transition active:scale-[0.98]"
      >
        Acessar minha gestação
      </Link>

      <div className="mt-10 flex flex-col gap-3">
        {features.map((f) => (
          <div
            key={f.titulo}
            className="flex items-start gap-3 rounded-2xl bg-superficie p-4 shadow-sm"
          >
            <span className="text-2xl" aria-hidden>
              {f.icone}
            </span>
            <div>
              <p className="font-semibold">{f.titulo}</p>
              <p className="text-sm text-tinta-suave">{f.texto}</p>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-auto pt-10 text-center text-xs text-tinta-suave">
        Projeto vencedor do DemoDay — Universidade Tiradentes · Governança Digital de Aracaju
      </footer>
    </main>
  );
}
