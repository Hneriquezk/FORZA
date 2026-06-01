import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { supabase } from '../lib/supabase';
import './CoachIA.css';

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

const GROQ_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const LEVEL_CONFIG = {
  iniciante: { label: "Iniciante", color: "#22c55e", bg: "#dcfce7", desc: "Começando agora, linguagem simples e motivadora." },
  intermediario: { label: "Intermediário", color: "#3b82f6", bg: "#dbeafe", desc: "Alguma experiência, pode usar termos técnicos moderados." },
  avancado: { label: "Avançado", color: "#a855f7", bg: "#ede9fe", desc: "Experiência sólida, linguagem técnica e detalhada." },
  elite: { label: "Elite", color: "#f59e0b", bg: "#fef3c7", desc: "Atleta de alto rendimento, maratonas, campeonatos." },
};

// ========== FUNÇÃO DE PROMPT COMPLETA ==========
function buildSystemPrompt(level, userName) {
  const levelDetails = {
    iniciante: `
PERFIL — INICIANTE (menos de 6 meses de prática ou primeiro contato com a atividade):

PRINCÍPIO GERAL: o iniciante está aprendendo os fundamentos. Toda recomendação deve priorizar segurança, aprendizado do gesto motor e criação do hábito. Nunca sobrecarregue volume ou intensidade.

MUSCULAÇÃO E TREINO FUNCIONAL:
* Exercícios em máquinas e movimentos monoarticulares (leg press, cadeira extensora, puxada no pulley, rosca direta)
* 2 a 3 séries | 12 a 15 repetições | descanso de 60 a 90 segundos | carga de 50% a 60% do máximo
* Sem técnicas de intensidade. Foco total na execução correta

CORRIDA E CAMINHADA:
* Caminhadas de 20 a 30 minutos em ritmo confortável ou corrida/caminhada alternada (método run-walk)
* Pace leve onde consegue conversar sem dificuldade (zona 1-2)
* Sem tiros, sem subidas forçadas, sem volume acima de 3x por semana

CICLISMO:
* Pedais planos de 30 a 45 minutos em terreno fácil
* Cadência confortável, sem forçar subidas ou sprints
* Foco em aprender postura e pedalada eficiente

NATAÇÃO:
* Técnica básica de respiração e braçada. Distâncias curtas com muitas paradas
* Sem provas de velocidade. Priorize flutuação e coordenação

FUTEBOL, BASQUETE, ESPORTES COLETIVOS:
* Fundamentos básicos: passe, recepção, posicionamento
* Jogos recreativos de baixa intensidade, sem pressão competitiva
* Evite sprints prolongados ou mudanças de direção bruscas repetidas

ARTES MARCIAIS E LUTAS:
* Golpes e posições básicas com movimentos lentos e controlados
* Sem sparring. Foco em ukemi (quedas seguras) e postura
* Treinos de 45 a 60 minutos no máximo

ESPORTES DE AVENTURA E AO AR LIVRE (trilhas, escalada, surf, etc.):
* Trilhas fáceis, praias calmas, vias de escalada nível iniciante com instrutor
* Duração curta, equipamento adequado, sem exposição a riscos

NUTRIÇÃO:
* Noções básicas de proteína (1,2 a 1,6g/kg), carboidratos como fonte de energia e hidratação (35ml/kg/dia)

TOM: muito motivador, simples, sem jargões. Explique sempre o "porquê" de cada recomendação. Celebre pequenas conquistas.`,

    intermediario: `
PERFIL — INTERMEDIÁRIO (6 meses a 2 anos de prática consistente):

PRINCÍPIO GERAL: o intermediário já domina os fundamentos e está pronto para aumentar volume, intensidade e complexidade dos movimentos. Introduza progressão estruturada e variações mais desafiadoras.

MUSCULAÇÃO E TREINO FUNCIONAL:
* Exercícios compostos e com peso livre (agachamento livre, supino com barra, levantamento terra, remada curvada, pull-up, afundo, stiff)
* 3 a 4 séries | 8 a 12 repetições | descanso de 60 segundos | carga de 65% a 75% do máximo
* Introduza drop set, supersérie antagonista e repetições próximas da falha (1 a 2 reps de reserva)
* Periodização linear ou ondulatória simples

CORRIDA:
* Treinos estruturados: longão semanal, pace moderado (zona 3), tiros curtos de 400m a 800m
* Volume de 20 a 40km por semana dependendo do objetivo
* Introduza subidas e variação de terreno

CICLISMO:
* Treinos em zona 2 e zona 3, subidas moderadas, grupos de pedalada
* Introduza intervalos curtos (30 segundos intenso / 1 minuto fácil)
* Volume de 3 a 5 horas por semana

NATAÇÃO:
* Treinos por distância ou tempo com séries definidas (ex: 10x100m com descanso de 20s)
* Trabalhe os 4 estilos. Introduza nado com pá e pull buoy
* Foco em eficiência técnica e ritmo de braçada

FUTEBOL, BASQUETE, ESPORTES COLETIVOS:
* Dribles, finalizações, esquemas táticos básicos
* Jogos com pressão moderada e marcação. Treinos técnicos específicos por posição
* Introduza treinos físicos complementares (agilidade, mudança de direção)

ARTES MARCIAIS E LUTAS:
* Combinações de golpes, sequências e esquemas táticos
* Sparring leve supervisionado. Treinos de 60 a 90 minutos
* Trabalhe condicionamento específico (saco, manopla, grappling controlado)

ESPORTES DE AVENTURA:
* Trilhas com ganho de altitude moderado, escalada em vias de nível intermediário, surf em ondas até 1 metro
* Introduza planejamento de rota e autonomia progressiva

NUTRIÇÃO:
* Timing de proteína (pré e pós-treino), uso de creatina (3 a 5g/dia), noções de superávit e déficit calórico

TOM: técnico moderado, direto, focado em progressão mensurável. Use dados e metas concretas.`,

    avancado: `
PERFIL — AVANÇADO (mais de 2 anos de prática com histórico sólido de progressão):

PRINCÍPIO GERAL: o avançado tem base sólida e precisa de estímulos mais complexos, técnicas de alta intensidade e periodização estruturada para continuar evoluindo. Evite o platô com variação inteligente de sobrecarga.

MUSCULAÇÃO E TREINO FUNCIONAL:
* Variações complexas: agachamento búlgaro, hack squat, stiff com barra, pull-up lastrado, remada unilateral pesada, exercícios unilaterais de alta demanda neuromuscular
* 4 a 6 séries | 4 a 10 repetições variando por bloco | descanso de 45 a 90 segundos
* Carga de 75% a 90% do máximo. Treine até a falha concêntrica de forma controlada
* Técnicas obrigatórias: rest-pause, cluster sets, myo-reps, oclusão vascular (BFR), pré-exaustão, negativa forçada
* Periodização em blocos (acumulação, transmutação, realização) com deload a cada 4 a 6 semanas

CORRIDA:
* Fartlek, tempo runs, tiros de 200m a 1000m em pace de limiar ou acima
* Volume de 50 a 80km por semana. Treinos em zona 4 e zona 5 regularmente
* Trabalhe subidas longas, descidas técnicas e variação de superfície (asfalto, terra, trilha)

CICLISMO:
* Intervalos de alta intensidade (VO2max), treinos em zona 4 e 5, subidas longas com cadência alta
* Volume de 6 a 10 horas por semana. Monitoramento de wattagem e cadência
* Treinos de força específica na bike (big gear, subidas sentado)

NATAÇÃO:
* Séries de alta intensidade com descanso reduzido (ex: 20x50m com 10s de pausa)
* Trabalhe todos os estilos com variação de intensidade. Introduza nado com barbatana e palas
* Foco em economia de movimento e viragem eficiente

FUTEBOL, BASQUETE, ESPORTES COLETIVOS:
* Táticas avançadas, leitura de jogo, treinos de alta pressão e simulação de jogo real
* Condicionamento físico periodizado: potência, agilidade, resistência específica ao esporte
* Análise de desempenho e correção técnica baseada em vídeo

ARTES MARCIAIS E LUTAS:
* Sparring regular com pressão progressiva. Sequências avançadas e contragolpes
* Treinos de 90 a 120 minutos com partes específicas de condicionamento, técnica e sparring
* Trabalhe especificidade: luta em pé, no chão, clínche

ESPORTES DE AVENTURA:
* Trilhas de alta altitude, escalada em vias desafiadoras, surf em ondas acima de 1,5 metros, mountain bike técnico
* Planejamento autônomo, gestão de risco e técnicas de resgate básico

NUTRIÇÃO:
* Ciclagem de carboidratos por fase de treino, déficit e superávit calórico preciso, suplementação periodizada (creatina, beta-alanina, cafeína estratégica)

TOM: altamente técnico. Use termos de fisiologia do exercício e biomecânica. Sem simplificações.`,

    elite: `
PERFIL — ELITE (atleta de alto rendimento: maratonistas, triatletas, crossfitters de competição, powerlifters, fisiculturistas, lutadores e jogadores profissionais):

PRINCÍPIO GERAL: o atleta elite opera no limite fisiológico. Cada recomendação deve considerar periodização anual, especificidade máxima ao esporte, monitoramento de carga e recuperação rigorosa. A margem de erro é mínima.

MUSCULAÇÃO E TREINO FUNCIONAL:
* Movimentos olímpicos (snatch, clean and jerk), pliometria avançada (depth jump, reactive bounding), força máxima com barra
* Periodização anual completa: macrociclo, mesociclo, microciclo. Picos de 85% a 100% com deloads obrigatórios
* Técnicas de elite: conjugate method, triphasic training, potenciação pós-ativação (PAP), BFR em recuperação
* Monitoramento de tonelagem semanal, VFC e RPE por sessão

CORRIDA E ENDURANCE:
* Treinos com pace de competição, tiros de 200m a 1600m em zona 5, long runs com segmentos de limiar
* Volume de 80km a 160km por semana conforme especialidade. Monitoramento de pace por zona cardíaca
* Estratégia de prova: divisão de ritmo, gestão de energia, cadência de passada ideal

CICLISMO:
* Monitoramento por wattagem (FTP, TSS, CTL, ATL). Blocos de VO2max, tempo de limiar, sprints repetidos
* Volume de 10 a 20 horas por semana. Brick training (bike + corrida) para triatletas

NATAÇÃO:
* Séries de sprint e resistência periodizadas. Análise de stroke rate e DPS (distância por braçada)
* Treinos de open water, viragens técnicas, saída de prova

FUTEBOL, BASQUETE, ESPORTES COLETIVOS:
* Análise tática por vídeo, treinos de alta intensidade com simulação de jogo completo
* GPS tracking de distância percorrida, sprints e acelerações por partida
* Periodização integrada com calendário de competições

ARTES MARCIAIS E LUTAS:
* Camp de preparação para competição. Sparring de alta intensidade com planejamento de carga
* Análise de adversários, estratégia de luta, corte de peso seguro e eficiente
* Treinos bifásicos: manhã (técnica/força) e tarde (sparring/condicionamento)

ESPORTES DE AVENTURA:
* Expedições de alto nível, escaladas técnicas, surf de ondas grandes, ultramaratonas em trilha
* Gestão de risco avançada, treinamento em altitude e condições adversas

NUTRIÇÃO DE COMPETIÇÃO:
* Carb loading pré-prova, corte de peso para pesagem, recomposição corporal precisa
* Suplementação periodizada e legal: creatina, nitrato de beterraba, cafeína, beta-alanina, HMB, bicarbonato de sódio

RECUPERAÇÃO:
* Protocolos de sono de 8 a 10 horas, crioterapia, massagem de liberação miofascial
* Periodização do descanso e gestão de carga psicológica pré-competição

TOM: trate como atleta profissional com staff técnico. Sem motivação genérica — dados, protocolos, estratégia e especificidade máxima.`
  };

  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.iniciante;

  return `Você é o Coach IA, um assistente especializado EXCLUSIVAMENTE em esportes, saúde, condicionamento físico, nutrição esportiva e evolução de atletas.

Usuário: ${userName || "Atleta"}
Nível: ${cfg.label}
${levelDetails[level] || levelDetails["iniciante"]}

REGRA CRÍTICA DE NÍVEL — OBRIGATÓRIA:
A progressão de dificuldade se aplica a QUALQUER esporte ou atividade física, não apenas musculação.
Sempre que sugerir um treino, exercício, protocolo ou prática esportiva, respeite rigorosamente o nível do usuário:
* Iniciante recebe fundamentos, baixa intensidade, sem técnicas avançadas
* Intermediário recebe variações mais complexas, maior intensidade e progressão estruturada
* Avançado recebe alta complexidade, técnicas de sobrecarga avançadas e periodização
* Elite recebe especificidade máxima ao esporte, monitoramento de carga e protocolos de alto rendimento
Nunca misture recomendações de níveis diferentes. A diferença NÃO é só o vocabulário — é a complexidade real, a intensidade, as técnicas e o volume.

TÓPICOS PERMITIDOS — responda SOMENTE sobre:
* Treinos, exercícios, musculação, cardio, mobilidade e flexibilidade
* Nutrição, alimentação saudável, dietas e suplementação esportiva
* Saúde física, bem-estar, sono, recuperação muscular e prevenção de lesões
* Esportes em geral (futebol, natação, corrida, ciclismo, artes marciais, etc.)
* Planejamento de treinos, periodização e evolução de performance
* Hidratação, descanso e hábitos saudáveis
* Competições, maratonas, campeonatos e preparação para eventos esportivos

REGRAS ABSOLUTAS:
* Se a pergunta NÃO for sobre esporte, saúde, alimentação, treino ou bem-estar físico, recuse e redirecione.
* Ao recusar, responda EXATAMENTE: "Sou especializado em esportes, saúde e performance física. Posso te ajudar com treinos, nutrição, recuperação ou qualquer dúvida sobre sua evolução atlética. Sobre o que posso te orientar?"
* Nunca substitua consulta médica para questões de saúde graves.
* Deixe as respostas fluidas sem emoji nem *, troque o * por •.

Responda sempre em português do Brasil.`;
}
// ========================================================================

