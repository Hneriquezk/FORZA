export const planosData = {
  "5KM Iniciante": {
    id: "plan_5km_ini",
    nome: "5KM Running Start",
    nivel: "Iniciante",
    nivelIcon: "fa-seedling",
    cor: "#10b981",
    distancia: "5km",
    duracao: "2 semanas",
    sessoes: 6,
    sessoesPorSemana: 3,
    tempoMedio: "30min",
    caloriasEstimadas: 1800,
    descricao: "Plano progressivo para completar seus primeiros 5km. Ideal para quem está começando no mundo da corrida.",
    beneficios: [
      "Treinos guiados pelo Coach IA",
      "Acompanhamento de evolução",
      "Certificado de conclusão",
      "Grupo de suporte exclusivo"
    ],
    estrutura: {
      "Semana 1": [
        "Treino 1: Corrida 15min + caminhada 5min (3x)",
        "Treino 2: Corrida 20min contínua",
        "Treino 3: Corrida 18min + fortalecimento básico"
      ],
      "Semana 2": [
        "Treino 1: Corrida 25min",
        "Treino 2: Corrida 22min + tiros leves",
        "Treino 3: Teste 5km"
      ]
    },
    coachTips: [
      "Seu primeiro objetivo: correr 5km sem parar!",
      "A cada treino, tente aumentar 1-2 minutos de corrida",
      "Não se preocupe com o tempo, foco na constância"
    ]
  },
  "10KM Intermediário": {
    id: "plan_10km_int",
    nome: "10KM Road Runner",
    nivel: "Intermediário",
    nivelIcon: "fa-chart-line",
    cor: "#f59e0b",
    distancia: "10km",
    duracao: "4 semanas",
    sessoes: 12,
    sessoesPorSemana: 3,
    tempoMedio: "45min",
    caloriasEstimadas: 4200,
    descricao: "Plano completo para quem já corre 5km e quer evoluir para 10km com técnica e resistência.",
    beneficios: [
      "Treinos de ritmo e tiros",
      "Análise de performance",
      "Plano de fortalecimento",
      "Acompanhamento nutricional básico"
    ],
    estrutura: {
      "Semana 1": ["Treino 1: Corrida 4km ritmo leve", "Treino 2: Tiros 4x400m + recuperação", "Treino 3: Corrida 5km"],
      "Semana 2": ["Treino 1: Corrida 5km ritmo confortável", "Treino 2: Treino de ritmo: 3km forte", "Treino 3: Corrida 6km"],
      "Semana 3": ["Treino 1: Corrida 6km com progressão", "Treino 2: Tiros 6x400m", "Treino 3: Corrida 7km"],
      "Semana 4": ["Treino 1: Corrida 5km ritmo de prova", "Treino 2: Recuperação ativa", "Treino 3: Teste 10km"]
    },
    coachTips: [
      "Seu VO2 max está em 46.5 - ótimo para este nível!",
      "Treinos de ritmo são essenciais para seu objetivo",
      "O longão de fim de semana será seu melhor aliado"
    ]
  },
  "15KM Avançado": {
    id: "plan_15km_adv",
    nome: "15KM Endurance Pro",
    nivel: "Avançado",
    nivelIcon: "fa-bolt",
    cor: "#ff1e2d",
    distancia: "15km",
    duracao: "6 semanas",
    sessoes: 18,
    sessoesPorSemana: 3,
    tempoMedio: "60min",
    caloriasEstimadas: 7200,
    descricao: "Plano intensivo para corredores experientes que buscam aumentar resistência e velocidade.",
    beneficios: [
      "Treinos intervalados avançados",
      "Avaliação VO2 max",
      "Plano nutricional personalizado",
      "Análise biomecânica"
    ],
    estrutura: {
      "Semana 1-2": "Base: 3 treinos (6km, 8km, 10km)",
      "Semana 3-4": "Qualidade: tiros, fartlek, ritmo",
      "Semana 5-6": "Pico: longões de 12-15km + regeneração"
    },
    coachTips: [
      "Seus treinos intervalados estão 12% mais rápidos!",
      "Foco na técnica de corrida para ganhar eficiência",
      "A recuperação é tão importante quanto o treino"
    ]
  },
  "Meia Maratona 21KM": {
    id: "plan_21km_hm",
    nome: "Half Marathon",
    nivel: "Elite",
    nivelIcon: "fa-trophy",
    cor: "#8b5cf6",
    distancia: "21km",
    duracao: "12 semanas",
    sessoes: 36,
    sessoesPorSemana: 4,
    tempoMedio: "75min",
    caloriasEstimadas: 15000,
    descricao: "Preparação completa para sua primeira meia maratona. Treinos específicos e estratégias de prova.",
    beneficios: [
      "Longões progressivos semanais",
      "Estratégia de prova e pacing",
      "Suporte 24/7 Coach IA",
      "Plano de carboidratos para longões"
    ],
    estrutura: {
      "Fase 1 (Semanas 1-4)": "Base aeróbica: longões de 8-12km",
      "Fase 2 (Semanas 5-8)": "Qualidade: treinos de ritmo, tiros longos",
      "Fase 3 (Semanas 9-12)": "Pico: longões de 15-18km + taper"
    },
    coachTips: [
      "Para atingir sua meta, mantenha consistência nos longões",
      "O descanso ativo é crucial nesta fase",
      "Sua média de pace deve estar entre 5:20 e 5:40/km"
    ]
  },
  "Maratona 42KM": {
    id: "plan_42km_mar",
    nome: "Full Marathon",
    nivel: "Lendário",
    nivelIcon: "fa-crown",
    cor: "#ff1e2d",
    distancia: "42km",
    duracao: "20 semanas",
    sessoes: 60,
    sessoesPorSemana: 5,
    tempoMedio: "90min",
    caloriasEstimadas: 28000,
    descricao: "O desafio definitivo. Plano completo para maratonistas, com foco em resistência, nutrição e mentalidade.",
    beneficios: [
      "Periodização completa de 20 semanas",
      "Plano nutricional avançado",
      "Preparação mental e visualização",
      "Estratégia de prova personalizada"
    ],
    estrutura: {
      "Fase 1 (Semanas 1-6)": "Construção de base: longões de 10-18km",
      "Fase 2 (Semanas 7-12)": "Volume máximo: longões de 20-28km",
      "Fase 3 (Semanas 13-16)": "Qualidade: treinos de ritmo de maratona",
      "Fase 4 (Semanas 17-20)": "Taper: redução e recuperação"
    },
    coachTips: [
      "A maratona começa aos 30km - prepare sua mente!",
      "Seu longão máximo deve ser 32-35km",
      "A nutrição durante a prova é determinante para o resultado"
    ]
  }
}

