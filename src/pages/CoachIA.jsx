import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import './CoachIA.css';

function CoachIA() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotifications();
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, text: "Olá! Sou seu assistente inteligente. Posso ajudar com plano de treinos, alimentação, lesões ou performance. Vamos evoluir juntos!", isUser: false, time: "Agora" }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImageTitle, setCurrentImageTitle] = useState('');
  const [currentImageDesc, setCurrentImageDesc] = useState('');

  // Mapeamento de imagens para cada tipo de resposta
  const imagensRespostas = {
    plano: {
      img: "/img/plano_semanal.jpg",
      title: "Plano Semanal Personalizado",
      description: "Seu plano de treinos para a semana! Siga o Coach IA e evolua cada dia."
    },
    joelho: {
      img: "/img/dor_joelho.jpg",
      title: "Prevenção de Lesões no Joelho",
      description: "Fortalecimento e cuidados essenciais para corredores."
    },
    alimentacao: {
      img: "/img/alimentacao.jpg",
      title: "Nutrição para Performance",
      description: "Alimentação correta antes e depois dos treinos."
    },
    fortalecimento: {
      img: "/img/fortalecimento.jpg",
      title: "Treino de Fortalecimento",
      description: "Fortaleça glúteos, core e pernas para correr com mais eficiência."
    },
    vo2: {
      img: "/img/vo2.png",
      title: "Melhorando seu VO2 Máximo",
      description: "Treinos intervalados e de ritmo são os segredos para aumentar sua capacidade."
    },
    lesao: {
      img: "/img/prevencao_lesoes.jpg",
      title: "Prevenção de Lesões",
      description: "Cuidados essenciais para manter sua performance sem lesões."
    },
    recuperacao: {
      img: "/img/recuperacao.jpg",
      title: "Recuperação Pós-Treino",
      description: "Estratégias eficazes para uma recuperação completa."
    },
    padrao: {
      img: "/img/coach_default.png",
      title: "Coach Forza IA",
      description: "Dica personalizada para sua evolução."
    }
  };

  const respostas = {
    plano: "📅 **Plano Semanal Personalizado**\n\n**Planejamento Semanal: Foco em Pace Sub-5**\n\n• **SEG** - Natação (Roupador): 1500 a 2000m Foco em técnica\n• **TER** - Intervalo de Velocidade: 8x 400m @ 4:40-4:45/km\n• **QUA** - Natação (Recreativo): 45min - 1500m Nadando\n• **QUI** - Rodagem 12km + Striders: 6x 100m Striders\n• **SEX** - Futsal/tennis/futebol: 1 hora de atividade recreativa\n• **SAB** - Treino de Ritmo: 8km a 4:55 - 4:58/km\n• **DOM** - Longão Progressivo: 14-16km últimos 5km @ 5:10\n\n**'O Pulo do Galo': 178**\nCadência ideal: 175-180 rpm\n\n**Ajuste na Natação:** Natação Limpa o Lactato Pós-Treino\n\n**Meta de Volume:** 58km/semana\n\n**Dica de Performance:** Carboidratos Complexos 2h Antes do Treino\n**Streak de 12 Dias**\n\n> \"Seu plano de treinos para a semana! Siga o Coach IA e evolua cada dia.\"",
    joelho: "🦵 **Sobre a dor no joelho**\n\nAqui estão algumas recomendações:\n\n1️⃣ **Fortalecimento:** Glúteo médio, quadríceps e posterior\n2️⃣ **Descanso ativo:** Substitua corrida por natação ou bike\n3️⃣ **Gelo pós-treino:** Aplique por 15 minutos\n4️⃣ **Aumente cadência:** 170-180 passos/minuto\n5️⃣ **Alongamento:** Isquiotibiais e panturrilhas\n\n⚠️ Se a dor persistir, consulte um especialista!",
    alimentacao: "🥗 **Nutrição para longão**\n\n**Pré-treino (2h antes):**\n✅ Carboidratos: aveia, banana, batata-doce\n\n**Pós-treino (até 1h):**\n✅ Proteínas: frango, ovos, whey\n✅ Carboidratos: arroz integral, macarrão\n\n**Hidratação:**\n💧 2,5L/dia + reposição de eletrólitos\n\n**Suplementos recomendados:**\n🥤 BCAA, Whey Protein, Creatina",
    fortalecimento: "💪 **Treino de fortalecimento para corredores**\n\n**Circuito (3x por semana):**\n\n1️⃣ **Agachamento búlgaro** - 3x10 cada perna\n2️⃣ **Prancha com elevação** - 3x30 segundos\n3️⃣ **Elevação pélvica** - 3x12 repetições\n4️⃣ **Panturrilha em degrau** - 3x20 repetições\n5️⃣ **Afundo lateral** - 3x10 cada lado\n6️⃣ **Stiff unilateral** - 3x10 cada perna\n\n🔥 Faça após os treinos de corrida!",
    vo2: "📊 **Como melhorar seu VO2 máximo**\n\n**Treinos recomendados:**\n\n🏁 **Intervalados:** 4x4min (85-95% FC máx)\n🏃‍♂️ **Tempo runs:** 20-30min (80-85% FC máx)\n🌄 **Treinos em aclive:** 6-8 tiros de 200m\n\n**Frequência:** 1-2x por semana\n\n**Benefícios:**\n✅ Aumenta resistência\n✅ Melhora performance\n✅ Recuperação mais rápida",
    lesao: "🏥 **Prevenção de lesões**\n\n**Cuidados essenciais:**\n\n1️⃣ **Aquecimento:** 10-15min antes de cada treino\n2️⃣ **Alongamento dinâmico:** Mobilidade articular\n3️⃣ **Fortalecimento muscular:** 2-3x/semana\n4️⃣ **Descanso adequado:** 1-2 dias/semana\n5️⃣ **Tênis adequado:** Troque a cada 500-800km\n\n**Sinais de alerta:**\n⚠️ Dor persistente\n⚠️ Inchaço\n⚠️ Perda de amplitude\n\nProcure um profissional se necessário!",
    recuperacao: "🔄 **Recuperação pós-treino**\n\n**Estratégias eficazes:**\n\n🧊 **Crioterapia:** Banho gelado por 10min\n💆‍♂️ **Massagem:** Liberação miofascial\n😴 **Sono:** 7-8h por noite\n🥤 **Nutrição:** Janela de 1h pós-treino\n🧘 **Alongamento:** 10-15min suave\n\n**Ferramentas:**\n✅ Rolo de espuma\n✅ Bola de massagem\n✅ Banda elástica"
  };

  const sugestoes = [
    { label: "Plano recomendado", pergunta: "plano", key: "plano" },
    { label: "Dor no joelho ao correr", pergunta: "joelho", key: "joelho" },
    { label: "Alimentação para longão", pergunta: "alimentação", key: "alimentacao" },
    { label: "Treino de fortalecimento", pergunta: "fortalecimento", key: "fortalecimento" },
    { label: "Como melhorar meu VO2?", pergunta: "vo2", key: "vo2" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const historicoSalvo = localStorage.getItem('coachConversa');
    if (historicoSalvo) {
      try {
        const historico = JSON.parse(historicoSalvo);
        if (historico.length > 0) {
          setMessages(historico);
        }
      } catch (e) {}
    }
    
    setLoading(false);
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      localStorage.setItem('coachConversa', JSON.stringify(messages));
    }
  }, [messages, loading]);

  const getRespostaKey = (pergunta) => {
    const textoLower = pergunta.toLowerCase();
    
    if (textoLower.includes("plano") || textoLower.includes("semanal") || textoLower.includes("treino")) 
      return { key: "plano", resposta: respostas.plano };
    if (textoLower.includes("joelho") || (textoLower.includes("dor") && textoLower.includes("joelho"))) 
      return { key: "joelho", resposta: respostas.joelho };
    if (textoLower.includes("alimentação") || textoLower.includes("nutrição") || textoLower.includes("comida") || textoLower.includes("dieta")) 
      return { key: "alimentacao", resposta: respostas.alimentacao };
    if (textoLower.includes("fortalecimento") || textoLower.includes("musculação") || textoLower.includes("força")) 
      return { key: "fortalecimento", resposta: respostas.fortalecimento };
    if (textoLower.includes("vo2") || textoLower.includes("capacidade") || textoLower.includes("resistência")) 
      return { key: "vo2", resposta: respostas.vo2 };
    if (textoLower.includes("lesão") || textoLower.includes("prevenir") || textoLower.includes("cuidado")) 
      return { key: "lesao", resposta: respostas.lesao };
    if (textoLower.includes("recuperação") || textoLower.includes("descanso") || textoLower.includes("pós")) 
      return { key: "recuperacao", resposta: respostas.recuperacao };
    
    return { key: "padrao", resposta: "📌 **Resposta do Coach:**\n\nExcelente pergunta! Com base no seu perfil, recomendo focar na periodização atual. Continue consistente e os resultados virão! 💪\n\nQue tal me perguntar sobre:\n• Plano semanal\n• Prevenção de lesões\n• Nutrição para treinos\n• Fortalecimento específico" };
  };

  const mostrarImagem = (key) => {
    const imagemInfo = imagensRespostas[key] || imagensRespostas.padrao;
    setCurrentImage(imagemInfo.img);
    setCurrentImageTitle(imagemInfo.title);
    setCurrentImageDesc(imagemInfo.description);
    setShowImageModal(true);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const novaMensagem = { 
      id: Date.now(), 
      text: inputText, 
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, novaMensagem]);
    setIsTyping(true);
    
    const { key, resposta } = getRespostaKey(inputText);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: resposta, 
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responseKey: key
      }]);
      setIsTyping(false);
    }, 800);
    
    setInputText('');
  };

  const handleSuggestionClick = (sug) => {
    setInputText(sug.pergunta);
    setTimeout(() => handleSend(), 100);
  };

  const limparConversa = async () => {
    const confirmed = await window.confirm('Deseja limpar todo o histórico da conversa?')
    if (confirmed) {
      setMessages([{
        id: 1, 
        text: "Olá! Sou seu assistente inteligente. Posso ajudar com plano de treinos, alimentação, lesões ou performance. Vamos evoluir juntos!", 
        isUser: false, 
        time: "Agora"
      }])
      localStorage.removeItem('coachConversa')
      addNotification('Conversa limpa', 'Histórico da conversa foi removido!', 'info', 'fa-trash-alt')
    }
  };

  const tabs = [
    { id: 'planos', nome: 'Planos', rota: '/planos' },
    { id: 'coach', nome: 'Coach IA', rota: '/coach' },
    { id: 'analise', nome: 'Análise', rota: '/analise' },
    { id: 'resumo', nome: 'Resumo', rota: '/resumo' }
  ];

  const handleTabClick = (tab) => {
    navigate(tab.rota);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="coach-loading">
          <div className="coach-loading-spinner"></div>
          <p>Carregando Coach IA...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="coach-container">
        <div className="coach-header">
          <h1>Coach Forza IA</h1>
          <p>Análise inteligente baseada nos seus últimos 30 dias</p>
        </div>

        {/* Tabs */}
        <div className="coach-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`coach-tab ${tab.id === 'coach' ? 'active' : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab.nome}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="coach-stats-grid">
          <div className="coach-stat-card">
            <span className="coach-stat-label">FC repouso</span>
            <div className="coach-stat-value">62 <span className="coach-stat-unit">bpm</span></div>
            <div className="coach-stat-bar"><span style={{ width: '62%' }}></span></div>
          </div>
          <div className="coach-stat-card">
            <span className="coach-stat-label">VO₂ Máx.</span>
            <div className="coach-stat-value">46.5</div>
            <div className="coach-stat-bar"><span style={{ width: '63%', background: '#f59e0b' }}></span></div>
          </div>
          <div className="coach-stat-card">
            <span className="coach-stat-label">Performance</span>
            <div className="coach-stat-value">343</div>
            <div className="coach-stat-bar"><span style={{ width: '68%', background: '#3b82f6' }}></span></div>
          </div>
          <div className="coach-stat-card">
            <span className="coach-stat-label">Forma geral</span>
            <div className="coach-stat-value">78<span className="coach-stat-unit">/100</span></div>
            <div className="coach-stat-bar"><span style={{ width: '78%' }}></span></div>
          </div>
        </div>

        {/* Two Columns */}
        <div className="coach-two-columns">
          <div className="coach-insights">
            <h2>Insights da Semana</h2>
            <div className="coach-insight-grid">
              <div className="coach-insight-card blue">
                <span className="insight-title">💡 Dica</span>
                <p className="insight-text">Sua frequência cardíaca em repouso caiu <strong>3bpm</strong> este mês — ótimo sinal de adaptação cardiovascular!</p>
              </div>
              <div className="coach-insight-card red">
                <span className="insight-title">⚠️ Alerta</span>
                <p className="insight-text">Você não descansou nos últimos 5 dias. Recomendo um dia de recuperação ativa amanhã.</p>
              </div>
              <div className="coach-insight-card green">
                <span className="insight-title">🎯 Meta</span>
                <p className="insight-text">Para atingir sua meta de <strong>200km</strong>, você precisa correr em média <strong>7.3km/dia</strong> nos próximos 8 dias.</p>
              </div>
              <div className="coach-insight-card orange">
                <span className="insight-title">🏆 Dica Performance</span>
                <p className="insight-text">Seus treinos intervalados estão <strong>12% mais rápidos</strong> que há 3 semanas. Continue assim!</p>
              </div>
            </div>
          </div>

          <div className="coach-plan">
            <h2>Plano Recomendado</h2>
            <div className="coach-plan-list">
              <div className="coach-plan-row">
                <span className="plan-day intense">SEG</span>
                <span className="plan-name">Fartlek 40min — zona 3-4</span>
                <span className="plan-badge intense">Intenso</span>
              </div>
              <div className="coach-plan-row">
                <span className="plan-day support">TER</span>
                <span className="plan-name">Fortalecimento de core + mobilidade 30min</span>
                <span className="plan-badge support">Suporte</span>
              </div>
              <div className="coach-plan-row">
                <span className="plan-day recovery">QUA</span>
                <span className="plan-name">Descanso ativo — caminhada leve ou yoga</span>
                <span className="plan-badge recovery">Recuperação</span>
              </div>
              <div className="coach-plan-row">
                <span className="plan-day intense">QUI</span>
                <span className="plan-name">Tempo run 6km @ 5:00/km</span>
                <span className="plan-badge intense">Intenso</span>
              </div>
              <div className="coach-plan-row">
                <span className="plan-day cross">SEX</span>
                <span className="plan-name">Natação técnica 45min</span>
                <span className="plan-badge cross">Cross</span>
              </div>
              <div className="coach-plan-row">
                <span className="plan-day endurance">SAB</span>
                <span className="plan-name">Long run 14km zona 2</span>
                <span className="plan-badge endurance">Resistência</span>
              </div>
              <div className="coach-plan-row">
                <span className="plan-day recovery">DOM</span>
                <span className="plan-name">Descanso total</span>
                <span className="plan-badge recovery">Recuperação</span>
              </div>
            </div>
            <button className="coach-apply-btn" onClick={() => addNotification('Plano aplicado', 'Seu plano semanal foi sincronizado!', 'success', 'fa-check-circle')}>
              Aplicar ao meu plano
            </button>
          </div>
        </div>

        {/* Chat Section */}
        <div className="coach-chat-section">
          <div className="coach-chat-card">
            <div className="coach-chat-header">
              <div className="coach-chat-header-info">
                <div className="coach-avatar">
                  <i className="fas fa-brain"></i>
                </div>
                <div>
                  <h3>Fale com o Coach</h3>
                  <span>Online • IA Esportiva</span>
                </div>
              </div>
              <button className="coach-clear-btn" onClick={limparConversa}>
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>

            <div className="coach-chat-messages">
              <div className="coach-welcome">
                <div className="coach-welcome-avatar">
                  <i className="fas fa-brain"></i>
                </div>
                <div className="coach-welcome-text">
                  <h4>Olá, atleta 😊</h4>
                  <p>Sou seu Coach IA pessoal. Pergunte sobre treinos, nutrição ou desempenho.</p>
                </div>
              </div>
              
              {messages.map(msg => (
                <div key={msg.id} className={`coach-message ${msg.isUser ? 'user' : 'coach'}`}>
                  <div className="coach-message-avatar">
                    {msg.isUser ? <i className="fas fa-user"></i> : <i className="fas fa-brain"></i>}
                  </div>
                  <div className="coach-message-bubble">
                    <div className="coach-message-text">
                      {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                    </div>
                    <div className="coach-message-time">{msg.time}</div>
                    {!msg.isUser && msg.responseKey && msg.responseKey !== 'padrao' && (
                      <button 
                        className="coach-image-btn"
                        onClick={() => mostrarImagem(msg.responseKey)}
                      >
                        <i className="fas fa-image"></i> Ver imagem ilustrativa
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="coach-message coach">
                  <div className="coach-message-avatar"><i className="fas fa-brain"></i></div>
                  <div className="coach-message-bubble">
                    <div className="coach-typing"><span></span><span></span><span></span></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="coach-suggestions">
              {sugestoes.map(sug => (
                <button key={sug.pergunta} className="coach-suggestion-btn" onClick={() => handleSuggestionClick(sug)}>
                  {sug.label}
                </button>
              ))}
            </div>

            <div className="coach-input-area">
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Digite sua pergunta..." className="coach-input" />
              <button onClick={handleSend} className="coach-send-btn"><i className="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Imagem */}
      {showImageModal && currentImage && (
        <div className="coach-image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="coach-image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="coach-image-modal-header">
              <h3>{currentImageTitle}</h3>
              <button className="coach-image-modal-close" onClick={() => setShowImageModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="coach-image-modal-body">
              <img src={currentImage} alt={currentImageTitle} className="coach-modal-image" />
              <p className="coach-image-description">{currentImageDesc}</p>
              <button className="coach-image-modal-btn" onClick={() => setShowImageModal(false)}>
                <i className="fas fa-check"></i> Entendi, vamos treinar!
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default CoachIA;