import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { useTheme } from '../contexts/ThemeContext'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import './login.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addNotification } = useNotifications()
  const { theme } = useTheme()
  const [credentials, setCredentials] = useState({
    email: '',
    senha: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials({
      ...credentials,
      [name]: value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!credentials.email || !credentials.senha) {
      setError('Por favor, preencha todos os campos!')
      return
    }

    setLoading(true)
    
    const result = await login(credentials.email, credentials.senha)
    
    if (result.success) {
      addNotification('👋 Bem-vindo!', `Olá ${result.user.nome}! Seja bem-vindo ao Forza.`, 'success', 'fa-hand-peace')
      navigate('/painel')
    } else {
      setError(result.error || 'Email ou senha incorretos!')
    }
    
    setLoading(false)
  }

  const handleGoBack = () => {
    navigate(-1) // Volta para a página anterior
  }

  return (
    <div className="login-page-wrapper">
      <Header />
      
      <div className="login-container">
        {/* Botão de voltar */}
        <button onClick={handleGoBack} className="btn-back" aria-label="Voltar">
          ← Voltar
        </button>

        <div className="col-left">
          <img
            src="/img/login1.png"
            alt="Treino Forza"
            className="col-image"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=800&fit=crop' }}
          />
        </div>

        <div className="col-center">
          <div className="form-container">
            <div className="logo-area">
              <div className="logo-wrapper">
                <img
                  src="/img/logo.png"
                  alt="Forza Logo"
                  className="logo_simbolo"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/130x130/000000/ffffff?text=F' }}
                />
              </div>
            </div>

            <div className="slogan-area">
              <p className="slogan-title">A motivação vem de quem caminha com você</p>
              <p className="slogan-description">
                Faça parte da Forza e treine junto com uma comunidade que te puxa pra frente. É grátis.
              </p>
            </div>

            <div className="links-area">
              <span className="link active">Fazer login</span>
              <span className="separator">•</span>
              <span className="link" onClick={() => navigate('/cadastro')} style={{ cursor: 'pointer' }}>Cadastrar</span>
            </div>

            <form onSubmit={handleSubmit} className="form-area">
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="E-mail"
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  name="senha"
                  value={credentials.senha}
                  onChange={handleChange}
                  placeholder="Senha"
                  className="input-field"
                  disabled={loading}
                />
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="footer-area">
              <p className="privacy">
                Privacidade por mCAPTCHA -
                <a href="/privacidade"> Privacidade</a> |
                <a href="/condicoes"> Condições</a>
              </p>
            </div>
          </div>
        </div>

        <div className="col-right">
          <img
            src="/img/login2.png"
            alt="Comunidade Forza"
            className="col-image"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=800&fit=crop' }}
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Login