export const treinosPorDia = {
  segunda: {
    nome: "Fartlek 40min",
    tags: ['CORRIDA', 'INTENSO', 'Zona 3-4'],
    descricao: "Alternar ritmo: 3min forte / 2min moderado",
    info: "Duração: 40min • ~380 kcal"
  },
  terca: {
    nome: "Fortalecimento de Core 30min",
    tags: ['FORTALECIMENTO', 'MOBILIDADE', 'SUPORTE'],
    descricao: "Prancha, abdominais, ponte e mobilidade de quadril",
    info: "Duração: 30min • ~180 kcal"
  },
  quarta: {
    nome: "Descanso Ativo",
    tags: ['RECUPERAÇÃO', 'CAMINHADA', 'YOGA'],
    descricao: "Caminhada leve de 30min ou alongamentos",
    info: "Duração: 30min • ~100 kcal"
  },
  quinta: {
    nome: "Tempo Run 6km",
    tags: ['CORRIDA', 'RITMO', 'Zona 4'],
    descricao: "6km em ritmo de 5:00/km",
    info: "Duração: 30min • ~420 kcal"
  },
  sexta: {
    nome: "Natação Técnica 45min",
    tags: ['NATAÇÃO', 'CROSS', 'BAIXO IMPACTO'],
    descricao: "Foco em técnica e respiração",
    info: "Duração: 45min • ~350 kcal"
  },
  sabado: {
    nome: "Long Run 14km",
    tags: ['CORRIDA', 'RESISTÊNCIA', 'Zona 2'],
    descricao: "Pace conversacional, foco em resistência",
    info: "Duração: 1h20min • ~980 kcal"
  },
  domingo: {
    nome: "Descanso Total",
    tags: ['RECUPERAÇÃO', 'DESCANSO', 'ALONGAMENTO'],
    descricao: "Alongamentos leves e hidratação",
    info: "Duração: - • ~0 kcal"
  }
}