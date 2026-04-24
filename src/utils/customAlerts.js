// ============================================
// FORZA Custom Alerts - Enterprise Professional (Sem Ícones)
// ============================================

// Função para criar o overlay do alert
const createOverlay = () => {
  const overlay = document.createElement('div')
  overlay.className = 'forza-alert-overlay'
  return overlay
}

// Função para remover o alert
const removeAlert = (overlay) => {
  if (!overlay || !overlay.parentNode) return
  overlay.style.animation = 'forzaFadeOut 0.2s ease-out'
  setTimeout(() => {
    if (overlay.parentNode) overlay.remove()
  }, 200)
}

// Função auxiliar para escapar HTML
const escapeHtml = (text) => {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Alert personalizado - SEM ÍCONE
export const forzaAlert = (message, title = 'Atenção', type = 'info') => {
  return new Promise((resolve) => {
    const overlay = createOverlay()
    
    overlay.innerHTML = `
      <div class="forza-alert ${type}">
        <div class="forza-alert-header">
          <h3>${escapeHtml(title)}</h3>
        </div>
        <div class="forza-alert-body">
          <div class="forza-alert-message">${escapeHtml(message)}</div>
        </div>
        <div class="forza-alert-footer">
          <button class="forza-alert-btn forza-alert-btn-confirm" id="forzaAlertConfirm">OK</button>
        </div>
      </div>
    `
    
    document.body.appendChild(overlay)
    
    const confirmBtn = overlay.querySelector('#forzaAlertConfirm')
    
    const cleanup = () => {
      removeAlert(overlay)
      resolve(true)
    }
    
    confirmBtn.addEventListener('click', cleanup)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup()
    })
  })
}

// Confirm personalizado - SEM ÍCONE
export const forzaConfirm = (message, title = 'Confirmar') => {
  return new Promise((resolve) => {
    const overlay = createOverlay()
    
    overlay.innerHTML = `
      <div class="forza-alert">
        <div class="forza-alert-header">
          <h3>${escapeHtml(title)}</h3>
        </div>
        <div class="forza-alert-body">
          <div class="forza-alert-message">${escapeHtml(message)}</div>
        </div>
        <div class="forza-alert-footer">
          <button class="forza-alert-btn forza-alert-btn-cancel" id="forzaAlertCancel">Cancelar</button>
          <button class="forza-alert-btn forza-alert-btn-confirm" id="forzaAlertConfirm">Confirmar</button>
        </div>
      </div>
    `
    
    document.body.appendChild(overlay)
    
    const confirmBtn = overlay.querySelector('#forzaAlertConfirm')
    const cancelBtn = overlay.querySelector('#forzaAlertCancel')
    
    const handleConfirm = () => {
      removeAlert(overlay)
      resolve(true)
    }
    
    const handleCancel = () => {
      removeAlert(overlay)
      resolve(false)
    }
    
    confirmBtn.addEventListener('click', handleConfirm)
    cancelBtn.addEventListener('click', handleCancel)
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) handleCancel()
    })
  })
}

// Prompt personalizado - SEM ÍCONE
export const forzaPrompt = (message, defaultValue = '', title = 'Entrada de dados') => {
  return new Promise((resolve) => {
    const overlay = createOverlay()
    
    overlay.innerHTML = `
      <div class="forza-alert">
        <div class="forza-alert-header">
          <h3>${escapeHtml(title)}</h3>
        </div>
        <div class="forza-alert-body">
          <div class="forza-alert-message">${escapeHtml(message)}</div>
          <input type="text" class="forza-alert-input" id="forzaAlertInput" value="${escapeHtml(defaultValue)}" placeholder="Digite aqui..." autocomplete="off">
        </div>
        <div class="forza-alert-footer">
          <button class="forza-alert-btn forza-alert-btn-cancel" id="forzaAlertCancel">Cancelar</button>
          <button class="forza-alert-btn forza-alert-btn-confirm" id="forzaAlertConfirm">OK</button>
        </div>
      </div>
    `
    
    document.body.appendChild(overlay)
    
    const input = overlay.querySelector('#forzaAlertInput')
    const confirmBtn = overlay.querySelector('#forzaAlertConfirm')
    const cancelBtn = overlay.querySelector('#forzaAlertCancel')
    
    input.focus()
    input.select()
    
    const handleConfirm = () => {
      removeAlert(overlay)
      resolve(input.value)
    }
    
    const handleCancel = () => {
      removeAlert(overlay)
      resolve(null)
    }
    
    confirmBtn.addEventListener('click', handleConfirm)
    cancelBtn.addEventListener('click', handleCancel)
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleConfirm()
    })
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) handleCancel()
    })
  })
}

// Toast notification - SEM ÍCONE
export const forzaToast = (message, type = 'info', duration = 3000) => {
  const toast = document.createElement('div')
  toast.className = `forza-toast forza-toast-${type}`
  
  toast.innerHTML = `
    <div class="forza-toast-message">${escapeHtml(message)}</div>
  `
  
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.animation = 'forzaToastOut 0.2s ease-out forwards'
    setTimeout(() => {
      if (toast.parentNode) toast.remove()
    }, 200)
  }, duration)
}

// Adicionar animações
const addStyles = () => {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes forzaFadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    @keyframes forzaToastOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(20px);
      }
    }
  `
  document.head.appendChild(style)
}

addStyles()

// ============================================
// SUBSTITUIÇÃO GLOBAL DOS ALERTS NATIVOS
// ============================================

window.originalAlert = window.alert
window.alert = (message) => {
  forzaAlert(message, 'Atenção', 'info')
}

window.originalConfirm = window.confirm
window.confirm = (message) => {
  return forzaConfirm(message, 'Confirmar')
}

window.originalPrompt = window.prompt
window.prompt = (message, defaultValue) => {
  return forzaPrompt(message, defaultValue || '', 'Entrada de dados')
}

console.log('Forza Alerts: Sistema profissional ativado (sem ícones)')