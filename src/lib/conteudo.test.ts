import { describe, it, expect } from "vitest";
import { conteudoDaSemana } from "./conteudo";

describe("conteudoDaSemana", () => {
  it("mapeia a semana para o trimestre certo", () => {
    expect(conteudoDaSemana(8).trimestre).toBe(1);
    expect(conteudoDaSemana(12).trimestre).toBe(1);
    expect(conteudoDaSemana(13).trimestre).toBe(2);
    expect(conteudoDaSemana(20).trimestre).toBe(2);
    expect(conteudoDaSemana(28).trimestre).toBe(3);
    expect(conteudoDaSemana(39).trimestre).toBe(3);
  });

  it("sempre traz dicas e exames", () => {
    for (const s of [5, 18, 32]) {
      const c = conteudoDaSemana(s);
      expect(c.dicas.length).toBeGreaterThan(0);
      expect(c.exames.length).toBeGreaterThan(0);
    }
  });
});
