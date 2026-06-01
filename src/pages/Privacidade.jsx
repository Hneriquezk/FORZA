// Privacidade.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import './Privacidade.css';

function Privacidade() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const [lastUpdated] = useState('15 de Maio de 2026');
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const footerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setTimeout(() => setShowCookieConsent(true), 1000);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
      
      const distanceToBottom = documentHeight - (scrollY + windowHeight);
      if (distanceToBottom < 150) {
        setIsNearFooter(true);
      } else {
        setIsNearFooter(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookieConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setShowCookieConsent(false);
  };

  const downloadPDF = () => {
    window.print();
  };

  const openCookieSettings = () => {
    alert('Configurações de cookies podem ser gerenciadas diretamente nas configurações do seu navegador.');
  };

  const sections = [
    { id: 'introducao', title: 'Introdução', icon: 'fa-info-circle' },
    { id: 'coleta', title: 'Informações que coletamos', icon: 'fa-database' },
    { id: 'uso', title: 'Como utilizamos seus dados', icon: 'fa-chart-line' },
    { id: 'compartilhamento', title: 'Compartilhamento de dados', icon: 'fa-share-alt' },
    { id: 'seguranca', title: 'Segurança dos dados', icon: 'fa-shield-alt' },
    { id: 'direitos', title: 'Seus direitos', icon: 'fa-user-check' },
    { id: 'retencao', title: 'Retenção de dados', icon: 'fa-clock' },
    { id: 'menores', title: 'Dados de menores', icon: 'fa-child' },
    { id: 'cookies', title: 'Política de Cookies', icon: 'fa-cookie-bite' },
    { id: 'transferencias', title: 'Transferências internacionais', icon: 'fa-globe' },
    { id: 'lgpd', title: 'Conformidade com a LGPD', icon: 'fa-gavel' },
    { id: 'contato', title: 'Contato e DPO', icon: 'fa-headset' }
  ];

  return (
    <>
      <Header />
      
      <div className="privacidade-page">
        {/* Cookie Consent Banner */}
        {showCookieConsent && (
          <div className="cookie-consent-banner">
            <div className="cookie-content">
              <div className="cookie-icon">
                <i className="fas fa-cookie-bite"></i>
              </div>
              <div className="cookie-text">
                <h4>Nós usamos cookies</h4>
                <p>Utilizamos cookies para melhorar sua experiência, personalizar conteúdo e analisar nosso tráfego. Ao continuar navegando, você concorda com nossa <a href="#cookies">Política de Cookies</a>.</p>
              </div>
              <div className="cookie-buttons">
                <button onClick={declineCookies} className="cookie-decline">Recusar</button>
                <button onClick={acceptCookies} className="cookie-accept">Aceitar todos</button>
              </div>
            </div>
          </div>
        )}

        {/* Botão Voltar ao Topo */}
        <button 
          ref={buttonRef}
          className={`scroll-top-btn ${showScrollTop ? 'visible' : ''} ${isNearFooter ? 'near-footer' : ''}`}
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
        >
          <i className="fas fa-arrow-up"></i>
        </button>

        {/* Hero Section */}
        <div className="privacidade-hero">
          <div className="privacidade-hero-content">
            <div className="privacidade-hero-badge">
              <i className="fas fa-shield-alt"></i>
              <span>Última atualização: {lastUpdated}</span>
            </div>
            <h1>Política de Privacidade</h1>
            <p>Na Forza, sua privacidade é nossa prioridade. Estamos comprometidos com a transparência e proteção dos seus dados pessoais.</p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Compromisso com a LGPD</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">AES-256</span>
                <span className="stat-label">Criptografia de ponta</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Monitoramento ativo</span>
              </div>
            </div>
          </div>
          <div className="privacidade-hero-decoration">
            <div className="decoration-shape"></div>
            <div className="decoration-shape"></div>
            <div className="decoration-shape"></div>
          </div>
        </div>

        <div className="privacidade-layout">
          {/* Menu Lateral */}
          <aside className="privacidade-sidebar">
            <div className="sidebar-sticky">
              <div className="sidebar-title">
                <i className="fas fa-list-ul"></i>
                <span>Navegação rápida</span>
              </div>
              <nav className="sidebar-nav">
                {sections.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`sidebar-link ${activeSection === section.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                      setActiveSection(section.id);
                    }}
                  >
                    <i className={`fas ${section.icon}`}></i>
                    <span>{section.title}</span>
                  </a>
                ))}
              </nav>
              
              <div className="sidebar-download" onClick={downloadPDF}>
                <i className="fas fa-print"></i>
                <div>
                  <strong>Imprimir ou salvar PDF</strong>
                  <span>Use a opção "Salvar como PDF" na janela de impressão</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className="privacidade-main">
            {/* Cards de Resumo */}
            <div className="privacidade-summary">
              <div className="summary-card">
                <i className="fas fa-check-circle"></i>
                <div>
                  <h4>Compromisso com a transparência</h4>
                  <p>Suas informações são tratadas com total segurança e responsabilidade</p>
                </div>
              </div>
              <div className="summary-card">
                <i className="fas fa-lock"></i>
                <div>
                  <h4>Criptografia de ponta a ponta</h4>
                  <p>Seus dados são protegidos com a mais alta tecnologia de segurança</p>
                </div>
              </div>
              <div className="summary-card">
                <i className="fas fa-gavel"></i>
                <div>
                  <h4>Conformidade com a LGPD</h4>
                  <p>Estamos totalmente alinhados com a Lei Geral de Proteção de Dados</p>
                </div>
              </div>
            </div>

            <div className="privacidade-sections">
              {/* Seção 1 - Introdução */}
              <div id="introducao" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <h2>Introdução</h2>
                </div>
                <p>A Forza Treinos Esportivos ("Forza", "nós", "nosso" ou "nos") está comprometida em proteger sua privacidade. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nossa plataforma, aplicativo móvel e serviços relacionados.</p>
                <p>Esta política se aplica a todos os usuários da Forza, incluindo atletas amadores, profissionais, treinadores e qualquer pessoa que utilize nossos serviços para monitoramento de atividades físicas, treinos e desempenho esportivo.</p>
                <div className="legal-notice">
                  <i className="fas fa-balance-scale"></i>
                  <p><strong>Base legal:</strong> Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e demais legislações aplicáveis sobre privacidade e proteção de dados no Brasil.</p>
                </div>
              </div>

              {/* Seção 2 - Coleta de Dados */}
              <div id="coleta" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-database"></i>
                  </div>
                  <h2>Informações que coletamos</h2>
                </div>
                <p>Para oferecer a melhor experiência na Forza, coletamos os seguintes tipos de informação:</p>
                
                <div className="info-category">
                  <h3><i className="fas fa-user-circle"></i> Dados de identificação e cadastro</h3>
                  <div className="info-grid">
                    <div className="info-card"><i className="fas fa-user"></i><h4>Dados pessoais básicos</h4><p>Nome completo, data de nascimento, gênero, foto de perfil</p></div>
                    <div className="info-card"><i className="fas fa-envelope"></i><h4>Contato</h4><p>E-mail, telefone, endereço (opcional)</p></div>
                    <div className="info-card"><i className="fas fa-map-marker-alt"></i><h4>Localização</h4><p>CEP, cidade, estado, país</p></div>
                  </div>
                </div>

                <div className="info-category">
                  <h3><i className="fas fa-heartbeat"></i> Dados de saúde e desempenho físico</h3>
                  <div className="info-grid">
                    <div className="info-card"><i className="fas fa-running"></i><h4>Atividades físicas</h4><p>Distância percorrida, tempo, ritmo, passos, calorias queimadas</p></div>
                    <div className="info-card"><i className="fas fa-heart"></i><h4>Dados biométricos</h4><p>Frequência cardíaca, VO2 máximo, pressão arterial (quando fornecido)</p></div>
                    <div className="info-card"><i className="fas fa-chart-line"></i><h4>Desempenho</h4><p>Histórico de treinos, recordes pessoais, evolução de performance</p></div>
                    <div className="info-card"><i className="fas fa-bed"></i><h4>Sono e recuperação</h4><p>Padrões de sono, qualidade do descanso, níveis de energia</p></div>
                    <div className="info-card"><i className="fas fa-weight-scale"></i><h4>Dados antropométricos</h4><p>Peso, altura, IMC, composição corporal</p></div>
                  </div>
                </div>

                <div className="info-category">
                  <h3><i className="fas fa-mobile-alt"></i> Dados técnicos e de uso</h3>
                  <div className="info-grid">
                    <div className="info-card"><i className="fas fa-mobile"></i><h4>Dispositivo</h4><p>Modelo, sistema operacional, versão do app, identificador único</p></div>
                    <div className="info-card"><i className="fas fa-chart-simple"></i><h4>Comportamento de uso</h4><p>Páginas visitadas, tempo de sessão, funcionalidades utilizadas</p></div>
                    <div className="info-card"><i className="fas fa-wifi"></i><h4>Conexão</h4><p>Endereço IP, provedor de internet, tipo de conexão</p></div>
                  </div>
                </div>

                <div className="info-category">
                  <h3><i className="fas fa-users"></i> Dados sociais e interações</h3>
                  <div className="info-grid">
                    <div className="info-card"><i className="fas fa-comments"></i><h4>Interações sociais</h4><p>Curtidas, comentários, menções, compartilhamentos</p></div>
                    <div className="info-card"><i className="fas fa-users"></i><h4>Clubes e grupos</h4><p>Participação em clubes, rankings, desafios em equipe</p></div>
                    <div className="info-card"><i className="fas fa-trophy"></i><h4>Conquistas</h4><p>Medalhas, badges, recordes e prêmios</p></div>
                  </div>
                </div>

                <div className="data-note">
                  <i className="fas fa-info-circle"></i>
                  <p><strong>Dados sensíveis:</strong> Alguns dados coletados (como frequência cardíaca e dados biométricos) são considerados dados pessoais sensíveis pela LGPD. Coletamos estes dados apenas com seu consentimento explícito e para finalidades específicas relacionadas ao monitoramento de sua atividade física.</p>
                </div>
              </div>

              {/* Seção 3 - Uso dos Dados */}
              <div id="uso" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <h2>Como utilizamos seus dados</h2>
                </div>
                <p>Suas informações são valiosas para melhorar sua experiência. Utilizamos os dados para as seguintes finalidades:</p>
                
                <div className="usage-grid">
                  <div className="usage-card">
                    <i className="fas fa-chart-line"></i>
                    <h4>Personalização da experiência</h4>
                    <p>Adaptamos sua interface, recomendações de treino e conteúdos com base em seu perfil, histórico e preferências.</p>
                  </div>
                  <div className="usage-card">
                    <i className="fas fa-chart-simple"></i>
                    <h4>Análise de desempenho</h4>
                    <p>Geramos estatísticas detalhadas, gráficos de evolução, insights personalizados e sugestões para melhoria contínua.</p>
                  </div>
                  <div className="usage-card">
                    <i className="fas fa-brain"></i>
                    <h4>IA e recomendações inteligentes</h4>
                    <p>Utilizamos algoritmos de machine learning para sugerir treinos personalizados, prever riscos de lesão e otimizar seu desempenho.</p>
                  </div>
                  <div className="usage-card">
                    <i className="fas fa-trophy"></i>
                    <h4>Desafios e gamificação</h4>
                    <p>Criamos desafios personalizados, rankings e sistemas de recompensa para manter sua motivação.</p>
                  </div>
                  <div className="usage-card">
                    <i className="fas fa-bell"></i>
                    <h4>Notificações inteligentes</h4>
                    <p>Enviamos alertas sobre seu progresso, lembretes de treino, metas alcançadas e novidades relevantes.</p>
                  </div>
                  <div className="usage-card">
                    <i className="fas fa-chart-column"></i>
                    <h4>Pesquisas e melhorias</h4>
                    <p>Analisamos dados agregados para melhorar nossos serviços, desenvolver novos recursos e otimizar a plataforma.</p>
                  </div>
                </div>

                <div className="usage-note">
                  <i className="fas fa-scale-balanced"></i>
                  <p><strong>Base legal para tratamento:</strong> Tratamos seus dados com base nas seguintes hipóteses legais: (i) execução de contrato; (ii) cumprimento de obrigação legal; (iii) legítimo interesse; (iv) consentimento do titular; e (v) proteção da vida ou da incolumidade física do titular.</p>
                </div>
              </div>

              {/* Seção 4 - Compartilhamento */}
              <div id="compartilhamento" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-share-alt"></i>
                  </div>
                  <h2>Compartilhamento de dados</h2>
                </div>
                <p>A Forza NÃO VENDE seus dados pessoais. Compartilhamos suas informações apenas nas seguintes situações:</p>
                
                <div className="share-grid">
                  <div className="share-item">
                    <i className="fas fa-hand-peace"></i>
                    <div>
                      <h4>Com seu consentimento explícito</h4>
                      <p>Quando você autoriza explicitamente o compartilhamento, como ao publicar atividades publicamente, conectar-se a redes sociais ou integrar com aplicativos de terceiros.</p>
                    </div>
                  </div>
                  <div className="share-item">
                    <i className="fas fa-gavel"></i>
                    <div>
                      <h4>Obrigação legal ou ordem judicial</h4>
                      <p>Quando exigido por lei, regulamentação aplicável, processo legal ou solicitação governamental legítima.</p>
                    </div>
                  </div>
                  <div className="share-item">
                    <i className="fas fa-building"></i>
                    <div>
                      <h4>Provedores de serviço e parceiros</h4>
                      <p>Empresas que nos auxiliam na operação da plataforma (hospedagem, analytics, suporte), sempre sob contratos que garantam a confidencialidade e segurança dos dados.</p>
                    </div>
                  </div>
                  <div className="share-item">
                    <i className="fas fa-chart-line"></i>
                    <div>
                      <h4>Dados anonimizados</h4>
                      <p>Compartilhamos estatísticas agregadas e anonimizadas para pesquisas, estudos de mercado e melhorias do setor esportivo.</p>
                    </div>
                  </div>
                  <div className="share-item">
                    <i className="fas fa-merge"></i>
                    <div>
                      <h4>Reestruturação societária</h4>
                      <p>Em caso de fusão, aquisição ou venda da empresa, os dados poderão ser transferidos, mantendo os mesmos compromissos de privacidade.</p>
                    </div>
                  </div>
                </div>

                <div className="share-warning">
                  <i className="fas fa-eye"></i>
                  <p><strong>Visibilidade pública:</strong> Lembre-se que atividades, posts e comentários que você compartilha publicamente podem ser vistos por outros usuários. Revise suas configurações de privacidade para controlar quem pode ver suas informações.</p>
                </div>
              </div>

              {/* Seção 5 - Segurança */}
              <div id="seguranca" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <h2>Segurança dos dados</h2>
                </div>
                <p>Implementamos medidas robustas de segurança para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição:</p>
                
                <div className="security-features">
                  <div className="feature"><i className="fas fa-lock"></i><span>Criptografia AES-256 em repouso</span></div>
                  <div className="feature"><i className="fas fa-shield"></i><span>Criptografia TLS 1.3 em trânsito</span></div>
                  <div className="feature"><i className="fas fa-fingerprint"></i><span>Autenticação em dois fatores (2FA)</span></div>
                  <div className="feature"><i className="fas fa-chart-line"></i><span>Monitoramento 24/7 e detecção de intrusão</span></div>
                  <div className="feature"><i className="fas fa-database"></i><span>Backups criptografados e redundantes</span></div>
                  <div className="feature"><i className="fas fa-user-shield"></i><span>Controle de acesso baseado em roles (RBAC)</span></div>
                  <div className="feature"><i className="fas fa-bug"></i><span>Testes de penetração regulares</span></div>
                  <div className="feature"><i className="fas fa-clipboard-list"></i><span>Auditorias de segurança anuais</span></div>
                </div>

                <div className="security-practices">
                  <h4>Boas práticas recomendadas para você:</h4>
                  <ul>
                    <li><i className="fas fa-key"></i> Utilize uma senha forte e única para sua conta Forza</li>
                    <li><i className="fas fa-mobile-alt"></i> Mantenha seu aplicativo e sistema operacional atualizados</li>
                    <li><i className="fas fa-share-alt"></i> Não compartilhe suas credenciais de acesso com terceiros</li>
                    <li><i className="fas fa-bell"></i> Ative as notificações de login para monitorar acessos suspeitos</li>
                  </ul>
                </div>

                <div className="security-note">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>Apesar de adotarmos as melhores práticas de segurança, nenhum sistema é 100% invulnerável. Em caso de violação de dados, notificaremos os usuários e as autoridades competentes dentro do prazo estabelecido pela LGPD (48 horas).</p>
                </div>
              </div>

              {/* Seção 6 - Direitos do Titular */}
              <div id="direitos" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-user-check"></i>
                  </div>
                  <h2>Seus direitos como titular de dados</h2>
                </div>
                <p>A LGPD garante a você, titular dos dados, diversos direitos que podem ser exercidos a qualquer momento, de forma gratuita:</p>
                
                <div className="rights-grid">
                  <div className="right-item"><i className="fas fa-eye"></i><div><strong>Confirmação e acesso</strong><span>Saber se tratamos seus dados e acessá-los integralmente</span></div></div>
                  <div className="right-item"><i className="fas fa-pen"></i><div><strong>Correção</strong><span>Solicitar a correção de dados incompletos, inexatos ou desatualizados</span></div></div>
                  <div className="right-item"><i className="fas fa-ban"></i><div><strong>Anonimização ou bloqueio</strong><span>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</span></div></div>
                  <div className="right-item"><i className="fas fa-trash-alt"></i><div><strong>Eliminação</strong><span>Solicitar a eliminação dos dados tratados com seu consentimento</span></div></div>
                  <div className="right-item"><i className="fas fa-download"></i><div><strong>Portabilidade</strong><span>Receber seus dados em formato estruturado e transferi-los a outro fornecedor</span></div></div>
                  <div className="right-item"><i className="fas fa-comment-slash"></i><div><strong>Revogação de consentimento</strong><span>Revogar seu consentimento a qualquer momento</span></div></div>
                  <div className="right-item"><i className="fas fa-gavel"></i><div><strong>Oposição</strong><span>Opor-se a tratamentos baseados em legítimo interesse</span></div></div>
                  <div className="right-item"><i className="fas fa-chart-line"></i><div><strong>Revisão de decisões automatizadas</strong><span>Solicitar revisão de decisões baseadas exclusivamente em tratamento automatizado</span></div></div>
                </div>

                <div className="rights-howto">
                  <h4><i className="fas fa-clipboard-list"></i> Como exercer seus direitos:</h4>
                  <ol>
                    <li>Acesse <strong>Configurações → Privacidade → Meus Dados</strong> no aplicativo ou plataforma web</li>
                    <li>Envie um e-mail para <strong>privacidade@forza.com</strong> com o assunto "LGPD - Solicitação do titular"</li>
                    <li>Utilize nosso <strong>Formulário de Solicitação de Dados</strong> disponível na Central de Suporte</li>
                  </ol>
                  <p>Responderemos sua solicitação em até <strong>15 dias úteis</strong>, conforme previsto na LGPD. Em casos complexos, este prazo poderá ser estendido mediante justificativa.</p>
                </div>
              </div>

              {/* Seção 7 - Retenção */}
              <div id="retencao" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <h2>Retenção e armazenamento de dados</h2>
                </div>
                <p>Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades para as quais foram coletados, conforme estabelecido nesta política e de acordo com a legislação aplicável.</p>
                
                <div className="retention-table">
                  <div className="retention-row">
                    <div className="retention-type">Dados de cadastro e perfil</div>
                    <div className="retention-period">Até a exclusão da sua conta + 180 dias</div>
                  </div>
                  <div className="retention-row">
                    <div className="retention-type">Histórico de atividades e treinos</div>
                    <div className="retention-period">5 anos após a última atividade</div>
                  </div>
                  <div className="retention-row">
                    <div className="retention-type">Dados biométricos e de saúde</div>
                    <div className="retention-period">3 anos após a última atividade ou até revogação do consentimento</div>
                  </div>
                  <div className="retention-row">
                    <div className="retention-type">Interações sociais (posts, comentários)</div>
                    <div className="retention-period">Até a exclusão da sua conta</div>
                  </div>
                  <div className="retention-row">
                    <div className="retention-type">Dados de pagamento e transações</div>
                    <div className="retention-period">5 anos (conforme legislação fiscal)</div>
                  </div>
                  <div className="retention-row">
                    <div className="retention-type">Logs de acesso e segurança</div>
                    <div className="retention-period">6 meses (conforme Marco Civil da Internet)</div>
                  </div>
                </div>

                <div className="retention-note">
                  <i className="fas fa-info-circle"></i>
                  <div>
                    <strong>Exclusão de conta:</strong> Ao solicitar a exclusão de sua conta, iniciaremos o processo de eliminação de seus dados. Alguns dados poderão ser mantidos por período adicional para cumprimento de obrigações legais, resolução de disputas ou execução de contratos.
                  </div>
                </div>
              </div>

              {/* Seção 8 - Menores */}
              <div id="menores" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-child"></i>
                  </div>
                  <h2>Dados de menores de idade</h2>
                </div>
                <div className="minor-section">
                  <div className="minor-card warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <div>
                      <h4>Restrição de idade</h4>
                      <p>A Forza não é destinada a menores de 13 anos. Não coletamos intencionalmente dados pessoais de crianças.</p>
                    </div>
                  </div>
                  
                  <div className="minor-card info">
                    <i className="fas fa-info-circle"></i>
                    <div>
                      <h4>Faixa etária de 13 a 18 anos</h4>
                      <p>Para usuários entre 13 e 18 anos, exigimos o consentimento explícito de um dos pais ou responsável legal. O responsável pode solicitar acesso, correção ou exclusão dos dados do menor a qualquer momento.</p>
                    </div>
                  </div>
                  
                  <div className="minor-card action">
                    <i className="fas fa-bell"></i>
                    <div>
                      <h4>Como proceder se identificarmos dados de menores não autorizados?</h4>
                      <p>Se você é responsável por um menor e acredita que ele nos forneceu dados sem sua autorização, entre em contato imediatamente com nosso Encarregado de Dados para remoção das informações.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 9 - Cookies */}
              <div id="cookies" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-cookie-bite"></i>
                  </div>
                  <h2>Política de Cookies</h2>
                </div>
                <p>Utilizamos cookies e tecnologias similares para melhorar sua experiência, personalizar conteúdo, lembrar preferências e analisar o uso da plataforma.</p>

                <div className="cookies-table">
                  <div className="cookie-category">
                    <div className="cookie-header">
                      <i className="fas fa-shield"></i>
                      <h4>Cookies Essenciais</h4>
                      <span className="cookie-badge">Sempre ativos</span>
                    </div>
                    <p>Necessários para o funcionamento básico da plataforma. Permitem navegação, autenticação e segurança.</p>
                  </div>
                  <div className="cookie-category">
                    <div className="cookie-header">
                      <i className="fas fa-sliders-h"></i>
                      <h4>Cookies de Preferências</h4>
                      <span className="cookie-badge custom">Configurável</span>
                    </div>
                    <p>Lembram suas configurações, como idioma, tema e preferências de notificação.</p>
                  </div>
                  <div className="cookie-category">
                    <div className="cookie-header">
                      <i className="fas fa-chart-line"></i>
                      <h4>Cookies de Análise</h4>
                      <span className="cookie-badge custom">Configurável</span>
                    </div>
                    <p>Coletam informações anônimas sobre como você usa nosso site para melhorias contínuas.</p>
                  </div>
                  <div className="cookie-category">
                    <div className="cookie-header">
                      <i className="fas fa-ad"></i>
                      <h4>Cookies de Marketing</h4>
                      <span className="cookie-badge custom">Configurável</span>
                    </div>
                    <p>Utilizados para exibir anúncios relevantes e medir eficácia de campanhas.</p>
                  </div>
                </div>

                <div className="cookies-types">
                  <span className="cookie-tag">Essenciais</span>
                  <span className="cookie-tag">Preferências</span>
                  <span className="cookie-tag">Análise</span>
                  <span className="cookie-tag">Marketing</span>
                </div>

                <div className="cookie-controls">
                  <h4><i className="fas fa-sliders-h"></i> Gerenciar preferências de cookies</h4>
                  <p>Você pode configurar suas preferências de cookies a qualquer momento no seu navegador ou nas configurações do aplicativo.</p>
                  <button className="cookie-settings-btn" onClick={openCookieSettings}>Configurações do navegador</button>
                </div>
              </div>

              {/* Seção 10 - Transferências Internacionais */}
              <div id="transferencias" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-globe"></i>
                  </div>
                  <h2>Transferências internacionais de dados</h2>
                </div>
                <p>A Forza pode transferir seus dados pessoais para outros países, incluindo servidores localizados nos Estados Unidos e na União Europeia, onde nossos provedores de infraestrutura estão sediados.</p>
                
                <div className="transfer-info">
                  <div className="transfer-card">
                    <i className="fas fa-shield-alt"></i>
                    <div>
                      <h4>Garantias de segurança internacional</h4>
                      <p>Todas as transferências internacionais são realizadas em conformidade com a LGPD, adotando cláusulas contratuais específicas, regras corporativas globais e mecanismos de certificação que garantem o mesmo nível de proteção exigido pela legislação brasileira.</p>
                    </div>
                  </div>
                  <div className="transfer-card">
                    <i className="fas fa-flag-checkered"></i>
                    <div>
                      <h4>Países com nível adequado de proteção</h4>
                      <p>Priorizamos a transferência para países com legislação de proteção de dados considerada adequada pela ANPD (Autoridade Nacional de Proteção de Dados).</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 11 - LGPD */}
              <div id="lgpd" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-gavel"></i>
                  </div>
                  <h2>Conformidade com a LGPD</h2>
                </div>
                
                <div className="lgpd-compliance">
                  <div className="compliance-item">
                    <i className="fas fa-check-circle"></i>
                    <div>
                      <h4>Encarregado de Dados (DPO)</h4>
                      <p>Designamos um Encarregado de Proteção de Dados para atuar como canal de comunicação entre a Forza, os titulares dos dados e a ANPD.</p>
                    </div>
                  </div>
                  <div className="compliance-item">
                    <i className="fas fa-check-circle"></i>
                    <div>
                      <h4>Registro de operações de tratamento</h4>
                      <p>Mantemos um registro detalhado de todas as operações de tratamento de dados pessoais realizadas pela Forza.</p>
                    </div>
                  </div>
                  <div className="compliance-item">
                    <i className="fas fa-check-circle"></i>
                    <div>
                      <h4>Avaliação de impacto</h4>
                      <p>Realizamos avaliações de impacto à proteção de dados para operações que oferecem alto risco aos titulares.</p>
                    </div>
                  </div>
                  <div className="compliance-item">
                    <i className="fas fa-check-circle"></i>
                    <div>
                      <h4>Relatório de impacto à proteção de dados</h4>
                      <p>Disponibilizamos nosso RIPD mediante solicitação formal à ANPD ou aos titulares.</p>
                    </div>
                  </div>
                </div>

                <div className="anpd-info">
                  <i className="fas fa-building"></i>
                  <div>
                    <h4>Autoridade Nacional de Proteção de Dados (ANPD)</h4>
                    <p>Caso entenda que seus direitos não foram respeitados, você pode registrar uma reclamação junto à ANPD através do site <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">www.gov.br/anpd</a>.</p>
                  </div>
                </div>
              </div>

              {/* Seção 12 - Contato e DPO */}
              <div id="contato" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-headset"></i>
                  </div>
                  <h2>Contato e Encarregado de Dados (DPO)</h2>
                </div>
                
                <div className="contact-card-full">
                  <div className="contact-dpo">
                    <i className="fas fa-user-tie"></i>
                    <div>
                      <h3>Encarregado de Proteção de Dados</h3>
                      <p><strong>Nome:</strong> Dra. Mariana Santos, CIPP/E, CIPM</p>
                      <p><strong>E-mail:</strong> dpo@forza.com</p>
                      <p><strong>Telefone:</strong> (12) 99729-1076</p>
                      <p><strong>Horário de atendimento:</strong> Segunda a Sexta, 9h às 18h</p>
                    </div>
                  </div>
                  
                  <div className="contact-channels">
                    <h3><i className="fas fa-envelope"></i> Canais oficiais de comunicação</h3>
                    <div className="contact-links">
                      <a href="mailto:privacidade@forza.com" className="contact-link">
                        <i className="fas fa-envelope"></i>
                        <div>
                          <strong>Privacidade e Dados</strong>
                          <span>privacidade@forza.com</span>
                        </div>
                      </a>
                      <a href="mailto:suporte@forza.com" className="contact-link">
                        <i className="fas fa-headset"></i>
                        <div>
                          <strong>Suporte técnico</strong>
                          <span>suporte@forza.com</span>
                        </div>
                      </a>
                      <a href="tel:+5512997291076" className="contact-link">
                        <i className="fas fa-phone-alt"></i>
                        <div>
                          <strong>Central de atendimento</strong>
                          <span>(12) 99729-1076</span>
                        </div>
                      </a>
                      <a href="/suporte" className="contact-link">
                        <i className="fas fa-comments"></i>
                        <div>
                          <strong>Chat ao vivo</strong>
                          <span>Disponível 24/7</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer da política */}
              <div className="privacidade-footer-info">
                <div className="update-info">
                  <i className="fas fa-sync-alt"></i>
                  <div>
                    <strong>Atualizações desta política</strong>
                    <p>Esta política pode ser atualizada periodicamente para refletir mudanças em nossas práticas de privacidade ou alterações na legislação. Recomendamos revisar esta página regularmente. A data da última atualização está destacada no topo da página.</p>
                    <p>Em caso de alterações significativas, notificaremos você através do e-mail cadastrado ou por meio de um aviso em destaque em nossa plataforma.</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Privacidade;