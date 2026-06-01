import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const Planos = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [selectedPlano, setSelectedPlano] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planoAtivo, setPlanoAtivo] = useState(null);

  // Carregar plano ativo do localStorage
  const loadPlanoAtivo = () => {
    const planoAtivoRaw = localStorage.getItem('forza_plano_ativo');
    if (planoAtivoRaw) {
      try {
        const plano = JSON.parse(planoAtivoRaw);
        setPlanoAtivo(plano);
      } catch (e) {
        console.error('Erro ao carregar plano ativo:', e);
      }
    } else {
      setPlanoAtivo(null);
    }
  };

  // Buscar planos do Supabase
  useEffect(() => {
    const fetchPlanos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .order('ordem', { ascending: true });
      if (error) {
        console.error('Erro ao carregar planos:', error);
        addNotification('Erro', 'Não foi possível carregar os planos.', 'error');
      } else {
        setPlanos(data);
      }
      setLoading(false);
    };
    fetchPlanos();
    loadPlanoAtivo();
  }, [addNotification]);

  const handleIniciarPlano = async (plano) => {
    const confirmed = await window.confirm(
      `Deseja iniciar o plano "${plano.nome}"?\n\nSeus treinos serão sincronizados com o Coach IA para acompanhamento personalizado.`
    );
    if (confirmed) {
      // Salva plano ativo
      const planoAtivoObj = {
        id: plano.id,
        nome: plano.nome,
        dataInicio: new Date().toISOString(),
        progresso: 0,
        sessoesCompletadas: 0,
      };
      localStorage.setItem('forza_plano_ativo', JSON.stringify(planoAtivoObj));

      // Flag para o Coach IA criar um chat específico sobre este plano
      localStorage.setItem(
        'forza_plano_pendente_chat',
        JSON.stringify({
          planoId: plano.id,
          planoNome: plano.nome,
          descricao: plano.descricao,
          duracao: plano.duracao,
          sessoes: plano.sessoes,
        })
      );

      setPlanoAtivo(planoAtivoObj);
      addNotification(
        'Plano iniciado',
        `Você começou o plano "${plano.nome}". Acesse o Coach IA para acompanhar!`,
        'success',
        'fa-play'
      );
      setTimeout(() => navigate('/coach'), 1500);
    }
  };

  const handlePararPlano = async () => {
    const confirmed = await window.confirm(
      `Tem certeza que deseja parar o plano "${planoAtivo?.nome}"?\n\nSeu progresso será perdido.`
    );
    if (confirmed) {
      localStorage.removeItem('forza_plano_ativo');
      localStorage.removeItem('forza_plano_pendente_chat');
      setPlanoAtivo(null);
      addNotification(
        'Plano interrompido',
        `Você parou o plano. Que tal começar um novo?`,
        'info',
        'fa-stop'
      );
    }
  };

  const verDetalhes = (plano) => {
    setSelectedPlano(plano);
    setShowModal(true);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <i className="fas fa-spinner fa-pulse fa-3x" style={{ color: '#ff1e2d' }}></i>
          <p>Carregando planos...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container">
        <div className="planos-header">
          <h1>Planos de Treinamento</h1>
          <p>Treinos inteligentes para levar sua performance ao próximo nível</p>
          {planoAtivo && (
            <div className="plano-ativo-banner">
              <i className="fas fa-running"></i> Você está no plano: <strong>{planoAtivo.nome}</strong>
              <button className="btn-stop-plan" onClick={handlePararPlano}>
                <i className="fas fa-stop"></i> Parar plano
              </button>
            </div>
          )}
        </div>

        <div className="planos-tabs">
          <button className="planos-tab active">Planos</button>
          <button className="planos-tab" onClick={() => navigate('/coach')}>Coach IA</button>
          <button className="planos-tab" onClick={() => navigate('/analise')}>Análise</button>
        </div>

        <div className="plans-grid">
          {planos.map((plano) => {
            const isActive = planoAtivo?.id === plano.id;
            return (
              <div key={plano.id} className={`plan-card-modern ${isActive ? 'active-plan' : ''}`}>
                <div className="card-header-plan">
                  <div className={`card-badge ${plano.badge_class}`}>
                    <i className={`fas ${plano.icon}`}></i> {plano.nivel}
                  </div>
                  <div className="run-icon" style={{ background: `linear-gradient(135deg, ${plano.cor}, ${plano.cor}cc)` }}>
                    <i className="fas fa-person-running"></i>
                  </div>
                  <h2 className="card-title">{plano.nome}</h2>
                  <div className="card-distance">
                    <i className="fas fa-flag-checkered"></i> Meta: {plano.distancia}
                    <i className="fas fa-calendar-alt" style={{ marginLeft: 'auto' }}></i> {plano.duracao}
                  </div>
                </div>

                <div className="card-body-plan">
                  <p className="card-description">{plano.descricao}</p>
                  <div className="card-stats">
                    <div className="stat-item">
                      <div className="stat-value">{plano.sessoes}</div>
                      <div className="stat-label">Sessões</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{plano.sessoes_por_semana}x</div>
                      <div className="stat-label">Por semana</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">{plano.tempo_medio}</div>
                      <div className="stat-label">Médio</div>
                    </div>
                  </div>
                  <div className="card-benefits">
                    {plano.beneficios?.slice(0, 3).map((beneficio, idx) => (
                      <div key={idx} className="benefit">
                        <i className="fas fa-check-circle"></i> {beneficio}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-footer-plan">
                  <button className="btn-details" onClick={() => verDetalhes(plano)}>
                    <i className="fas fa-info-circle"></i> Detalhes
                  </button>
                  {isActive ? (
                    <button className="btn-stop" onClick={handlePararPlano}>
                      <i className="fas fa-stop"></i> Parar
                    </button>
                  ) : (
                    <button className="btn-start" onClick={() => handleIniciarPlano(plano)}>
                      <i className="fas fa-play"></i> Começar
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Plano Personalizado IA */}
          <div className="plan-card-modern custom-plan">
            <div className="card-header-plan">
              <div className="card-badge" style={{ background: 'rgba(255,30,45,0.2)', color: '#ff1e2d' }}>
                <i className="fas fa-robot"></i> IA Powered
              </div>
              <div className="run-icon" style={{ background: 'linear-gradient(135deg, #ff1e2d, #b91c2c)' }}>
                <i className="fas fa-brain"></i>
              </div>
              <h2 className="card-title" style={{ color: 'white' }}>Plano<br />Personalizado</h2>
              <div className="card-distance" style={{ color: '#94a3b8' }}>
                <i className="fas fa-flag-checkered"></i> Sob medida
                <i className="fas fa-infinity" style={{ marginLeft: 'auto' }}></i>
              </div>
            </div>
            <div className="card-body-plan">
              <p className="card-description" style={{ color: '#cbd5e1' }}>
                Conte para o Coach IA seus objetivos, nível e disponibilidade. Ele criará um plano 100% personalizado para você!
              </p>
              <div className="card-stats" style={{ borderColor: '#334155' }}>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: '#ff1e2d' }}>IA</div>
                  <div className="stat-label" style={{ color: '#94a3b8' }}>Inteligência</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: '#ff1e2d' }}>✓</div>
                  <div className="stat-label" style={{ color: '#94a3b8' }}>Adaptativo</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: '#ff1e2d' }}>24/7</div>
                  <div className="stat-label" style={{ color: '#94a3b8' }}>Suporte</div>
                </div>
              </div>
              <div className="card-benefits">
                <div className="benefit" style={{ color: '#cbd5e1' }}>
                  <i className="fas fa-check-circle" style={{ color: '#ff1e2d' }}></i> Baseado no seu desempenho
                </div>
                <div className="benefit" style={{ color: '#cbd5e1' }}>
                  <i className="fas fa-check-circle" style={{ color: '#ff1e2d' }}></i> Ajustes automáticos
                </div>
                <div className="benefit" style={{ color: '#cbd5e1' }}>
                  <i className="fas fa-check-circle" style={{ color: '#ff1e2d' }}></i> Análise de dados em tempo real
                </div>
              </div>
            </div>
            <div className="card-footer-plan" style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#334155' }}>
              <button className="btn-start" style={{ flex: 1 }} onClick={() => navigate('/coach')}>
                <i className="fas fa-comment-dots"></i> Falar com Coach IA
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Detalhes */}
        {showModal && selectedPlano && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ background: `linear-gradient(135deg, ${selectedPlano.cor}, ${selectedPlano.cor}dd)` }}>
                <h3>{selectedPlano.nome}</h3>
                <button className="close-modal" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                <p>{selectedPlano.descricao}</p>
                <div className="modal-stats">
                  <div><strong>Sessões:</strong> {selectedPlano.sessoes}</div>
                  <div><strong>Duração:</strong> {selectedPlano.duracao}</div>
                  <div><strong>Calorias:</strong> {selectedPlano.calorias_estimadas} kcal</div>
                </div>
                <div className="modal-benefits">
                  <strong>Benefícios:</strong>
                  <ul>
                    {selectedPlano.beneficios?.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
                <div className="modal-tips">
                  <strong>Dicas do Coach:</strong>
                  <ul>
                    {selectedPlano.coach_tips?.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowModal(false)}>Fechar</button>
                <button className="btn-confirm" onClick={() => {
                  setShowModal(false);
                  handleIniciarPlano(selectedPlano);
                }}>Iniciar Plano</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />

      <style jsx>{`
        .container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 84px 60px;
          padding-bottom: 100px;
        }
        .planos-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .planos-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text-primary);
        }
        .planos-header p {
          font-size: 16px;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }
        .plano-ativo-banner {
          background: linear-gradient(135deg, #ff1e2d20, #ff1e2d10);
          border: 1px solid #ef4444;
          border-radius: 40px;
          padding: 10px 20px;
          margin-top: 20px;
          display: inline-flex;
          align-items: center;
          gap: 16px;
          font-size: 14px;
          color: var(--text-primary);
        }
        .btn-stop-plan {
          background: #ef4444;
          border: none;
          padding: 6px 16px;
          border-radius: 30px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-stop-plan:hover {
          background: #dc2626;
          transform: scale(1.02);
        }
        .planos-tabs {
          display: flex;
          justify-content: center;
          gap: 56px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
          margin-bottom: 32px;
        }
        .planos-tab {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          padding-bottom: 12px;
          transition: all 0.3s ease;
          background: none;
          border: none;
          font-family: inherit;
        }
        .planos-tab:hover {
          color: #ff1e2d;
        }
        .planos-tab.active {
          color: #ff1e2d;
          border-bottom: 3px solid #ff1e2d;
        }
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 28px;
        }
        .plan-card-modern {
          background: var(--bg-card);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: var(--shadow);
          position: relative;
        }
        .plan-card-modern:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-hover);
        }
        .active-plan {
          border: 2px solid #10b981;
          box-shadow: 0 0 0 1px #10b981, var(--shadow);
        }
        .custom-plan {
          background: linear-gradient(135deg, #0f172a, #1e293b);
        }
        .card-header-plan {
          padding: 20px 20px 0 20px;
          position: relative;
        }
        .card-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .badge-easy {
          background: linear-gradient(135deg, #10b98120, #10b98110);
          color: #059669;
        }
        .badge-moderate {
          background: linear-gradient(135deg, #ffff001d, #ffff0010);
          color: #dbdb00;
        }
        .badge-avancado {
          background: linear-gradient(135deg, #ff730023, #ff730015);
          color: #ff7300;
        }
        .badge-elite {
          background: linear-gradient(135deg, #8559eb24, #8559eb10);
          color: #8559eb;
        }
        .badge-hard {
          background: linear-gradient(135deg, #ff1e2d20, #ff1e2d10);
          color: #ff1e2d;
        }
        .run-icon {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s;
        }
        .plan-card-modern:hover .run-icon {
          transform: scale(1.1) rotate(5deg);
        }
        .run-icon i {
          font-size: 24px;
          color: white;
        }
        .card-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
          line-height: 1.3;
        }
        .card-distance {
          font-size: 14px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
        }
        .card-body-plan {
          padding: 0 20px;
        }
        .card-description {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 20px;
          min-height: 60px;
        }
        .card-stats {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          padding: 12px 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }
        .stat-item {
          flex: 1;
          text-align: center;
        }
        .stat-value {
          font-size: 18px;
          font-weight: 800;
          color: #ff1e2d;
        }
        .stat-label {
          font-size: 11px;
          color: var(--text-light);
          margin-top: 4px;
        }
        .card-benefits {
          margin: 15px 0;
        }
        .benefit {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .benefit i {
          color: #10b981;
          font-size: 10px;
        }
        .card-footer-plan {
          background: var(--chat-bg);
          padding: 15px 20px;
          display: flex;
          gap: 12px;
          border-top: 1px solid var(--border-color);
        }
        .btn-details {
          flex: 1;
          background: transparent;
          border: 1.5px solid var(--border-color);
          padding: 10px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-details:hover {
          background: var(--border-light);
          border-color: #ff1e2d;
          color: #ff1e2d;
        }
        .btn-start {
          flex: 1;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 10px;
          border-radius: 40px;
          font-weight: 700;
          font-size: 13px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(255, 30, 45, 0.3);
        }
        .btn-start:hover {
          transform: scale(1.02);
        }
        .btn-stop {
          flex: 1;
          background: #ef4444;
          border: none;
          padding: 10px;
          border-radius: 40px;
          font-weight: 700;
          font-size: 13px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-stop:hover {
          background: #dc2626;
          transform: scale(1.02);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        .modal-content {
          background: var(--bg-card);
          border-radius: 28px;
          max-width: 550px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
        }
        .modal-header {
          padding: 20px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
        }
        .close-modal {
          background: rgba(255,255,255,0.2);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          color: white;
          cursor: pointer;
        }
        .modal-body {
          padding: 24px;
        }
        .modal-stats {
          display: flex;
          gap: 16px;
          margin: 16px 0;
          padding: 12px;
          background: var(--chat-bg);
          border-radius: 16px;
        }
        .modal-benefits, .modal-tips {
          margin: 16px 0;
        }
        .modal-benefits ul, .modal-tips ul {
          margin-top: 8px;
          padding-left: 20px;
          color: var(--text-secondary);
        }
        .modal-footer {
          padding: 16px 24px;
          display: flex;
          gap: 12px;
          border-top: 1px solid var(--border-color);
        }
        .btn-cancel {
          flex: 1;
          background: var(--border-light);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          color: var(--text-primary);
          transition: all 0.2s;
        }
        .btn-cancel:hover {
          background: var(--border-color);
          transform: translateY(-1px);
        }
        [data-theme="light"] .btn-cancel {
          background: #f0f2f8;
          color: #1a1a1a;
          border-color: #e2e8f0;
        }
        [data-theme="light"] .btn-cancel:hover {
          background: #e2e8f0;
        }
        [data-theme="dark"] .btn-cancel {
          background: #2a2a2a;
          color: #ffffff;
          border-color: #444444;
        }
        [data-theme="dark"] .btn-cancel:hover {
          background: #3a3a3a;
          border-color: #ff1e2d;
        }
        .btn-confirm {
          flex: 1;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 12px;
          border-radius: 40px;
          font-weight: 600;
          color: white;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .container {
            padding: 20px;
          }
          .plans-grid {
            grid-template-columns: 1fr;
          }
          .planos-tabs {
            gap: 30px;
            flex-wrap: wrap;
          }
          .planos-tab {
            font-size: 13px;
          }
          .planos-header h1 {
            font-size: 28px;
          }
          .planos-header p {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
};

export default Planos;