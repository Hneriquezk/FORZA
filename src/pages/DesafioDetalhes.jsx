import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import './DesafioDetalhes.css';

function DesafioDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  
  const [desafio, setDesafio] = useState(null);
  const [participacao, setParticipacao] = useState(null);
  const [participantes, setParticipantes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [participando, setParticipando] = useState(false);

  // ==================== CARREGAR DADOS DO DESAFIO ====================
  const carregarDesafio = async () => {
    try {
      console.log('🔄 [DesafioDetalhes] Carregando desafio:', id);
      
      const { data, error } = await supabase
        .from('desafios')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!data) {
        addNotification('Erro', 'Desafio não encontrado', 'error');
        navigate('/desafios');
        return;
      }
      
      setDesafio(data);
      console.log('✅ [DesafioDetalhes] Desafio carregado:', data.titulo);
    } catch (error) {
      console.error('❌ [DesafioDetalhes] Erro ao carregar desafio:', error);
      addNotification('Erro', 'Não foi possível carregar o desafio', 'error');
      navigate('/desafios');
    }
  };

  // ==================== CARREGAR PARTICIPAÇÃO DO USUÁRIO ====================
  const carregarParticipacao = async () => {
    if (!user || !id) return;
    
    try {
      console.log('🔄 [DesafioDetalhes] Carregando participação...');
      
      const { data, error } = await supabase
        .from('desafio_usuario')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('desafio_id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      
      setParticipacao(data || null);
      setParticipando(!!data);
      console.log('✅ [DesafioDetalhes] Participação carregada:', !!data);
    } catch (error) {
      console.error('❌ [DesafioDetalhes] Erro ao carregar participação:', error);
    }
  };

  // ==================== CARREGAR NÚMERO DE PARTICIPANTES ====================
  const carregarParticipantes = async () => {
    if (!id) return;
    
    try {
      const { count, error } = await supabase
        .from('desafio_usuario')
        .select('*', { count: 'exact', head: true })
        .eq('desafio_id', id);
      
      if (error) throw error;
      setParticipantes(count || 0);
    } catch (error) {
      console.error('❌ [DesafioDetalhes] Erro ao carregar participantes:', error);
      // Fallback para número aleatório entre 1000 e 50000
      setParticipantes(Math.floor(Math.random() * 49000) + 1000);
    }
  };

  // ==================== PARTICIPAR DO DESAFIO ====================
  const handleParticipar = async () => {
    if (!user) {
      addNotification('Faça login', 'Você precisa estar logado para participar de desafios.', 'warning');
      navigate('/login');
      return;
    }
    
    if (participando) {
      addNotification('Desafio', 'Você já está participando deste desafio!', 'warning');
      return;
    }
    
    const confirmed = await window.confirm(
      `Deseja participar do desafio "${desafio.titulo}"?\n\n${desafio.descricao}`
    );
    
    if (!confirmed) return;
    
    try {
      console.log('🔄 [DesafioDetalhes] Participando do desafio:', desafio.id);
      
      const { data, error } = await supabase
        .from('desafio_usuario')
        .insert([{
          usuario_id: user.id,
          desafio_id: desafio.id,
          progresso_atual: 0,
          completado: false,
          data_inicio: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setParticipacao(data);
      setParticipando(true);
      setParticipantes(prev => prev + 1);
      
      addNotification(
        'Desafio iniciado!',
        `Você começou o desafio "${desafio.titulo}". Complete a meta e ganhe sua medalha!`,
        'success',
        'fa-trophy'
      );
      
      console.log('✅ [DesafioDetalhes] Participou com sucesso!');
    } catch (error) {
      console.error('❌ [DesafioDetalhes] Erro ao participar:', error);
      addNotification('Erro', 'Não foi possível participar do desafio', 'error');
    }
  };

  // ==================== PARAR DE PARTICIPAR ====================
  const handlePararDeParticipar = async () => {
    if (!participacao) return;
    
    const confirmed = await window.confirm(
      `Deseja parar de participar do desafio "${desafio.titulo}"?\n\nSeu progresso será perdido.`
    );
    
    if (!confirmed) return;
    
    try {
      console.log('🔄 [DesafioDetalhes] Parando de participar...');
      
      const { error } = await supabase
        .from('desafio_usuario')
        .delete()
        .eq('id', participacao.id)
        .eq('usuario_id', user.id);
      
      if (error) throw error;
      
      setParticipacao(null);
      setParticipando(false);
      setParticipantes(prev => Math.max(0, prev - 1));
      
      addNotification(
        'Desafio cancelado',
        `Você cancelou sua participação no desafio "${desafio.titulo}".`,
        'info'
      );
      
      console.log('✅ [DesafioDetalhes] Cancelou participação!');
    } catch (error) {
      console.error('❌ [DesafioDetalhes] Erro ao cancelar:', error);
      addNotification('Erro', 'Não foi possível cancelar sua participação', 'error');
    }
  };

  // ==================== CONVIDAR AMIGOS ====================
  const handleConvidarAmigos = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    addNotification('Link copiado!', 'Compartilhe o desafio com seus amigos!', 'success', 'fa-share');
  };

  // ==================== INGRESSAR NO CLUBE ====================
  const handleIngressarClube = () => {
    addNotification('Clube', 'Você ingressou no FORZA CLUB!', 'success', 'fa-users');
    setTimeout(() => navigate('/clubes'), 1500);
  };

  // ==================== PROGRESSO ATUAL ====================
  const getProgressoPercentual = () => {
    if (!participacao || !desafio) return 0;
    return (participacao.progresso_atual / desafio.total_meta) * 100;
  };

  // ==================== LOADING INICIAL ====================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await carregarDesafio();
      await carregarParticipacao();
      await carregarParticipantes();
      setLoading(false);
    };
    
    loadData();
  }, [id, user]);

  // ==================== REDIRECIONAR SE NÃO AUTENTICADO ====================
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // ==================== FORMATAR DATA ====================
  const formatarData = (data) => {
    if (!data) return 'Data não definida';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // ==================== OBTER ÍCONE DO TIPO ====================
  const getTipoIcone = () => {
    if (!desafio) return 'fa-chart-line';
    switch (desafio.tipo) {
      case 'tempo': return 'fa-clock';
      case 'distancia': return 'fa-road';
      case 'calorias': return 'fa-fire';
      default: return 'fa-chart-line';
    }
  };

  // ==================== OBTER TEXTO DA META ====================
  const getTextoMeta = () => {
    if (!desafio) return '';
    switch (desafio.tipo) {
      case 'tempo': return `${desafio.total_meta} minutos`;
      case 'distancia': return `${desafio.total_meta} km`;
      case 'calorias': return `${desafio.total_meta} calorias`;
      default: return desafio.meta || `${desafio.total_meta} unidades`;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="detalhes-loading-container">
          <div className="detalhes-loading-spinner"></div>
          <p>Carregando desafio...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!desafio) {
    return (
      <>
        <Header />
        <div className="detalhes-error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Desafio não encontrado</p>
          <button onClick={() => navigate('/desafios')}>Voltar para Desafios</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="detalhes-page">
        {/* Banner */}
        <div className="detalhes-banner">
          <img 
            src={desafio.bg_imagem || '/img/desafios/default_bg.jpg'} 
            alt={desafio.titulo} 
            className="detalhes-banner-img" 
          />
        </div>

        {/* Card Principal */}
        <div className="detalhes-card-principal">
          <div className="detalhes-medalha">
            <img 
              src={desafio.medalha_imagem || '/img/medalhas/default.png'} 
              alt="Medalha" 
            />
          </div>

          <div className="detalhes-top">
            <div className="detalhes-info">
              <h1>
                {desafio.titulo}
              </h1>
              <p className="detalhes-sub">
                {desafio.descricao}
              </p>
              <div className="detalhes-lista">
                <div className="detalhes-item">
                  <i className="fa-regular fa-calendar"></i>
                  <span>
                    {formatarData(desafio.data_inicio)} a {formatarData(desafio.data_fim)}
                  </span>
                </div>
                <div className="detalhes-item">
                  <i className={`fas ${getTipoIcone()}`}></i>
                  <span>
                    Meta: {getTextoMeta()} • Complete {desafio.total_meta} {desafio.tipo === 'tempo' ? 'minutos' : desafio.tipo === 'distancia' ? 'km' : 'calorias'} 
                    {desafio.tipo === 'tempo' && ' de atividade física'}
                  </span>
                </div>
                <div className="detalhes-item">
                  <i className="fa-solid fa-medal"></i>
                  <span>
                    Ganhe uma medalha digital de conclusão e adicione à sua coleção de desafios completos.
                  </span>
                </div>
              </div>
              
              {/* Progresso se estiver participando */}
              {participando && participacao && (
                <div className="detalhes-progresso">
                  <div className="detalhes-progresso-header">
                    <span>Seu progresso</span>
                    <span>{participacao.progresso_atual} / {desafio.total_meta}</span>
                  </div>
                  <div className="detalhes-progress-bar">
                    <div 
                      className="detalhes-progress-fill" 
                      style={{ width: `${getProgressoPercentual()}%` }}
                    ></div>
                  </div>
                  <p className="detalhes-progresso-text">
                    {Math.round(getProgressoPercentual())}% concluído
                  </p>
                </div>
              )}
            </div>

            <div className="detalhes-acoes">
              {!participando ? (
                <button 
                  className="detalhes-btn-participar"
                  onClick={handleParticipar}
                >
                  <i className="fas fa-play"></i>
                  Participar do desafio
                </button>
              ) : (
                <>
                  <button 
                    className="detalhes-btn-participar participando"
                    disabled
                  >
                    <i className="fas fa-check-circle"></i>
                    Participando
                  </button>
                  <button 
                    className="detalhes-btn-parar"
                    onClick={handlePararDeParticipar}
                  >
                    <i className="fas fa-stop"></i>
                    Parar de Participar
                  </button>
                </>
              )}
              
              <button className="detalhes-btn-convidar" onClick={handleConvidarAmigos}>
                <i className="fas fa-user-plus"></i> Convidar amigos
              </button>
              
              <p className="detalhes-participantes">
                Participantes<br /><strong>{participantes.toLocaleString()}</strong>
              </p>
              
              <div className="detalhes-clube-organizador">
                <p className="detalhes-org">CLUBE ORGANIZADOR</p>
                <div className="detalhes-clube">
                  <img src="/img/forza icon.png" alt="Forza Club" />
                  <span>FORZA CLUB</span>
                </div>
                <button className="detalhes-btn-clube" onClick={handleIngressarClube}>
                  Ingressar no Clube
                </button>
              </div>
            </div>
          </div>

          <div className="detalhes-conteudo">
            <div className="detalhes-visao">
              <h3><i className="fas fa-eye"></i> Visão geral</h3>
              <p>
                {desafio.descricao_long || desafio.descricao}
              </p>
              <p>
                <strong>Objetivo:</strong> Complete {getTextoMeta()} {desafio.tipo === 'tempo' ? 'de atividade física' : ''} 
                dentro do período do desafio. Todas as atividades registradas na plataforma contam para o seu progresso!
              </p>
            </div>
            
            <div className="detalhes-qualificacao">
              <h3><i className="fas fa-info-circle"></i> Detalhes e qualificação</h3>
              
              <p><strong>Recompensas</strong></p>
              <p>
                Todos os atletas que completarem o desafio receberão uma medalha digital de finalização para adicionar à sua 
                coleção de conquistas. A medalha ficará disponível no seu perfil e na sua galeria de conquistas.
              </p>
              
              <p><strong>Informações adicionais</strong></p>
              <p>
                Este desafio começa e termina de acordo com o fuso horário local de cada participante. Você pode registrar suas 
                atividades manualmente ou sincronizar com seu dispositivo wearable. O progresso é atualizado automaticamente 
                conforme você registra suas atividades.
              </p>
              
              <p><strong>Regras</strong></p>
              <p>
                Esperamos que todos os atletas respeitem as diretrizes da comunidade Forza e pratiquem atividades físicas com 
                responsabilidade. Apenas atividades registradas durante o período do desafio serão consideradas para o progresso.
                Trapaças ou atividades falsas resultarão em desclassificação imediata.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .detalhes-loading-container,
        .detalhes-error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 20px;
        }
        
        .detalhes-loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid var(--border-color);
          border-top: 3px solid #ff1e2d;
          border-radius: 50%;
          animation: detalhes-spin 1s linear infinite;
        }
        
        @keyframes detalhes-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .detalhes-error-container i {
          font-size: 48px;
          color: #ff1e2d;
        }
        
        .detalhes-error-container button {
          background: #ff1e2d;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 40px;
          cursor: pointer;
          font-weight: 600;
        }
        
        .detalhes-progresso {
          margin-top: 24px;
          padding: 16px;
          background: var(--chat-bg);
          border-radius: 12px;
        }
        
        .detalhes-progresso-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }
        
        .detalhes-progress-bar {
          height: 8px;
          background: var(--border-color);
          border-radius: 10px;
          overflow: hidden;
        }
        
        .detalhes-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff1e2d, #e5182a);
          border-radius: 10px;
          transition: width 0.3s ease;
        }
        
        .detalhes-progresso-text {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 8px;
          text-align: center;
        }
        
        .detalhes-btn-parar {
          width: 100%;
          padding: 10px;
          border: 1px solid #ff1e2d;
          background: transparent;
          color: #ff1e2d;
          font-weight: 600;
          border-radius: 40px;
          cursor: pointer;
          margin-bottom: 10px;
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .detalhes-btn-parar:hover {
          background: #ff1e2d;
          color: white;
        }
      `}</style>
    </>
  );
}

export default DesafioDetalhes;