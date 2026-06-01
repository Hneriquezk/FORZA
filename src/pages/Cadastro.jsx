import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { useTheme } from '../contexts/ThemeContext'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import './cadastro.css'

function Cadastro() {
  const navigate = useNavigate()
  const { cadastrar } = useAuth()
  const { addNotification } = useNotifications()
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha) {
      setError('Por favor, preencha todos os campos!')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um e-mail válido!')
      return
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres!')
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem!')
      return
    }

    setLoading(true)

    const result = await cadastrar({
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha
    })
    
    console.log('Resultado do cadastro:', result)
    
    if (result.success) {
      addNotification('🎉 Conta criada!', `Bem-vindo ${formData.nome}! Faça login para começar.`, 'success', 'fa-check-circle')
      
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } else {
      console.error('Erro detalhado:', result.error)
      setError(result.error || 'Erro ao realizar cadastro. Tente novamente.')
    }
    
    setLoading(false)
  }

  const handleGoBack = () => {
    navigate(-1) // Volta para a página anterior
  }

  return (
    <div className="cadastro-page-wrapper">
      <Header />
      
      <div className="cadastro-container">
        {/* Botão de voltar */}
        <button onClick={handleGoBack} className="cadastro-btn-back" aria-label="Voltar">
          ← Voltar
        </button>

        <div className="cadastro-col-left">
          <img
            src="/img/cadastro1.png"
            alt="Atleta nadando"
            className="cadastro-col-image"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=800&fit=crop' }}
          />
        </div>

        <div className="cadastro-col-center">
          <div className="cadastro-form-container">
            <div className="cadastro-logo-area">
              <div className="cadastro-logo-wrapper">
                <img
                  src="/img/logo.png"
                  alt="Forza Logo"
                  className="cadastro-logo"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/130x130/000000/ffffff?text=F' }}
                />
              </div>
            </div>

            <div className="cadastro-slogan-area">
              <p className="cadastro-slogan-title">A motivação vem de quem caminha com você</p>
              <p className="cadastro-slogan-description">
                Faça parte da Forza e treine junto com uma comunidade que te puxa pra frente. É grátis.
              </p>
            </div>

            <div className="cadastro-links-area">
              <span className="cadastro-link" onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Fazer login</span>
              <span className="cadastro-separator">•</span>
              <span className="cadastro-link active">Cadastrar</span>
            </div>

            <form onSubmit={handleSubmit} className="cadastro-form-area">
              <div className="cadastro-input-group">
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome completo"
                  className="cadastro-input-field"
                  disabled={loading}
                />
              </div>

              <div className="cadastro-input-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="E-mail"
                  className="cadastro-input-field"
                  disabled={loading}
                />
              </div>

              <div className="cadastro-input-group">
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Senha (mínimo 6 caracteres)"
                  className="cadastro-input-field"
                  disabled={loading}
                />
              </div>

              <div className="cadastro-input-group">
                <input
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Confirmar senha"
                  className="cadastro-input-field"
                  disabled={loading}
                />
              </div>

              {error && <div className="cadastro-error-msg">{error}</div>}

              <button type="submit" className="cadastro-btn-submit" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </form>

            <div className="cadastro-footer-area">
              <p className="cadastro-privacy">
                Privacidade por mCAPTCHA -
                <a href="/privacidade"> Privacidade</a> |
                <a href="/condicoes"> Condições</a>
              </p>
            </div>
          </div>
        </div>

        <div className="cadastro-col-right">
          <img
            src="/img/cadastro2.png"
            alt="Atleta correndo"
            className="cadastro-col-image"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=800&fit=crop' }}
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Cadastro