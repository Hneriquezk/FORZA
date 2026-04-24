export const usuarios = [
  {
    id: 1,
    nome: "Vitor Vaz",
    avatar: "/img/usuarios/vitor_vaz.jpg",
    local: "São José dos Campos, SP",
    atividades: 132,
    seguidores: 53,
    seguindo: 120,
    verificado: true,
    bio: "Apaixonado por corrida e ciclismo | Maratonista | Treinando para Ironman"
  },
  {
    id: 2,
    nome: "Giovanni Borsoi",
    avatar: "/img/usuarios/giovanni_borsoi.jpg",
    local: "Caçapava, SP",
    atividades: 89,
    seguidores: 234,
    seguindo: 156,
    verificado: false,
    bio: "🚴 Ciclista amador | 🏃 Corredor nas horas vagas | 💪 Buscando o Ironman"
  },
  {
    id: 3,
    nome: "Gabriel Bastos",
    avatar: "/img/usuarios/gabriel.png",
    local: "Caçapava, SP",
    atividades: 156,
    seguidores: 312,
    seguindo: 89,
    verificado: false,
    bio: "🏃 Corredor de rua | 📸 Compartilho minhas aventuras | 🔥 Sempre em busca de novos desafios"
  },
  {
    id: 4,
    nome: "Henrique Santosz",
    avatar: "/img/usuarios/henrique_santosz.jpg",
    local: "São José dos Campos, SP",
    atividades: 234,
    seguidores: 567,
    seguindo: 345,
    verificado: false,
    bio: "🏃 Corredor | 🚴 Ciclista | 🏊 Nadador | 🌟 Amante de desafios e novas aventuras"
  },
  {
    id: 5,
    nome: "Nino Schurter",
    avatar: "/img/usuarios/nino.png",
    local: "Chur, GR, Suíça",
    atividades: 456,
    seguidores: 1234,
    seguindo: 89,
    verificado: true,
    bio: "Campeão mundial de Mountain Bike"
  },
  {
    id: 6,
    nome: "Henrique Avancini",
    avatar: "/img/usuarios/avatar_avancini.png",
    local: "Petrópolis, RJ",
    atividades: 312,
    seguidores: 890,
    seguindo: 120,
    verificado: true,
    bio: "Atleta profissional de Mountain Bike"
  }
]

export const postsData = [
  {
    id: 1,
    usuarioId: 1,
    usuario: "Vitor Vaz",
    avatar: "/img/usuarios/vitor_vaz.jpg",
    data: "16 de Março, 2026",
    local: "São José dos Campos, SP",
    atividade: "Night Run",
    icone: "fa-running",
    metricas: [
      { label: "Distância", valor: "5,92 km" },
      { label: "Tempo", valor: "00:39:06" },
      { label: "Ritmo", valor: "6:35/km" }
    ],
    imagens: ["/img/atividade_perfil3.png", "/img/atividade_perfil.png"],
    curtidas: 42,
    comentarios: 8
  },
  {
    id: 2,
    usuarioId: 1,
    usuario: "Vitor Vaz",
    avatar: "/img/usuarios/vitor_vaz.jpg",
    data: "15 de Março, 2026",
    local: "São José dos Campos, SP",
    atividade: "TRIP BIKE SJC — CASINHA A",
    icone: "fa-bicycle",
    metricas: [
      { label: "Distância", valor: "68,91 km" },
      { label: "Tempo", valor: "3h 16min" },
      { label: "Ganho alt.", valor: "1.350 m" }
    ],
    imagens: ["/img/atividade_perfil2.png", "/img/atividade_perfil4.png"],
    curtidas: 67,
    comentarios: 12
  },
  {
    id: 3,
    usuarioId: 1,
    usuario: "Vitor Vaz",
    avatar: "/img/usuarios/vitor_vaz.jpg",
    data: "10 de Março, 2026",
    local: "São José dos Campos, SP",
    atividade: "Treino de Natação",
    icone: "fa-water",
    metricas: [
      { label: "Distância", valor: "2,5 km" },
      { label: "Tempo", valor: "00:48:22" },
      { label: "Estilo", valor: "Arrastar" }
    ],
    imagens: ["/img/atividades/natacao_treino.png", "/img/atividades/nadando.png"],
    curtidas: 67,
    comentarios: 12
  }
]