import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import './Analise.css';

function Analise() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('SEG');
  const [treinosCompletados, setTreinosCompletados] = useState({});

  const treinosPorDia = {
    SEG: { 
      nome: "Fartlek 40min", 
      tags: ['CORRIDA', 'INTENSO'], 
      descricao: "Alternar ritmo: 3min forte / 2min moderado", 
      info: "40min • 380 kcal",
      intensidade: 80
    },
    TER: { 
      nome: "Fortalecimento Core 30min", 
      tags: ['FORTALECIMENTO', 'MOBILIDADE'], 
      descricao: "Prancha, abdominais, ponte", 
      info: "30min • 180 kcal",
      intensidade: 60
    },
    QUA: { 
      nome: "Descanso Ativo", 
      tags: ['RECUPERAÇÃO', 'CAMINHADA'], 
      descricao: "Caminhada leve 30min", 
      info: "30min • 100 kcal",
      intensidade: 30
    },
    QUI: { 
      nome: "Tempo Run 6km", 
      tags: ['CORRIDA', 'RITMO'], 
      descricao: "6km em ritmo 5:00/km", 
      info: "30min • 420 kcal",
      intensidade: 75
    },
    SEX: { 
      nome: "Natação Técnica", 
      tags: ['NATAÇÃO', 'TÉCNICA'], 
      descricao: "Foco em técnica", 
      info: "45min • 350 kcal",
      intensidade: 65
    },
    SAB: { 
      nome: "Long Run 14km", 
      tags: ['CORRIDA', 'RESISTÊNCIA'], 
      descricao: "Pace conversacional", 
      info: "1h20min • 980 kcal",
      intensidade: 90
    },
    DOM: { 
      nome: "Descanso Total", 
      tags: ['RECUPERAÇÃO', 'DESCANSO'], 
      descricao: "Alongamentos leves", 
      info: "- • 0 kcal",
      intensidade: 0
    }
  };

  // Função para determinar a cor da intensidade
  const getIntensidadeCor = (intensidade) => {
    if (intensidade >= 75) return '#ff1e2d'; // Vermelho
    if (intensidade >= 60) return '#dbdb00'; // Amarelo
    return '#059669'; // Verde
  };

  // Função para determinar o texto da intensidade
  const getIntensidadeTexto = (intensidade) => {
    if (intensidade >= 75) return 'Alta';
    if (intensidade >= 60) return 'Média';
    return 'Baixa';
  };

  const dias = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
  const treino = treinosPorDia[activeDay];

  // Metas do mês
  const metas = {
    distancia: { atual: 74, meta: 100, percentual: 74 },
    atividades: { atual: 13, meta: 18, percentual: 72 },
    tempo: { atual: 12.5, meta: 18, percentual: 69 },
    calorias: { atual: 8420, meta: 12000, percentual: 70 }
  };

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Carregar treinos completados do localStorage
    const savedTreinos = localStorage.getItem('treinosCompletados');
    if (savedTreinos) {
      setTreinosCompletados(JSON.parse(savedTreinos));
    }
    
    setLoading(false);
  }, [isAuthenticated, navigate]);

  const tabs = [
    { id: 'planos', nome: 'Planos', rota: '/planos' },
    { id: 'coach', nome: 'Coach IA', rota: '/coach' },
    { id: 'analise', nome: 'Análise', rota: '/analise' },
    { id: 'resumo', nome: 'Resumo', rota: '/resumo' }
  ];

  const handleTabClick = (tab) => {
    navigate(tab.rota);
  };

  const marcarTreinoComoCompletado = (dia) => {
    const novoEstado = {
      ...treinosCompletados,
      [dia]: !treinosCompletados[dia]
    };
    
    setTreinosCompletados(novoEstado);
    localStorage.setItem('treinosCompletados', JSON.stringify(novoEstado));
    
    if (!treinosCompletados[dia]) {
      addNotification('✅ Treino concluído!', `Você completou o treino de ${dia}-feira! Continue assim! 🎉`, 'success', 'fa-check-circle');
    } else {
      addNotification('↩️ Treino desmarcado', `Treino de ${dia}-feira foi desmarcado.`, 'info', 'fa-undo');
    }
  };

  const isTreinoCompletado = (dia) => {
    return treinosCompletados[dia] || false;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="analise-loading">
          <div className="analise-loading-spinner"></div>
          <p>Carregando análise...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="analise-container">
        <div className="analise-header">
          <h1>Análise de Desempenho</h1>
          <p>Acompanhe seu progresso diário, metas e estatísticas de treino</p>
        </div>

        {/* Tabs */}
        <div className="analise-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`analise-tab ${tab.id === 'analise' ? 'active' : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab.nome}
            </button>
          ))}
        </div>

        <div className="analise-grid-2col">
          {/* Coluna Esquerda */}
          <div className="analise-col-left">
            {/* Dias da Semana */}
            <div className="analise-card">
              <h3><i className="fas fa-calendar-week"></i> Dias da Semana</h3>
              <div className="analise-days">
                {dias.map(dia => (
                  <button
                    key={dia}
                    className={`analise-day-btn ${activeDay === dia ? 'active' : ''} ${isTreinoCompletado(dia) ? 'completed' : ''}`}
                    onClick={() => setActiveDay(dia)}
                  >
                    {dia}
                    {isTreinoCompletado(dia) && <i className="fas fa-check-circle"></i>}
                  </button>
                ))}
              </div>
            </div>

            {/* Treino do Dia */}
            <div className="analise-card">
              <h3><i className="fas fa-calendar-day"></i> {activeDay}-feira</h3>
              <p className="analise-treino-nome">{treino.nome}</p>
              <div className="analise-tags">
                {treino.tags.map(tag => (
                  <span key={tag} className={`analise-tag ${tag === 'INTENSO' || tag === 'RITMO' || tag === 'RESISTÊNCIA' ? 'tag-intenso' : tag === 'RECUPERAÇÃO' ? 'tag-recuperacao' : 'tag-normal'}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <p className="analise-treino-descricao">{treino.descricao}</p>
              <div className="analise-treino-info">
                <i className="fas fa-clock"></i> {treino.info}
              </div>
              
              {treino.intensidade > 0 && (
                <div className="analise-intensidade">
                  <div className="analise-intensidade-header">
                    <span>Intensidade</span>
                    <span className={`intensidade-label ${getIntensidadeTexto(treino.intensidade).toLowerCase()}`}>
                      {getIntensidadeTexto(treino.intensidade)}
                    </span>
                  </div>
                  <div className="analise-intensidade-bar">
                    <div 
                      className="analise-intensidade-fill" 
                      style={{ 
                        width: `${treino.intensidade}%`,
                        background: getIntensidadeCor(treino.intensidade)
                      }}
                    ></div>
                  </div>
                  <span className="analise-intensidade-valor">{treino.intensidade}%</span>
                </div>
              )}
              
              <button 
                className={`analise-btn-completar ${isTreinoCompletado(activeDay) ? 'completado' : ''}`}
                onClick={() => marcarTreinoComoCompletado(activeDay)}
              >
                {isTreinoCompletado(activeDay) ? (
                  <><i className="fas fa-check-circle"></i> Treino Concluído</>
                ) : (
                  <><i className="far fa-circle"></i> Marcar como Concluído</>
                )}
              </button>
            </div>

            {/* Metas do Mês */}
            <div className="analise-card">
              <h3><i className="fas fa-bullseye"></i> Metas do Mês</h3>
              
              <div className="analise-meta-item">
                <div className="analise-meta-header">
                  <span><i className="fas fa-road"></i> Distância</span>
                  <span>{metas.distancia.atual}km / {metas.distancia.meta}km</span>
                </div>
                <div className="analise-progress-bar">
                  <div className="analise-progress-fill" style={{ width: `${metas.distancia.percentual}%` }}></div>
                </div>
              </div>
              
              <div className="analise-meta-item">
                <div className="analise-meta-header">
                  <span><i className="fas fa-calendar-check"></i> Atividades</span>
                  <span>{metas.atividades.atual} / {metas.atividades.meta}</span>
                </div>
                <div className="analise-progress-bar">
                  <div className="analise-progress-fill" style={{ width: `${metas.atividades.percentual}%` }}></div>
                </div>
              </div>
              
              <div className="analise-meta-item">
                <div className="analise-meta-header">
                  <span><i className="fas fa-hourglass-half"></i> Tempo total</span>
                  <span>{metas.tempo.atual}h / {metas.tempo.meta}h</span>
                </div>
                <div className="analise-progress-bar">
                  <div className="analise-progress-fill" style={{ width: `${metas.tempo.percentual}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="analise-col-right">
            {/* Progresso Geral */}
            <div className="analise-card text-center">
              <h3><i className="fas fa-chart-pie"></i> Progresso Geral</h3>
              <div className="analise-progress-circle">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="var(--progress-bg)" strokeWidth="10"/>
                  <circle 
                    cx="70" cy="70" r="60" 
                    fill="none" 
                    stroke="#ff1e2d" 
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - 0.17)}
                    transform="rotate(-90 70 70)"
                  />
                </svg>
                <div className="analise-progress-percent">17%</div>
              </div>
              <p>Meta de intensidade</p>
              <div className="analise-progress-stats">
                <div><span>🔥</span> 1.240 kcal</div>
                <div><span>🏃</span> 8 treinos</div>
              </div>
            </div>

            {/* Resumo do Mês */}
            <div className="analise-card">
              <h3><i className="fas fa-chart-line"></i> Resumo do Mês</h3>
              
              <div className="analise-resumo-item">
                <div className="analise-resumo-header">
                  <span><i className="fas fa-stopwatch"></i> Tempo total</span>
                  <span>{metas.tempo.atual}h / {metas.tempo.meta}h</span>
                </div>
                <div className="analise-progress-bar small">
                  <div className="analise-progress-fill" style={{ width: `${metas.tempo.percentual}%` }}></div>
                </div>
              </div>
              
              <div className="analise-resumo-item">
                <div className="analise-resumo-header">
                  <span><i className="fas fa-road"></i> Distância total</span>
                  <span>{metas.distancia.atual}km / {metas.distancia.meta}km</span>
                </div>
                <div className="analise-progress-bar small">
                  <div className="analise-progress-fill" style={{ width: `${metas.distancia.percentual}%` }}></div>
                </div>
              </div>
              
              <div className="analise-resumo-item">
                <div className="analise-resumo-header">
                  <span><i className="fas fa-fire"></i> Calorias</span>
                  <span>{metas.calorias.atual.toLocaleString()} / {metas.calorias.meta.toLocaleString()} kcal</span>
                </div>
                <div className="analise-progress-bar small">
                  <div className="analise-progress-fill" style={{ width: `${metas.calorias.percentual}%` }}></div>
                </div>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="analise-card">
              <h3><i className="fas fa-chart-simple"></i> Estatísticas</h3>
              <div className="analise-stats-grid">
                <div className="analise-stat-item">
                  <div className="analise-stat-value">5:48</div>
                  <div className="analise-stat-label">Ritmo médio</div>
                </div>
                <div className="analise-stat-item">
                  <div className="analise-stat-value">148</div>
                  <div className="analise-stat-label">BPM médio</div>
                </div>
                <div className="analise-stat-item">
                  <div className="analise-stat-value">48.2</div>
                  <div className="analise-stat-label">VO2 Max</div>
                </div>
                <div className="analise-stat-item">
                  <div className="analise-stat-value">12</div>
                  <div className="analise-stat-label">Dias ativos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Analise;