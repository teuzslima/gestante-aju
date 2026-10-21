import { describe, it, expect } from "vitest";
import { calcularGestacao, diasAteData, DIAS_GESTACAO } from "./gestacao";

describe("calcularGestacao", () => {
  it("DUM há 70 dias → 10 semanas e 0 dias (1º trimestre)", () => {
    const dum = new Date(2026, 0, 1);
    const hoje = new Date(2026, 2, 12); // 70 dias depois
    const g = calcularGestacao(dum, hoje);
    expect(g.semanas).toBe(10);
    expect(g.dias).toBe(0);
    expect(g.trimestre).toBe(1);
  });

  it("classifica os trimestres pelos limites (13 e 28 semanas)", () => {
    const dum = new Date(2026, 0, 1);
    const em = (semanas: number) => {
      const d = new Date(dum);
      d.setDate(d.getDate() + semanas * 7);
      return calcularGestacao(dum, d).trimestre;
    };
    expect(em(12)).toBe(1);
    expect(em(13)).toBe(2);
    expect(em(27)).toBe(2);
    expect(em(28)).toBe(3);
  });

  it("DPP = DUM + 280 dias e progresso vai a 1 no termo", () => {
    const dum = new Date(2026, 0, 1);
    const termo = new Date(dum);
    termo.setDate(termo.getDate() + DIAS_GESTACAO);
    const g = calcularGestacao(dum, termo);
    expect(g.dpp.toDateString()).toBe(termo.toDateString());
    expect(g.progresso).toBe(1);
    expect(g.diasRestantes).toBe(0);
  });

  it("nunca retorna valores negativos para data futura", () => {
    const dum = new Date(2026, 5, 1);
    const antes = new Date(2026, 4, 1);
    const g = calcularGestacao(dum, antes);
    expect(g.semanas).toBe(0);
    expect(g.progresso).toBe(0);
  });
});

describe("diasAteData", () => {
  it("futuro é positivo, hoje é zero, passado é negativo", () => {
    const hoje = new Date(2026, 0, 10);
    expect(diasAteData("2026-01-15", hoje)).toBe(5);
    expect(diasAteData("2026-01-10", hoje)).toBe(0);
    expect(diasAteData("2026-01-05", hoje)).toBe(-5);
  });
});
