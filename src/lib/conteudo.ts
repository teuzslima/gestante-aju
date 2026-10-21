// Conteúdo educativo por trimestre. Informação geral de apoio — NÃO substitui
// o acompanhamento da equipe de pré-natal.

export interface ConteudoTrimestre {
  trimestre: 1 | 2 | 3;
  titulo: string;
  resumo: string;
  dicas: string[];
  exames: string[];
}

export const CONTEUDO: Record<1 | 2 | 3, ConteudoTrimestre> = {
  1: {
    trimestre: 1,
    titulo: "1º trimestre (até 13 semanas)",
    resumo: "O começo da gestação: enjoos e cansaço são comuns. É a hora da primeira consulta e dos exames iniciais.",
    dicas: [
      "Tome ácido fólico conforme orientação da equipe de saúde",
      "Hidrate-se bem e faça refeições leves e frequentes",
      "Evite álcool, tabaco e automedicação",
      "Agende a primeira consulta de pré-natal",
    ],
    exames: ["Tipagem sanguínea e fator Rh", "Hemograma", "Sorologias (sífilis, HIV, hepatites)", "Primeiro ultrassom"],
  },
  2: {
    trimestre: 2,
    titulo: "2º trimestre (14 a 27 semanas)",
    resumo: "Costuma ser a fase mais tranquila: a energia volta e os primeiros movimentos do bebê aparecem.",
    dicas: [
      "Mantenha uma alimentação equilibrada e rica em ferro",
      "Comece a sentir e observar os movimentos do bebê",
      "Pratique atividade física leve, se liberada pela equipe",
      "Fique em dia com a vacina dTpa",
    ],
    exames: ["Ultrassom morfológico (por volta de 20 semanas)", "Teste de tolerância à glicose (24–28 semanas)", "Exames de rotina de sangue e urina"],
  },
  3: {
    trimestre: 3,
    titulo: "3º trimestre (28 semanas em diante)",
    resumo: "A reta final: as consultas ficam mais frequentes e é hora de se preparar para o parto.",
    dicas: [
      "Conte os movimentos do bebê e avise a equipe se diminuírem",
      "Conheça os sinais de trabalho de parto",
      "Prepare o plano de parto e a bolsa da maternidade",
      "Fique atenta a inchaço, dor de cabeça forte ou pressão alta",
    ],
    exames: ["Consultas mais frequentes", "Ultrassom de crescimento", "Exames de rotina e, se indicado, pesquisa de estreptococo (GBS)"],
  },
};

export function conteudoDaSemana(semanas: number): ConteudoTrimestre {
  const trimestre: 1 | 2 | 3 = semanas < 13 ? 1 : semanas < 28 ? 2 : 3;
  return CONTEUDO[trimestre];
}

export const AVISO_CONTEUDO =
  "Conteúdo informativo. Sempre siga as orientações da sua equipe de pré-natal.";