const Icons = {
  Send: () => (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>),
  Plus: () => (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>),
  Trash: () => (<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>),
  Chat: () => (<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>),
  Menu: () => (<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>),
  Logo: () => (<span style={{ fontWeight: 800, fontSize: 24, letterSpacing: -0.5, color: "#ff1e2d" }}>Coach IA</span>),
};

function CoachIA() {
  const navigate = useNavigate();
  const { isAuthenticated, user: authUser } = useAuth();
  const { addNotification } = useNotifications();
  const [pageLoading, setPageLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const levelModalShownRef = useRef(false); // evita abrir mais de uma vez na mesma sessão

  const userId = authUser?.id || null;

  const tabs = [
    { id: 'planos', nome: 'Planos', rota: '/planos' },
    { id: 'coach', nome: 'Coach IA', rota: '/coach' },
    { id: 'analise', nome: 'Análise', rota: '/analise' },
    { id: 'resumo', nome: 'Resumo', rota: '/resumo' }
  ];

  const handleTabClick = (tab) => navigate(tab.rota);

  // ================= FUNÇÕES DE SUPABASE =================
  const loadProfile = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("coach_ia_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
        // Se já tinha perfil em cache, não abre modal
        if (localStorage.getItem(`level_chosen_${userId}`) === "true") {
          setLevelModalOpen(false);
        }
      }
      return;
    }

    if (data) {
      console.log("Perfil encontrado:", data);
      setProfile(data);
      // Já existe perfil → não abre o modal
      setLevelModalOpen(false);
      localStorage.setItem(`level_chosen_${userId}`, "true");
      localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
    } else {
      // Perfil não existe → criar um novo
      console.log("Criando novo perfil para", userId);
      const { data: newProfile, error: insertError } = await supabase
        .from("coach_ia_profiles")
        .insert({
          user_id: userId,
          name: authUser.nome || authUser.email?.split("@")[0],
          level: "iniciante"
        })
        .select()
        .single();

      if (insertError) {
        console.error("Erro ao criar perfil:", insertError);
        // Fallback: perfil local temporário
        const fallbackProfile = {
          user_id: userId,
          name: authUser.nome || authUser.email?.split("@")[0],
          level: "iniciante"
        };
        setProfile(fallbackProfile);
        // Só abre o modal se nunca tiver escolhido antes
        if (!levelModalShownRef.current && !localStorage.getItem(`level_chosen_${userId}`)) {
          setLevelModalOpen(true);
          levelModalShownRef.current = true;
        }
      } else {
        console.log("Perfil criado com sucesso:", newProfile);
        setProfile(newProfile);
        localStorage.setItem(`profile_${userId}`, JSON.stringify(newProfile));
        // Abre o modal apenas na primeira criação
        if (!levelModalShownRef.current && !localStorage.getItem(`level_chosen_${userId}`)) {
          setLevelModalOpen(true);
          levelModalShownRef.current = true;
        }
      }
    }
  };

  const loadChats = async () => {
    if (!userId) return;
    const { data, error } = await supabase.from("coach_ia_chats").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
    if (error) console.error(error);
    setChats(data || []);
    if (data?.length > 0 && !activeChatId) setActiveChatId(data[0].id);
  };

  const loadMessages = async (chatId) => {
    const { data, error } = await supabase.from("coach_ia_messages").select("*").eq("chat_id", chatId).order("created_at", { ascending: true });
    if (error) console.error(error);
    setMessages(data || []);
  };

  const createNewChat = async () => {
    if (!userId) { addNotification('Erro', 'Usuário não identificado', 'error'); return; }
    const { data, error } = await supabase.from("coach_ia_chats").insert({ user_id: userId, title: "Nova conversa" }).select().single();
    if (error) addNotification('Erro', error.message, 'error');
    else {
      setChats(prev => [data, ...prev]);
      setActiveChatId(data.id);
      setMessages([]);
      addNotification('Nova conversa', 'Criada com sucesso', 'success');
    }
  };

  const criarChatParaPlano = async (planoData) => {
    if (!userId) return null;
    const tituloChat = `Plano: ${planoData.planoNome}`;
    const { data: novoChat, error: chatError } = await supabase
      .from("coach_ia_chats")
      .insert({ user_id: userId, title: tituloChat })
      .select()
      .single();
    if (chatError) {
      addNotification('Erro', 'Não foi possível criar o chat para o plano.', 'error');
      return null;
    }
    const mensagemInicial = `🏁 **Plano iniciado: ${planoData.planoNome}** 🏁\n\n${planoData.descricao}\n\n📅 **Duração:** ${planoData.duracao}\n📊 **Total de sessões:** ${planoData.sessoes}\n\nVamos acompanhar sua evolução!\nO que você gostaria de saber primeiro sobre este plano?\n- Dicas para cada treino\n- Como ajustar a alimentação\n- Estratégias de recuperação\n\nEstou aqui para te ajudar a alcançar seus objetivos! 💪`;
    const { error: msgError } = await supabase
      .from("coach_ia_messages")
      .insert({ chat_id: novoChat.id, user_id: userId, role: "assistant", content: mensagemInicial });
    if (msgError) {
      addNotification('Erro', 'Não foi possível enviar a mensagem inicial.', 'error');
      return null;
    }
    setChats(prev => [novoChat, ...prev]);
    setActiveChatId(novoChat.id);
    setMessages([{
      id: crypto.randomUUID(),
      chat_id: novoChat.id,
      role: "assistant",
      content: mensagemInicial,
      created_at: new Date().toISOString()
    }]);
    return novoChat;
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    await supabase.from("coach_ia_chats").delete().eq("id", chatId);
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) setActiveChatId(chats.find(c => c.id !== chatId)?.id || null);
  };

  const updateChatTitle = async (chatId, text) => {
    const title = text.slice(0, 40) + (text.length > 40 ? "…" : "");
    await supabase.from("coach_ia_chats").update({ title }).eq("id", chatId);
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, title } : c));
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !activeChatId || !userId) return;
    const userText = input.trim();
    setInput("");
    const userMsg = { chat_id: activeChatId, user_id: userId, role: "user", content: userText };
    setMessages(prev => [...prev, { ...userMsg, id: crypto.randomUUID(), created_at: new Date().toISOString() }]);
    setLoading(true);
    const { error: saveError } = await supabase.from("coach_ia_messages").insert(userMsg);
    if (saveError) { addNotification('Erro', saveError.message, 'error'); setLoading(false); return; }
    if (messages.length === 0) await updateChatTitle(activeChatId, userText);
    const groqMessages = [
      { role: "system", content: buildSystemPrompt(profile?.level, profile?.name) },
      ...messages.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
      { role: "user", content: userText },
    ];
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: groqMessages, max_tokens: 1024, temperature: 0.7 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message);
      const assistantText = data.choices?.[0]?.message?.content || "Desculpe, não consegui responder.";
      const assistantMsg = { chat_id: activeChatId, user_id: userId, role: "assistant", content: assistantText };
      setMessages(prev => [...prev, { ...assistantMsg, id: crypto.randomUUID(), created_at: new Date().toISOString() }]);
      await supabase.from("coach_ia_messages").insert(assistantMsg);
      await supabase.from("coach_ia_chats").update({ updated_at: new Date().toISOString() }).eq("id", activeChatId);
    } catch (err) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: `Erro: ${err.message}`, created_at: new Date().toISOString() }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const updateLevel = async (level) => {
    if (!userId) return;
    await supabase.from("coach_ia_profiles").update({ level }).eq("user_id", userId);
    setProfile(prev => ({ ...prev, level }));
    setLevelModalOpen(false);
    levelModalShownRef.current = true;
    localStorage.setItem(`level_chosen_${userId}`, "true");
    addNotification('Nível atualizado', `Agora você é ${LEVEL_CONFIG[level].label}`, 'success');
  };

  // ================= FUNÇÕES PARA DADOS DINÂMICOS =================
  const getPlanoAtivo = () => {
    const stored = localStorage.getItem('forza_plano_ativo');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch { return null; }
  };

  const getPlanoRecomendado = () => {
    const plano = getPlanoAtivo();
    if (!plano) {
      return [
        { dia: "SEG", nome: "Fartlek 40min — zona 3-4", badge: "Intenso", classe: "intense" },
        { dia: "TER", nome: "Fortalecimento de core + mobilidade 30min", badge: "Suporte", classe: "support" },
        { dia: "QUA", nome: "Descanso ativo — caminhada leve ou yoga", badge: "Recuperação", classe: "recovery" },
        { dia: "QUI", nome: "Tempo run 6km @ 5:00/km", badge: "Intenso", classe: "intense" },
        { dia: "SEX", nome: "Natação técnica 45min", badge: "Cross", classe: "cross" },
        { dia: "SAB", nome: "Long run 14km zona 2", badge: "Resistência", classe: "endurance" },
        { dia: "DOM", nome: "Descanso total", badge: "Recuperação", classe: "recovery" },
      ];
    }
    if (plano.nome.includes("5KM") || plano.nome.includes("Iniciante")) {
      return [
        { dia: "SEG", nome: "Caminhada 30 min + trote leve 10 min", badge: "Leve", classe: "recovery" },
        { dia: "TER", nome: "Descanse ou alongamento", badge: "Descanso", classe: "recovery" },
        { dia: "QUA", nome: "Treino alternado: 5 min caminhada / 2 min trote (4x)", badge: "Iniciante", classe: "support" },
        { dia: "QUI", nome: "Descanso", badge: "Descanso", classe: "recovery" },
        { dia: "SEX", nome: "Caminhada rápida 40 min", badge: "Leve", classe: "support" },
        { dia: "SAB", nome: "Trote contínuo 15 min", badge: "Progressão", classe: "intense" },
        { dia: "DOM", nome: "Descanso total", badge: "Recuperação", classe: "recovery" },
      ];
    }
    if (plano.nome.includes("10KM") || plano.nome.includes("Intermediário")) {
      return [
        { dia: "SEG", nome: "Intervalado: 400m rápido / 400m lento (6x)", badge: "Intenso", classe: "intense" },
        { dia: "TER", nome: "Treino de força (agachamento, prancha)", badge: "Suporte", classe: "support" },
        { dia: "QUA", nome: "Rodagem leve 5km", badge: "Moderado", classe: "support" },
        { dia: "QUI", nome: "Descanso ativo", badge: "Recuperação", classe: "recovery" },
        { dia: "SEX", nome: "Tempo run 3km @ pace 6:00/km", badge: "Intenso", classe: "intense" },
        { dia: "SAB", nome: "Longão 8km zona 2", badge: "Resistência", classe: "endurance" },
        { dia: "DOM", nome: "Descanso", badge: "Recuperação", classe: "recovery" },
      ];
    }
    if (plano.nome.includes("15KM") || plano.nome.includes("Avançado")) {
      return [
        { dia: "SEG", nome: "Fartlek 50min (alternando ritmos)", badge: "Intenso", classe: "intense" },
        { dia: "TER", nome: "Musculação (perna completa)", badge: "Suporte", classe: "support" },
        { dia: "QUA", nome: "Rodagem regenerativa 6km", badge: "Moderado", classe: "support" },
        { dia: "QUI", nome: "Treino de subidas (6x200m)", badge: "Intenso", classe: "intense" },
        { dia: "SEX", nome: "Descanso ou natação", badge: "Recuperação", classe: "recovery" },
        { dia: "SAB", nome: "Longão 12km progressivo", badge: "Resistência", classe: "endurance" },
        { dia: "DOM", nome: "Descanso total", badge: "Recuperação", classe: "recovery" },
      ];
    }
    if (plano.nome.includes("21KM") || plano.nome.includes("Meia")) {
      return [
        { dia: "SEG", nome: "Treino de limiar: 4x1km ritmo alvo", badge: "Intenso", classe: "intense" },
        { dia: "TER", nome: "Treino funcional + core", badge: "Suporte", classe: "support" },
        { dia: "QUA", nome: "Rodagem regenerativa 7km", badge: "Moderado", classe: "support" },
        { dia: "QUI", nome: "Intervalado longo: 3x2km (descanso 2min)", badge: "Intenso", classe: "intense" },
        { dia: "SEX", nome: "Descanso ativo", badge: "Recuperação", classe: "recovery" },
        { dia: "SAB", nome: "Longão 16km zona 2", badge: "Resistência", classe: "endurance" },
        { dia: "DOM", nome: "Descanso", badge: "Recuperação", classe: "recovery" },
      ];
    }
    if (plano.nome.includes("42KM") || plano.nome.includes("Maratona")) {
      return [
        { dia: "SEG", nome: "Treino de ritmo de prova: 8km @ pace maratona", badge: "Intenso", classe: "intense" },
        { dia: "TER", nome: "Musculação (força máxima)", badge: "Suporte", classe: "support" },
        { dia: "QUA", nome: "Rodagem regenerativa 10km", badge: "Moderado", classe: "support" },
        { dia: "QUI", nome: "Intervalado: 16x400m com recuperação curta", badge: "Intenso", classe: "intense" },
        { dia: "SEX", nome: "Descanso ativo (yoga ou alongamento)", badge: "Recuperação", classe: "recovery" },
        { dia: "SAB", nome: "Longão 25km zona 2", badge: "Resistência", classe: "endurance" },
        { dia: "DOM", nome: "Descanso total", badge: "Recuperação", classe: "recovery" },
      ];
    }
    return [
      { dia: "SEG", nome: "Treino geral", badge: "Intenso", classe: "intense" },
      { dia: "TER", nome: "Treino de força", badge: "Suporte", classe: "support" },
      { dia: "QUA", nome: "Recuperação", badge: "Recuperação", classe: "recovery" },
      { dia: "QUI", nome: "Treino específico", badge: "Intenso", classe: "intense" },
      { dia: "SEX", nome: "Cross training", badge: "Cross", classe: "cross" },
      { dia: "SAB", nome: "Longão", badge: "Resistência", classe: "endurance" },
      { dia: "DOM", nome: "Descanso", badge: "Recuperação", classe: "recovery" },
    ];
  };

  const getInsightsDinamicos = () => {
    const plano = getPlanoAtivo();
    const base = [
      { type: "blue", title: "Dica", text: "" },
      { type: "red", title: "Alerta", text: "" },
      { type: "green", title: "Meta", text: "" },
      { type: "orange", title: "Dica Performance", text: "" },
    ];
    if (!plano) {
      base[0].text = "Comece um plano de treino para receber dicas personalizadas!";
      base[1].text = "Você não tem um plano ativo. Que tal escolher um na aba 'Planos'?";
      base[2].text = "Defina suas metas de corrida na aba 'Planos' e te ajudaremos a alcançá-las.";
      base[3].text = "Mantenha a consistência e logo verá resultados!";
      return base;
    }
    if (plano.nome.includes("5KM")) {
      base[0].text = "Seu plano de 5KM está progredindo. Continue alternando caminhada e trote.";
      base[1].text = "Lembre-se de aquecer antes dos treinos e alongar depois para evitar lesões.";
      base[2].text = "Objetivo da semana: completar 3 treinos de trote leve. Meta de distância: 6km.";
      base[3].text = "Seu esforço está ótimo! Aumente o trote gradualmente conforme se sentir confortável.";
    } else if (plano.nome.includes("10KM")) {
      base[0].text = "Seu VO2 máximo estimado melhorou 2 pontos esta semana. Continue com os intervalados!";
      base[1].text = "Cuidado com o volume! Você correu 5 dias consecutivos. Descanse amanhã.";
      base[2].text = "Para bater 10km em 60min, mantenha o pace médio em 6:00/km nos treinos de tiro.";
      base[3].text = "Seus treinos de força estão fazendo diferença. Mantenha 2x por semana.";
    } else if (plano.nome.includes("15KM")) {
      base[0].text = "Excelente evolução! Seu limiar anaeróbio subiu 0,5 km/h.";
      base[1].text = "Você ainda não fez o treino de subidas desta semana. Ajuste sua programação.";
      base[2].text = "Faltam 8 semanas para a prova. Meta de longão este fim de semana: 12km.";
      base[3].text = "Inclua um treino de tiros de 200m para melhorar sua velocidade final.";
    } else if (plano.nome.includes("21KM")) {
      base[0].text = "Seu ritmo de prova estimado está 15 segundos mais rápido que o planejado.";
      base[1].text = "Seu sono médio está abaixo de 7h. Priorize descanso para assimilar os treinos.";
      base[2].text = "Esta semana complete o longão de 16km a 80% da sua FC máxima.";
      base[3].text = "Testar a nutrição durante o longão é crucial. Leve géis e água.";
    } else if (plano.nome.includes("42KM")) {
      base[0].text = "Sua resistência mental está evoluindo. Longão de 25km concluído com sucesso!";
      base[1].text = "Monitore sua FC de repouso. Subiu 5bpm? Pode ser sinal de overtraining.";
      base[2].text = "Para a maratona, foque no treino de ritmo de prova: 10km no pace alvo.";
      base[3].text = "Inclua um taper nas 2 semanas finais. Reduza volume sem perder intensidade.";
    } else {
      base[0].text = "Continue seguindo seu plano. Os resultados virão.";
      base[1].text = "Mantenha a hidratação e alimentação balanceada.";
      base[2].text = "Acompanhe sua evolução no módulo Análise.";
      base[3].text = "Foco e determinação!";
    }
    return base;
  };

  // ================= EFEITOS =================
  useEffect(() => {
    const inicializar = async () => {
      if (!isAuthenticated) { navigate('/login'); return; }
      if (!userId) return;
      setPageLoading(true);
      await loadProfile();
      const planoPendenteRaw = localStorage.getItem('forza_plano_pendente_chat');
      if (planoPendenteRaw) {
        try {
          const planoData = JSON.parse(planoPendenteRaw);
          localStorage.removeItem('forza_plano_pendente_chat');
          await criarChatParaPlano(planoData);
        } catch (err) { console.error(err); }
      }
      await loadChats();
      setPageLoading(false);
    };
    inicializar();
  }, [isAuthenticated, userId]);

  useEffect(() => { if (activeChatId) loadMessages(activeChatId); else setMessages([]); }, [activeChatId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  if (pageLoading) {
    return (
      <>
        <Header />
        <div className="coach-loading"><div className="coach-loading-spinner"></div><p>Carregando...</p></div>
        <Footer />
      </>
    );
  }

  const lvl = LEVEL_CONFIG[profile?.level] || LEVEL_CONFIG.iniciante;

  return (
    <>
      <Header />
      <div className="coach-container">
        <div className="coach-header">
          <h1>Coach Forza IA</h1>
          <p>Análise inteligente baseada nos seus últimos 30 dias</p>
        </div>

        <div className="coach-tabs">
          {tabs.map(tab => (
            <button key={tab.id} className={`coach-tab ${tab.id === 'coach' ? 'active' : ''}`} onClick={() => handleTabClick(tab)}>
              {tab.nome}
            </button>
          ))}
        </div>

        {/* INSIGHTS E PLANO RECOMENDADO DINÂMICOS */}
        <div className="coach-two-columns">
          <div className="coach-insights">
            <h2>Insights da Semana</h2>
            <div className="coach-insight-grid">
              {getInsightsDinamicos().map((insight, idx) => (
                <div key={idx} className={`coach-insight-card ${insight.type}`}>
                  <span className="insight-title">{insight.icon} {insight.title}</span>
                  <p className="insight-text">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="coach-plan">
            <h2>Plano Recomendado</h2>
            <div className="coach-plan-list">
              {getPlanoRecomendado().map((item, idx) => (
                <div className="coach-plan-row" key={idx}>
                  <span className={`plan-day ${item.classe}`}>{item.dia}</span>
                  <span className="plan-name">{item.nome}</span>
                  <span className={`plan-badge ${item.classe}`}>{item.badge}</span>
                </div>
              ))}
            </div>
            <button className="coach-apply-btn" onClick={() => addNotification('Plano aplicado', 'Seu plano semanal foi sincronizado!', 'success', 'fa-check-circle')}>
              Aplicar ao meu plano
            </button>
          </div>
        </div>

        {/* ========== CHAT ========== */}
        <div className="coach-chat-app">
          {sidebarOpen && (
            <div className="coach-chat-sidebar">
              <div className="coach-chat-sidebar-header">
                <Icons.Logo />
                <button className="coach-chat-icon-btn" onClick={() => setSidebarOpen(false)}>✕</button>
              </div>
              <button className="coach-chat-new-btn" onClick={createNewChat}>
                <Icons.Plus /> Nova conversa
              </button>
              <div className="coach-chat-list">
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    className={`coach-chat-item ${chat.id === activeChatId ? 'active' : ''}`}
                    onClick={() => setActiveChatId(chat.id)}
                  >
                    <Icons.Chat />
                    <span className="coach-chat-item-title">{chat.title}</span>
                    <button className="coach-chat-delete-btn" onClick={(e) => deleteChat(chat.id, e)}>
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
              </div>
              <div className="coach-chat-sidebar-footer">
                <div
                  className="coach-chat-level-badge"
                  data-level={profile?.level}
                  style={{ background: lvl.bg, color: lvl.color, borderColor: lvl.color + '44' }}
                  onClick={() => setLevelModalOpen(true)}
                >
                   {lvl.label}
                </div>
                <p className="coach-chat-user-email">{authUser?.email}</p>
              </div>
            </div>
          )}
          <div className="coach-chat-main">
            <div className="coach-chat-header">
              {!sidebarOpen && (
                <button className="coach-chat-icon-btn" onClick={() => setSidebarOpen(true)}>
                  <Icons.Menu />
                </button>
              )}
              <div className="coach-chat-header-title">
                {!sidebarOpen && <Icons.Logo />}
                <span>{chats.find(c => c.id === activeChatId)?.title || "Coach IA"}</span>
              </div>
            </div>
            <div className="coach-chat-messages">
              {!activeChatId ? (
                <div className="coach-chat-empty-state">
                  <Icons.Logo />
                  <h2 className="coach-chat-empty-title">Olá, {profile?.name || "Atleta"}!</h2>
                  <p className="coach-chat-empty-sub">Crie uma conversa e comece a treinar com o Coach IA.</p>
                  <button className="coach-chat-new-center" onClick={createNewChat}>
                    <Icons.Plus /> Nova conversa
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <div className="coach-chat-empty-state">
                  <p className="coach-chat-empty-sub">Pergunte algo sobre treino, nutrição, saúde ou performance!</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className="coach-chat-message-row"
                    style={{ justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
                  >
                    {msg.role === "assistant" && (
                      <div className="coach-chat-avatar">
                        <img
                          src="/img/forza icon.png"
                          alt="Coach IA"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        />
                      </div>
                    )}
                    <div className={msg.role === "user" ? "coach-chat-bubble-user" : "coach-chat-bubble-assistant"}>
                      <p className="coach-chat-message-text">{msg.content}</p>
                    </div>
                    {msg.role === "user" && (
                      <div className="coach-chat-avatar">
                        <img
                          src={authUser?.avatar || '/img/usuarios/default.jpg'}
                          alt={authUser?.nome || 'Usuário'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                          onError={(e) => { e.target.src = '/img/usuarios/default.jpg' }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
              {loading && (
                <div className="coach-chat-message-row" style={{ justifyContent: "flex-start" }}>
                  <div className="coach-chat-avatar">
                    <img
                      src="/img/forza icon.png"
                      alt="Coach IA"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </div>
                  <div className="coach-chat-bubble-assistant">
                    <div className="coach-chat-typing">
                      <span className="coach-chat-dot"></span>
                      <span className="coach-chat-dot" style={{ animationDelay: "0.15s" }}></span>
                      <span className="coach-chat-dot" style={{ animationDelay: "0.3s" }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="coach-chat-input-area">
              <div className="coach-chat-input-wrap">
                <textarea
                  className="coach-chat-textarea"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte sobre treino, saúde ou performance…"
                  rows={1}
                  disabled={!activeChatId}
                />
                <button
                  className="coach-chat-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim() || loading || !activeChatId}
                >
                  <Icons.Send />
                </button>
              </div>
              <p className="coach-chat-hint">Enter para enviar · Shift+Enter para nova linha</p>
            </div>
          </div>
        </div>
      </div>

      {levelModalOpen && (
        <div className="coach-level-modal-overlay" onClick={() => setLevelModalOpen(false)}>
          <div className="coach-level-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="coach-level-modal-title">Qual é o seu nível?</h2>
            <p className="coach-level-modal-sub">O Coach IA adapta as respostas ao seu perfil.</p>
            {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                className="coach-level-option"
                style={{
                  borderColor: profile?.level === key ? cfg.color : undefined,
                  background: profile?.level === key ? cfg.bg : undefined
                }}
                onClick={() => updateLevel(key)}
              >
                <span style={{ background: cfg.bg, color: cfg.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  {cfg.label}
                </span>
                <span style={{
                  fontSize: 13,
                  color: profile?.level === key ? '#1f2937' : 'var(--text-secondary)'
                }}>
                  {cfg.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default CoachIA;