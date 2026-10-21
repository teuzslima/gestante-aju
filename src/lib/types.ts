// Tipos de domínio (espelham o schema do Supabase em /supabase/schema.sql).

export type Papel = "gestante" | "gestor";

export interface Profile {
  id: string; // = auth.users.id
  nome: string;
  papel: Papel;
  criadoEm: string;
}

export interface Gestacao {
  id: string;
  gestanteId: string;
  dum: string; // "AAAA-MM-DD"
  criadoEm: string;
}

export type TipoEvento = "consulta" | "exame";
export type StatusEvento = "agendado" | "concluido" | "atrasado";

export interface EventoPreNatal {
  id: string;
  gestacaoId: string;
  tipo: TipoEvento;
  titulo: string;
  data: string; // "AAAA-MM-DD"
  status: StatusEvento;
}
