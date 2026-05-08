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
  const footerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Detectar scroll para mostrar/esconder o botão e verificar proximidade com footer
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Mostrar botão após rolar 300px
      if (scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
      
      // Verificar se está próximo ao footer (últimos 150px da página)
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

  const sections = [
    { id: 'coleta', title: 'Informações que coletamos', icon: 'fa-database' },
    { id: 'uso', title: 'Como utilizamos seus dados', icon: 'fa-chart-line' },
    { id: 'compartilhamento', title: 'Compartilhamento de dados', icon: 'fa-share-alt' },
    { id: 'seguranca', title: 'Segurança dos dados', icon: 'fa-shield-alt' },
    { id: 'direitos', title: 'Seus direitos', icon: 'fa-user-check' },
    { id: 'retencao', title: 'Retenção de dados', icon: 'fa-clock' },
    { id: 'menores', title: 'Dados de menores', icon: 'fa-child' },
    { id: 'cookies', title: 'Cookies', icon: 'fa-cookie-bite' }
  ];

  return (
    <>
      <Header />
      
      <div className="privacidade-page">
        {/* Botão Voltar ao Topo */}
        <button 
          ref={buttonRef}
          className={`scroll-top-btn ${showScrollTop ? 'visible' : ''} ${isNearFooter ? 'near-footer' : ''}`}
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          style={isNearFooter ? {
            position: 'absolute',
            bottom: '80px',
            right: '30px'
          } : {}}
        >
          <i className="fas fa-arrow-up"></i>
        </button>

        <div className="privacidade-hero">
          <div className="privacidade-hero-content">
            <div className="privacidade-hero-badge">
              <i className="fas fa-shield-alt"></i>
              <span>Atualizado em 04/05/2026</span>
            </div>
            <h1>Política de Privacidade</h1>
            <p>Na Forza, sua privacidade é nossa prioridade. Saiba como protegemos e utilizamos seus dados.</p>
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
                    className="sidebar-link"
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
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className="privacidade-main">
            {/* ... todo o conteúdo da página permanece o mesmo ... */}
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
                  <p>Estamos totalmente alinhados com as leis de proteção de dados</p>
                </div>
              </div>
            </div>

            <div className="privacidade-sections">
              {/* Seção 1 - Coleta */}
              <div id="coleta" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-database"></i>
                  </div>
                  <h2>Informações que coletamos</h2>
                </div>
                <p>Para oferecer a melhor experiência na Forza, coletamos os seguintes tipos de informação:</p>
                <div className="info-grid">
                  <div className="info-card"><i className="fas fa-user"></i><h4>Dados de cadastro</h4><p>Nome, e-mail, data de nascimento e localização</p></div>
                  <div className="info-card"><i className="fas fa-running"></i><h4>Dados de atividades</h4><p>Distância, tempo, ritmo, calorias e histórico de treinos</p></div>
                  <div className="info-card"><i className="fas fa-mobile-alt"></i><h4>Dados de dispositivos</h4><p>Informações do aparelho e sistema operacional</p></div>
                  <div className="info-card"><i className="fas fa-map-marker-alt"></i><h4>Dados de localização</h4><p>GPS para registrar rotas e distâncias (com sua permissão)</p></div>
                  <div className="info-card"><i className="fas fa-comments"></i><h4>Interações sociais</h4><p>Curtidas, comentários e participação em clubes</p></div>
                  <div className="info-card"><i className="fas fa-chart-line"></i><h4>Dados de desempenho</h4><p>VO2 máximo, frequência cardíaca e evolução</p></div>
                </div>
              </div>

              {/* Seção 2 - Uso */}
              <div id="uso" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <h2>Como utilizamos seus dados</h2>
                </div>
                <p>Suas informações são valiosas para melhorar sua experiência. Utilizamos os dados para:</p>
                <ul className="styled-list">
                  <li><i className="fas fa-check"></i> Personalizar sua experiência na plataforma</li>
                  <li><i className="fas fa-check"></i> Fornecer análises de desempenho e recomendações de treino</li>
                  <li><i className="fas fa-check"></i> Permitir sua participação em desafios e clubes</li>
                  <li><i className="fas fa-check"></i> Melhorar continuamente nossos serviços</li>
                  <li><i className="fas fa-check"></i> Enviar notificações relevantes sobre seu progresso</li>
                  <li><i className="fas fa-check"></i> Garantir a segurança da plataforma</li>
                </ul>
              </div>

              {/* Seção 3 - Compartilhamento */}
              <div id="compartilhamento" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-share-alt"></i>
                  </div>
                  <h2>Compartilhamento de dados</h2>
                </div>
                <p>A Forza não vende seus dados. Compartilhamos apenas quando necessário:</p>
                <div className="share-grid">
                  <div className="share-item"><i className="fas fa-hand-peace"></i><div><h4>Com seu consentimento</h4><p>Quando você autoriza publicamente (ex: posts e atividades)</p></div></div>
                  <div className="share-item"><i className="fas fa-gavel"></i><div><h4>Obrigação legal</h4><p>Quando exigido por lei ou ordem judicial</p></div></div>
                  <div className="share-item"><i className="fas fa-building"></i><div><h4>Provedores de serviço</h4><p>Parceiros que auxiliam na operação (com confidencialidade)</p></div></div>
                </div>
              </div>

              {/* Seção 4 - Segurança */}
              <div id="seguranca" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <h2>Segurança dos dados</h2>
                </div>
                <p>Implementamos medidas robustas para proteger suas informações:</p>
                <div className="security-features">
                  <div className="feature"><i className="fas fa-lock"></i><span>Criptografia AES-256</span></div>
                  <div className="feature"><i className="fas fa-fingerprint"></i><span>Autenticação em dois fatores</span></div>
                  <div className="feature"><i className="fas fa-chart-line"></i><span>Monitoramento contínuo</span></div>
                  <div className="feature"><i className="fas fa-database"></i><span>Backups regulares</span></div>
                  <div className="feature"><i className="fas fa-user-shield"></i><span>Controle de acesso rigoroso</span></div>
                  <div className="feature"><i className="fas fa-bug"></i><span>Testes de penetração</span></div>
                </div>
              </div>

              {/* Seção 5 - Direitos */}
              <div id="direitos" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-user-check"></i>
                  </div>
                  <h2>Seus direitos como titular</h2>
                </div>
                <p>Você tem controle total sobre seus dados. Garantimos seus direitos:</p>
                <div className="rights-grid">
                  <div className="right-item"><i className="fas fa-eye"></i><span>Acessar seus dados</span></div>
                  <div className="right-item"><i className="fas fa-pen"></i><span>Corrigir informações</span></div>
                  <div className="right-item"><i className="fas fa-trash-alt"></i><span>Solicitar exclusão</span></div>
                  <div className="right-item"><i className="fas fa-ban"></i><span>Revogar consentimento</span></div>
                  <div className="right-item"><i className="fas fa-download"></i><span>Exportar dados</span></div>
                  <div className="right-item"><i className="fas fa-comment-slash"></i><span>Opor-se ao tratamento</span></div>
                </div>
              </div>

              {/* Seção 6 - Retenção */}
              <div id="retencao" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <h2>Retenção de dados</h2>
                </div>
                <p>Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas. Você pode solicitar a exclusão de sua conta a qualquer momento, e seus dados serão removidos conforme a lei aplicável.</p>
                <div className="retention-note">
                  <i className="fas fa-info-circle"></i>
                  <span>Período padrão de retenção: 5 anos após sua última atividade</span>
                </div>
              </div>

              {/* Seção 7 - Menores */}
              <div id="menores" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-child"></i>
                  </div>
                  <h2>Dados de menores de idade</h2>
                </div>
                <p>A Forza não é destinada a menores de 13 anos. Não coletamos intencionalmente dados de crianças. Se você é responsável e acredita que um menor nos forneceu dados, entre em contato para remoção imediata.</p>
              </div>

              {/* Seção 8 - Cookies */}
              <div id="cookies" className="privacidade-section">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-cookie-bite"></i>
                  </div>
                  <h2>Cookies e tecnologias similares</h2>
                </div>
                <p>Utilizamos cookies para melhorar sua experiência, lembrar preferências e analisar o uso da plataforma. Você pode gerenciar suas preferências nas configurações do navegador.</p>
                <div className="cookies-types">
                  <span className="cookie-tag">Essenciais</span>
                  <span className="cookie-tag">Preferências</span>
                  <span className="cookie-tag">Análise</span>
                  <span className="cookie-tag">Marketing</span>
                </div>
              </div>

              {/* Contato e atualização */}
              <div className="privacidade-footer-info">
                <div className="contact-card">
                  <h3><i className="fas fa-envelope"></i> Dúvidas ou solicitações?</h3>
                  <p>Estamos aqui para ajudar. Entre em contato conosco:</p>
                  <div className="contact-links">
                    <a href="mailto:privacidade@forza.com"><i className="fas fa-envelope"></i> privacidade@forza.com</a>
                    <a href="tel:+5512997291076"><i className="fas fa-phone-alt"></i> (12) 99729-1076</a>
                    <a href="/sobre"><i className="fas fa-headset"></i> Central de Suporte</a>
                  </div>
                </div>
                
                <div className="update-info">
                  <i className="fas fa-sync-alt"></i>
                  <div>
                    <strong>Esta política pode ser atualizada</strong>
                    <p>Recomendamos revisar esta página periodicamente. A data da última atualização está no topo da página.</p>
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