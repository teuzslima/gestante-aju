// Regras de idade gestacional. Datas em UTC para não variar com fuso.

export const DIAS_GESTACAO = 280; // 40 semanas (regra de Naegele)

export interface InfoGestacional {
  /** semanas completas de gestação */
  semanas: number;
  /** dias além das semanas completas (0–6) */
  dias: number;
  /** trimestre atual (1, 2 ou 3) */
  trimestre: 1 | 2 | 3;
  /** Data Provável do Parto (DUM + 280 dias) */
  dpp: Date;
  /** dias restantes até a DPP */
  diasRestantes: number;
  /** progresso da gestação, de 0 a 1 */
  progresso: number;
}

function diffDias(de: Date, ate: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  const a = Date.UTC(de.getFullYear(), de.getMonth(), de.getDate());
  const b = Date.UTC(ate.getFullYear(), ate.getMonth(), ate.getDate());
  return Math.floor((b - a) / ms);
}

/**
 * Calcula a idade gestacional a partir da DUM (Data da Última Menstruação).
 * @param dum  data da última menstruação
 * @param hoje data de referência (padrão: agora)
 */
export function calcularGestacao(dum: Date, hoje: Date = new Date()): InfoGestacional {
  const totalDias = Math.max(0, diffDias(dum, hoje));
  const semanas = Math.floor(totalDias / 7);
  const dias = totalDias % 7;
  const trimestre: 1 | 2 | 3 = semanas < 13 ? 1 : semanas < 28 ? 2 : 3;

  const dpp = new Date(dum);
  dpp.setDate(dpp.getDate() + DIAS_GESTACAO);

  const diasRestantes = Math.max(0, diffDias(hoje, dpp));
  const progresso = Math.min(1, Math.max(0, totalDias / DIAS_GESTACAO));

  return { semanas, dias, trimestre, dpp, diasRestantes, progresso };
}

const NOMES_TRIMESTRE: Record<1 | 2 | 3, string> = {
  1: "1º trimestre",
  2: "2º trimestre",
  3: "3º trimestre",
};

export function nomeTrimestre(trimestre: 1 | 2 | 3): string {
  return NOMES_TRIMESTRE[trimestre];
}

export function formatarData(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

/**
 * Dias de hoje até uma data "AAAA-MM-DD".
 * Positivo = no futuro; 0 = hoje; negativo = no passado (atrasado).
 */
export function diasAteData(dataISO: string, hoje: Date = new Date()): number {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return diffDias(hoje, new Date(ano, mes - 1, dia));
}
