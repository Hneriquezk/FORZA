import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro capturado:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ff1e2d', marginBottom: '20px' }}></i>
          <h2>Algo deu errado!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
            {this.state.error?.message || 'Ocorreu um erro inesperado.'}
          </p>
          <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px', overflow: 'auto' }}>
            <summary style={{ cursor: 'pointer', color: '#ff1e2d' }}>Ver detalhes técnicos</summary>
            <pre style={{ fontSize: '12px', background: '#1a1a1a', padding: '10px', borderRadius: '8px', overflow: 'auto', maxHeight: '200px' }}>
              {this.state.error?.stack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: '#ff1e2d',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '40px',
              cursor: 'pointer',
              marginTop: '30px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Recarregar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary