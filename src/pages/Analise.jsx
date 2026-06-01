import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';
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
  const [planoAtivo, setPlanoAtivo] = useState(null);
  const [semanaTreinos, setSemanaTreinos] = useState([]);
  const [metas, setMetas] = useState({
    distancia: { atual: 0, meta: 0, percentual: 0 },
    atividades: { atual: 0, meta: 0, percentual: 0 },
    tempo: { atual: 0, meta: 0, percentual: 0 },
    calorias: { atual: 0, meta: 0, percentual: 0 }
  });
  const [stats, setStats] = useState({
    ritmoMedio: '--',
    bpmMedio: 0,
    vo2Max: 0,
    diasAtivos: 0
  });

  const userId = user?.id;

  // Função para gerar plano de treino semanal baseado no plano ativo
  const gerarSemanaTreinos = (plano) => {
    if (!plano) {
      // Sem plano: recomendações genéricas
      return [
        { dia: "SEG", nome: "Fartlek 40min", tags: ['CORRIDA', 'INTENSO'], descricao: "Alternar ritmo: 3min forte / 2min moderado", info: "40min • 380 kcal", intensidade: 80 },
        { dia: "TER", nome: "Fortalecimento Core 30min", tags: ['FORTALECIMENTO', 'MOBILIDADE'], descricao: "Prancha, abdominais, ponte", info: "30min • 180 kcal", intensidade: 60 },
        { dia: "QUA", nome: "Descanso Ativo", tags: ['RECUPERAÇÃO', 'CAMINHADA'], descricao: "Caminhada leve 30min", info: "30min • 100 kcal", intensidade: 30 },
        { dia: "QUI", nome: "Tempo Run 6km", tags: ['CORRIDA', 'RITMO'], descricao: "6km em ritmo 5:00/km", info: "30min • 420 kcal", intensidade: 75 },
        { dia: "SEX", nome: "Natação Técnica", tags: ['NATAÇÃO', 'TÉCNICA'], descricao: "Foco em técnica", info: "45min • 350 kcal", intensidade: 65 },
        { dia: "SAB", nome: "Long Run 14km", tags: ['CORRIDA', 'RESISTÊNCIA'], descricao: "Pace conversacional", info: "1h20min • 980 kcal", intensidade: 90 },
        { dia: "DOM", nome: "Descanso Total", tags: ['RECUPERAÇÃO', 'DESCANSO'], descricao: "Alongamentos leves", info: "- • 0 kcal", intensidade: 0 }
      ];
    }
    // Planos específicos (mesma lógica do Coach IA)
    if (plano.nome.includes("5KM") || plano.nome.includes("Iniciante")) {
      return [
        { dia: "SEG", nome: "Caminhada 30 min + trote leve 10 min", tags: ['CORRIDA', 'LEVE'], descricao: "30 min caminhada, depois 10 min trote suave", info: "40min • 250 kcal", intensidade: 40 },
        { dia: "TER", nome: "Descanso ou Alongamento", tags: ['RECUPERAÇÃO'], descricao: "Alongamento leve", info: "15min • 50 kcal", intensidade: 10 },
        { dia: "QUA", nome: "Treino alternado: 5 min caminhada / 2 min trote (4x)", tags: ['CORRIDA', 'INTERVALADO'], descricao: "Repetir 4 vezes", info: "28min • 200 kcal", intensidade: 55 },
        { dia: "QUI", nome: "Descanso", tags: ['RECUPERAÇÃO'], descricao: "Descanso completo", info: "- • 0 kcal", intensidade: 0 },
        { dia: "SEX", nome: "Caminhada rápida 40 min", tags: ['CORRIDA', 'LEVE'], descricao: "Passo acelerado", info: "40min • 220 kcal", intensidade: 45 },
        { dia: "SAB", nome: "Trote contínuo 15 min", tags: ['CORRIDA', 'PROGRESSÃO'], descricao: "Trote sem parar", info: "15min • 150 kcal", intensidade: 60 },
        { dia: "DOM", nome: "Descanso total", tags: ['RECUPERAÇÃO'], descricao: "Descanso ativo ou total", info: "- • 0 kcal", intensidade: 0 }
      ];
    }
    if (plano.nome.includes("10KM") || plano.nome.includes("Intermediário")) {
      return [
        { dia: "SEG", nome: "Intervalado: 400m rápido / 400m lento (6x)", tags: ['CORRIDA', 'INTENSO'], descricao: "Repetir 6 vezes", info: "45min • 420 kcal", intensidade: 80 },
        { dia: "TER", nome: "Treino de força (agachamento, prancha)", tags: ['FORTALECIMENTO'], descricao: "Circuito de força", info: "30min • 200 kcal", intensidade: 65 },
        { dia: "QUA", nome: "Rodagem leve 5km", tags: ['CORRIDA', 'MODERADO'], descricao: "Pace confortável", info: "30min • 350 kcal", intensidade: 70 },
        { dia: "QUI", nome: "Descanso ativo", tags: ['RECUPERAÇÃO'], descricao: "Caminhada ou yoga", info: "20min • 80 kcal", intensidade: 20 },
        { dia: "SEX", nome: "Tempo run 3km @ pace 6:00/km", tags: ['CORRIDA', 'RITMO'], descricao: "Ritmo de prova", info: "18min • 250 kcal", intensidade: 75 },
        { dia: "SAB", nome: "Longão 8km zona 2", tags: ['CORRIDA', 'RESISTÊNCIA'], descricao: "Pace conversacional", info: "48min • 560 kcal", intensidade: 85 },
        { dia: "DOM", nome: "Descanso", tags: ['RECUPERAÇÃO'], descricao: "Descanso total", info: "- • 0 kcal", intensidade: 0 }
      ];
    }
    if (plano.nome.includes("15KM") || plano.nome.includes("Avançado")) {
      return [
        { dia: "SEG", nome: "Fartlek 50min (alternando ritmos)", tags: ['CORRIDA', 'INTENSO'], descricao: "Mude ritmo a cada 5min", info: "50min • 520 kcal", intensidade: 85 },
        { dia: "TER", nome: "Musculação (perna completa)", tags: ['FORTALECIMENTO'], descricao: "Agachamento, leg press, stiff", info: "45min • 300 kcal", intensidade: 70 },
        { dia: "QUA", nome: "Rodagem regenerativa 6km", tags: ['CORRIDA', 'MODERADO'], descricao: "Recuperação", info: "36min • 400 kcal", intensidade: 65 },
        { dia: "QUI", nome: "Treino de subidas (6x200m)", tags: ['CORRIDA', 'INTENSO'], descricao: "Subida forte, desce leve", info: "40min • 450 kcal", intensidade: 90 },
        { dia: "SEX", nome: "Descanso ou natação", tags: ['RECUPERAÇÃO'], descricao: "Recuperação ativa", info: "30min • 150 kcal", intensidade: 30 },
        { dia: "SAB", nome: "Longão 12km progressivo", tags: ['CORRIDA', 'RESISTÊNCIA'], descricao: "Começa leve, termina forte", info: "1h10min • 850 kcal", intensidade: 88 },
        { dia: "DOM", nome: "Descanso total", tags: ['RECUPERAÇÃO'], descricao: "Descanso", info: "- • 0 kcal", intensidade: 0 }
      ];
    }
    if (plano.nome.includes("21KM") || plano.nome.includes("Meia")) {
      return [
        { dia: "SEG", nome: "Treino de limiar: 4x1km ritmo alvo", tags: ['CORRIDA', 'INTENSO'], descricao: "4 repetições", info: "50min • 580 kcal", intensidade: 90 },
        { dia: "TER", nome: "Treino funcional + core", tags: ['FORTALECIMENTO'], descricao: "Circuito funcional", info: "45min • 350 kcal", intensidade: 75 },
        { dia: "QUA", nome: "Rodagem regenerativa 7km", tags: ['CORRIDA', 'MODERADO'], descricao: "Recuperação", info: "42min • 480 kcal", intensidade: 70 },
        { dia: "QUI", nome: "Intervalado longo: 3x2km (descanso 2min)", tags: ['CORRIDA', 'INTENSO'], descricao: "Ritmo forte", info: "55min • 620 kcal", intensidade: 92 },
        { dia: "SEX", nome: "Descanso ativo", tags: ['RECUPERAÇÃO'], descricao: "Alongamento ou caminhada", info: "20min • 60 kcal", intensidade: 20 },
        { dia: "SAB", nome: "Longão 16km zona 2", tags: ['CORRIDA', 'RESISTÊNCIA'], descricao: "Pace leve", info: "1h30min • 1100 kcal", intensidade: 85 },
        { dia: "DOM", nome: "Descanso", tags: ['RECUPERAÇÃO'], descricao: "Descanso total", info: "- • 0 kcal", intensidade: 0 }
      ];
    }
    if (plano.nome.includes("42KM") || plano.nome.includes("Maratona")) {
      return [
        { dia: "SEG", nome: "Treino de ritmo de prova: 8km @ pace maratona", tags: ['CORRIDA', 'INTENSO'], descricao: "Ritmo alvo", info: "1h • 700 kcal", intensidade: 95 },
        { dia: "TER", nome: "Musculação (força máxima)", tags: ['FORTALECIMENTO'], descricao: "Agachamento pesado, stiff", info: "50min • 400 kcal", intensidade: 85 },
        { dia: "QUA", nome: "Rodagem regenerativa 10km", tags: ['CORRIDA', 'MODERADO'], descricao: "Recuperação", info: "60min • 700 kcal", intensidade: 75 },
        { dia: "QUI", nome: "Intervalado: 16x400m com recuperação curta", tags: ['CORRIDA', 'INTENSO'], descricao: "Séries de 400m", info: "1h10min • 800 kcal", intensidade: 98 },
        { dia: "SEX", nome: "Descanso ativo (yoga ou alongamento)", tags: ['RECUPERAÇÃO'], descricao: "Flexibilidade", info: "30min • 100 kcal", intensidade: 20 },
        { dia: "SAB", nome: "Longão 25km zona 2", tags: ['CORRIDA', 'RESISTÊNCIA'], descricao: "Pace conversacional", info: "2h30min • 1800 kcal", intensidade: 88 },
        { dia: "DOM", nome: "Descanso total", tags: ['RECUPERAÇÃO'], descricao: "Descanso", info: "- • 0 kcal", intensidade: 0 }
      ];
    }
    // fallback
    return [
      { dia: "SEG", nome: "Treino geral", tags: ['GERAL'], descricao: "Treino genérico", info: "30min • 200 kcal", intensidade: 50 }
    ];
  };

  // Extrair número de km do nome do treino (para meta de distância)
  const extrairKm = (nome) => {
    const match = nome.match(/(\d+(?:\.\d+)?)km/i);
    return match ? parseFloat(match[1]) : 0;
  };

  // Extrair minutos de duração do texto info (ex: "40min • 380 kcal")
  const extrairMinutos = (info) => {
    const match = info.match(/(\d+)min/);
    return match ? parseInt(match[1]) : 0;
  };

  // Extrair calorias do texto info
  const extrairCalorias = (info) => {
    const match = info.match(/(\d+)\s*kcal/);
    return match ? parseInt(match[1]) : 0;
  };

  // Atualizar metas com base nos treinos concluídos e no plano
  const calcularMetas = (treinosConcluidos, semanaTreinosArray) => {
    let distanciaTotal = 0;
    let caloriasTotal = 0;
    let tempoTotalMin = 0;
    let atividadesTotal = 0;

    semanaTreinosArray.forEach(treino => {
      if (treinosConcluidos[treino.dia]) {
        atividadesTotal++;
        distanciaTotal += extrairKm(treino.nome);
        caloriasTotal += extrairCalorias(treino.info);
        tempoTotalMin += extrairMinutos(treino.info);
      }
    });

    // Metas mensais: multiplicar por 4 (estimativa de 4 semanas)
    const metaDistanciaMensal = (distanciaTotal * 4).toFixed(0);
    const metaAtividadesMensal = (atividadesTotal * 4).toFixed(0);
    const metaTempoMensal = ((tempoTotalMin / 60) * 4).toFixed(1);
    const metaCaloriasMensal = (caloriasTotal * 4).toFixed(0);

    setMetas({
      distancia: { atual: distanciaTotal, meta: metaDistanciaMensal, percentual: Math.min(100, Math.round((distanciaTotal / metaDistanciaMensal) * 100)) || 0 },
      atividades: { atual: atividadesTotal, meta: metaAtividadesMensal, percentual: Math.min(100, Math.round((atividadesTotal / metaAtividadesMensal) * 100)) || 0 },
      tempo: { atual: (tempoTotalMin / 60).toFixed(1), meta: metaTempoMensal, percentual: Math.min(100, Math.round(((tempoTotalMin / 60) / metaTempoMensal) * 100)) || 0 },
      calorias: { atual: caloriasTotal, meta: metaCaloriasMensal, percentual: Math.min(100, Math.round((caloriasTotal / metaCaloriasMensal) * 100)) || 0 }
    });

    // Estatísticas gerais (mock, poderiam vir do histórico)
    setStats({
      ritmoMedio: '5:48',
      bpmMedio: 148,
      vo2Max: 48.2,
      diasAtivos: atividadesTotal
    });
  };

  // Carregar treinos concluídos do Supabase
  const carregarTreinosConcluidos = async () => {
    if (!userId) return {};
    const hoje = new Date().toISOString().split('T')[0];
    const semanaPassada = new Date();
    semanaPassada.setDate(semanaPassada.getDate() - 7);
    const dataInicio = semanaPassada.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('treinos_usuarios')
      .select('*')
      .eq('user_id', userId)
      .gte('data', dataInicio)
      .lte('data', hoje);

    if (error) {
      console.error('Erro ao carregar treinos:', error);
      return {};
    }

    const completados = {};
    data.forEach(treino => {
      const diaObj = new Date(treino.data);
      const diaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'][diaObj.getDay()];
      if (treino.concluido) completados[diaSemana] = true;
    });
    return completados;
  };

  // Salvar conclusão do treino no Supabase
  const salvarConclusaoTreino = async (dia, concluido) => {
    if (!userId) return;
    const hoje = new Date().toISOString().split('T')[0];
    const treinoObj = semanaTreinos.find(t => t.dia === dia);
    const nomeTreino = treinoObj ? treinoObj.nome : '';
    const { error } = await supabase
      .from('treinos_usuarios')
      .upsert({
        user_id: userId,
        data: hoje,
        dia_semana: dia,
        treino_nome: nomeTreino,
        concluido: concluido,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, data' });

    if (error) {
      console.error('Erro ao salvar treino:', error);
      addNotification('Erro', 'Não foi possível salvar o progresso.', 'error');
    }
  };

  // Inicialização
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const carregarDados = async () => {
      setLoading(true);
      // Carregar plano ativo
      const planoRaw = localStorage.getItem('forza_plano_ativo');
      let plano = null;
      if (planoRaw) {
        try {
          plano = JSON.parse(planoRaw);
        } catch { }
      }
      setPlanoAtivo(plano);
      const semana = gerarSemanaTreinos(plano);
      setSemanaTreinos(semana);
      // Carregar treinos concluídos
      const completados = await carregarTreinosConcluidos();
      setTreinosCompletados(completados);
      // Calcular metas com base nos concluídos
      calcularMetas(completados, semana);
      setLoading(false);
    };
    carregarDados();
  }, [isAuthenticated, navigate, userId]);

  const marcarTreinoComoCompletado = async (dia) => {
    const novoEstado = !treinosCompletados[dia];
    const novosCompletados = { ...treinosCompletados, [dia]: novoEstado };
    setTreinosCompletados(novosCompletados);
    await salvarConclusaoTreino(dia, novoEstado);
    // Recalcular metas
    calcularMetas(novosCompletados, semanaTreinos);

    if (novoEstado) {
      addNotification('✅ Treino concluído!', `Você completou o treino de ${dia}-feira! Continue assim! 🎉`, 'success', 'fa-check-circle');
    } else {
      addNotification('↩️ Treino desmarcado', `Treino de ${dia}-feira foi desmarcado.`, 'info', 'fa-undo');
    }
  };

  const isTreinoCompletado = (dia) => treinosCompletados[dia] || false;

  const dias = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
  const treino = semanaTreinos.find(t => t.dia === activeDay) || { 
    nome: "Treino não definido", 
    tags: [], 
    descricao: "Nenhum treino para hoje", 
    info: "-", 
    intensidade: 0 
  };

  const tabs = [
    { id: 'planos', nome: 'Planos', rota: '/planos' },
    { id: 'coach', nome: 'Coach IA', rota: '/coach' },
    { id: 'analise', nome: 'Análise', rota: '/analise' },
  ];

  const handleTabClick = (tab) => navigate(tab.rota);

  const getIntensidadeCor = (intensidade) => {
    if (intensidade >= 75) return '#ff1e2d';
    if (intensidade >= 60) return '#dbdb00';
    return '#059669';
  };

  const getIntensidadeTexto = (intensidade) => {
    if (intensidade >= 75) return 'Alta';
    if (intensidade >= 60) return 'Média';
    return 'Baixa';
  };

  const progressoGeral = Math.round(
    (metas.atividades.atual / metas.atividades.meta) * 100
  ) || 0;

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
          {planoAtivo && (
            <div className="analise-plano-badge">
              <i className="fas fa-running"></i> Plano ativo: <strong>{planoAtivo.nome}</strong>
            </div>
          )}
        </div>

        <div className="analise-tabs">
          {tabs.map(tab => (
            <button key={tab.id} className={`analise-tab ${tab.id === 'analise' ? 'active' : ''}`} onClick={() => handleTabClick(tab)}>
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
                {treino.tags?.map(tag => (
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
                    strokeDashoffset={2 * Math.PI * 60 * (1 - progressoGeral / 100)}
                    transform="rotate(-90 70 70)"
                  />
                </svg>
                <div className="analise-progress-percent">{progressoGeral}%</div>
              </div>
              <p>Meta de atividades</p>
              <div className="analise-progress-stats">
                <div><span>🔥</span> {metas.calorias.atual.toLocaleString()} kcal</div>
                <div><span>🏃</span> {metas.atividades.atual} treinos</div>
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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Analise;