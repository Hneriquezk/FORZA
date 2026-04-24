import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import './Resumo.css';

function Resumo() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotifications();
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  
  // Dados do plano ativo
  const [planoAtivo, setPlanoAtivo] = useState(null);
  
  // Dados de evolução
  const dadosMensais = {
    meses: ['SET', 'OUT', 'NOV', 'DEZ', 'JAN', 'FEV', 'MAR'],
    valores: [28, 42, 35, 52, 68, 74, 48]
  };
  
  const dadosSemanais = {
    semanas: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'],
    valores: [42, 38, 51, 47, 35]
  };
  
  const metas = {
    distancia: { atual: 142, meta: 200, percentual: 71 },
    atividades: { atual: 18, meta: 25, percentual: 72 },
    calorias: { atual: 12500, meta: 20000, percentual: 63 }
  };

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Carregar plano ativo
    const planoSaved = localStorage.getItem('forza_plano_ativo');
    if (planoSaved) {
      setPlanoAtivo(JSON.parse(planoSaved));
    }
    
    setLoading(false);
  }, [isAuthenticated, navigate]);

  // Desenhar gráfico de evolução semanal
  useEffect(() => {
    if (!canvasRef.current || loading) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    // Definir tamanho do canvas
    const width = container.clientWidth - 40;
    const height = 200;
    canvas.width = width;
    canvas.height = height;
    
    // Limpar canvas
    ctx.clearRect(0, 0, width, height);
    
    if (dadosSemanais.valores.length === 0) return;
    
    const maxValor = Math.max(...dadosSemanais.valores);
    const minY = 30;
    const maxY = height - 30;
    
    // Calcular pontos
    const pontos = dadosSemanais.valores.map((valor, index) => ({
      x: (index / (dadosSemanais.valores.length - 1)) * (width - 60) + 30,
      y: maxY - ((valor - 20) / (maxValor - 20)) * (maxY - minY),
      value: valor
    }));
    
    // Desenhar linha pontilhada
    ctx.beginPath();
    ctx.moveTo(pontos[0].x, pontos[0].y);
    for (let i = 1; i < pontos.length; i++) {
      ctx.lineTo(pontos[i].x, pontos[i].y);
    }
    ctx.strokeStyle = '#ff1e2d';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    
    // Desenhar pontos
    pontos.forEach(p => {
      // Círculo externo
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, 2 * Math.PI);
      ctx.fillStyle = '#ff1e2d';
      ctx.fill();
      
      // Círculo interno branco
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      
      // Valor
      ctx.fillStyle = '#ff1e2d';
      ctx.font = 'bold 11px "Poppins", sans-serif';
      ctx.shadowBlur = 0;
      ctx.fillText(`${p.value}km`, p.x - 18, p.y - 10);
    });
    
    // Resetar linha pontilhada
    ctx.setLineDash([]);
    
  }, [loading, dadosSemanais]);

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
        <div className="resumo-loading">
          <div className="resumo-loading-spinner"></div>
          <p>Carregando resumo...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="resumo-container">
        <div className="resumo-header">
          <h1>Resumo de Treinos</h1>
          <p>Acompanhe sua evolução, metas e estatísticas de desempenho</p>
        </div>

        {/* Tabs */}
        <div className="resumo-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`resumo-tab ${tab.id === 'resumo' ? 'active' : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab.nome}
            </button>
          ))}
        </div>

        {/* Plano Ativo - Se existir */}
        {planoAtivo && (
          <div className="resumo-card plano-ativo-card">
            <h3 style={{ color: 'white' }}>
              <i className="fas fa-running"></i> Plano Ativo: {planoAtivo.nome}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', opacity: 0.7 }}>Meta</div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{planoAtivo.distancia || '5km'}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', opacity: 0.7 }}>Duração</div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{planoAtivo.duracao || '4 semanas'}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', opacity: 0.7 }}>Sessões totais</div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{planoAtivo.sessoes || 12}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', opacity: 0.7 }}>Progresso</div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{planoAtivo.progresso || 0}%</div>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${planoAtivo.progresso || 0}%` }}></div>
            </div>
          </div>
        )}

        <div className="resumo-grid">
          {/* Gráfico de Barras - Distância Mensal */}
          <div className="resumo-card">
            <h3><i className="fas fa-chart-line"></i> Distância Mensal</h3>
            <div className="barras-container">
              {dadosMensais.meses.map((mes, index) => (
                <div key={mes} className="barra-item">
                  <div 
                    className="barra" 
                    style={{ 
                      height: `${(dadosMensais.valores[index] / Math.max(...dadosMensais.valores)) * 100}px`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <div className="barra-valor">{dadosMensais.valores[index]}km</div>
                  <div className="barra-mes">{mes}</div>
                </div>
              ))}
            </div>
            <div className="resumo-total">
              <span>Total acumulado</span>
              <strong>{dadosMensais.valores.reduce((a, b) => a + b, 0)} km</strong>
            </div>
          </div>

          {/* Gráfico de Linha - Evolução Semanal */}
          <div className="resumo-card">
            <h3><i className="fas fa-chart-line"></i> Evolução Semanal</h3>
            <div className="resumo-canvas-wrapper">
              <canvas ref={canvasRef} className="resumo-canvas" style={{ height: '200px', width: '100%' }}></canvas>
            </div>
            <div className="resumo-stats">
              <div className="resumo-stat">
                <div className="resumo-stat-label">Média</div>
                <div className="resumo-stat-value">
                  {(dadosSemanais.valores.reduce((a, b) => a + b, 0) / dadosSemanais.valores.length).toFixed(1)} km
                </div>
              </div>
              <div className="resumo-stat">
                <div className="resumo-stat-label">Pico</div>
                <div className="resumo-stat-value">{Math.max(...dadosSemanais.valores)} km</div>
              </div>
              <div className="resumo-stat">
                <div className="resumo-stat-label">Total</div>
                <div className="resumo-stat-value">{dadosSemanais.valores.reduce((a, b) => a + b, 0)} km</div>
              </div>
            </div>
          </div>
        </div>

        {/* Metas Personalizadas */}
        <div className="resumo-card">
          <h3><i className="fas fa-bullseye"></i> Metas Personalizadas</h3>
          <div className="metas-grid">
            <div className="meta-card">
              <i className="fas fa-road"></i>
              <div>
                <h4>Distância Mensal</h4>
                <div className="meta-valor">{metas.distancia.atual}<span>/{metas.distancia.meta} km</span></div>
                <div className="meta-percentual">{metas.distancia.percentual}%</div>
              </div>
            </div>
            <div className="meta-card">
              <i className="fas fa-calendar-check"></i>
              <div>
                <h4>Atividades</h4>
                <div className="meta-valor">{metas.atividades.atual}<span>/{metas.atividades.meta}</span></div>
                <div className="meta-percentual">{metas.atividades.percentual}%</div>
              </div>
            </div>
            <div className="meta-card">
              <i className="fas fa-fire"></i>
              <div>
                <h4>Calorias</h4>
                <div className="meta-valor">{(metas.calorias.atual / 1000).toFixed(1)}k<span>/{metas.calorias.meta / 1000}k kcal</span></div>
                <div className="meta-percentual">{metas.calorias.percentual}%</div>
              </div>
            </div>
          </div>
        </div>

<br />

        {/* Estatísticas Adicionais */}
        <div className="resumo-grid" style={{ marginTop: '0' }}>
          <div className="resumo-card">
            <h3><i className="fas fa-trophy"></i> Conquistas Recentes</h3>
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: `1px solid var(--border-color)` }}>
                <div style={{ width: '40px', height: '40px', background: '#ffe8e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-star" style={{ color: '#ff1e2d' }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Primeiros 100km</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Concluído em 15/03/2026</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: `1px solid var(--border-color)` }}>
                <div style={{ width: '40px', height: '40px', background: '#ffe8e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-medal" style={{ color: '#ff1e2d' }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>7 dias consecutivos</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Recorde de sequência</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
                <div style={{ width: '40px', height: '40px', background: '#ffe8e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-bolt" style={{ color: '#ff1e2d' }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Melhor tempo 5km</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>25:30 - Novo recorde!</div>
                </div>
              </div>
            </div>
          </div>

          <div className="resumo-card">
            <h3><i className="fas fa-calendar-week"></i> Próximos Treinos</h3>
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid var(--border-color)` }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Corrida Leve</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hoje • 18:00</div>
                </div>
                <div style={{ background: '#ff1e2d', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>5km</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid var(--border-color)` }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Treino Intervalado</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Amanhã • 07:00</div>
                </div>
                <div style={{ background: '#ff1e2d', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>8km</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Longão de Fim de Semana</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sábado • 08:00</div>
                </div>
                <div style={{ background: '#ff1e2d', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>12km</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Resumo;