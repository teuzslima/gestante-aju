"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const configurado =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (!configurado) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-bold">Configure o Supabase</h1>
        <p className="text-sm text-tinta-suave">
          Copie <code className="rounded bg-rosa-claro px-1">.env.example</code> para{" "}
          <code className="rounded bg-rosa-claro px-1">.env.local</code>, preencha a URL e a
          anon key do seu projeto Supabase e rode <code>supabase/schema.sql</code>.
        </p>
      </main>
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setCarregando(true);
    try {
      const supabase = createClient();
      if (modo === "cadastrar") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { nome } },
        });
        if (error) throw error;
        // Se a confirmação de e-mail estiver ativa, não há sessão ainda.
        if (!data.session) {
          setAviso("Conta criada! Confirme o e-mail (ou desative a confirmação no Supabase) e entre.");
          setModo("entrar");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      }
      router.push("/gestante");
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível autenticar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div className="text-center">
        <Link href="/" className="text-2xl font-bold text-rosa">
          Gestante Aju
        </Link>
        <p className="mt-1 text-sm text-tinta-suave">
          {modo === "entrar" ? "Entre para acompanhar sua gestação" : "Crie sua conta"}
        </p>
      </div>

      <form onSubmit={enviar} className="flex flex-col gap-3">
        {modo === "cadastrar" && (
          <input
            className="rounded-xl border border-borda bg-superficie px-4 py-3 text-sm"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          className="rounded-xl border border-borda bg-superficie px-4 py-3 text-sm"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="rounded-xl border border-borda bg-superficie px-4 py-3 text-sm"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          minLength={6}
          required
        />

        {erro && <p className="text-sm text-rosa-escuro">{erro}</p>}
        {aviso && <p className="text-sm text-verde">{aviso}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="mt-1 rounded-full bg-rosa px-6 py-3 text-sm font-semibold text-superficie disabled:opacity-60"
        >
          {carregando ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Cadastrar"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setModo(modo === "entrar" ? "cadastrar" : "entrar");
          setErro(null);
        }}
        className="text-center text-sm text-tinta-suave underline"
      >
        {modo === "entrar" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
      </button>
    </main>
  );
}
