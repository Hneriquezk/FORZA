import React, { useState, useEffect, useCallback } from 'react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  isToday
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

const Calendar = ({ onSelectDate, activities, onAddActivity }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  
  // Form state
  const [activityTitle, setActivityTitle] = useState('')
  const [activityType, setActivityType] = useState('running')
  const [activityDistance, setActivityDistance] = useState('')
  const [activityTime, setActivityTime] = useState('')
  const [activityDescription, setActivityDescription] = useState('')

  // Atividades salvas no localStorage
  const [savedActivities, setSavedActivities] = useState(activities || {})

  useEffect(() => {
    const stored = localStorage.getItem('calendar_activities')
    if (stored) {
      setSavedActivities(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('calendar_activities', JSON.stringify(savedActivities))
  }, [savedActivities])

  // Função para gerar os dias do mês
  const generateDays = useCallback(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })
    
    const rows = []
    let days = []
    let day = startDate
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateCopy = day
        const formattedDate = format(dateCopy, 'd')
        const isCurrentMonth = isSameMonth(dateCopy, currentMonth)
        const isSelected = isSameDay(dateCopy, selectedDate)
        const isTodayDate = isToday(dateCopy)
        const dateKey = format(dateCopy, 'yyyy-MM-dd')
        const hasActivity = savedActivities[dateKey]
        
        days.push(
          <div
            key={dateKey}
            className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''} ${hasActivity ? 'has-activity' : ''}`}
            onClick={() => {
              setSelectedDate(dateCopy)
              if (hasActivity) {
                setSelectedActivity(hasActivity)
                setShowActivityModal(true)
              }
            }}
            onDoubleClick={() => {
              setSelectedDate(dateCopy)
              if (hasActivity) {
                const activity = savedActivities[dateKey]
                setActivityTitle(activity.title || '')
                setActivityType(activity.type || 'running')
                setActivityDistance(activity.distance || '')
                setActivityTime(activity.time || '')
                setActivityDescription(activity.description || '')
                setSelectedActivity(activity)
                setShowEditModal(true)
              } else {
                setActivityTitle('')
                setActivityType('running')
                setActivityDistance('')
                setActivityTime('')
                setActivityDescription('')
                setSelectedActivity(null)
                setShowEditModal(true)
              }
            }}
          >
            <span className="calendar-day-number">{formattedDate}</span>
            {hasActivity && (
              <div className="activity-indicator">
                <i className={`fas ${hasActivity.icon || 'fa-running'}`}></i>
              </div>
            )}
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={format(day, 'yyyy-MM-dd')} className="calendar-week">
          {days}
        </div>
      )
      days = []
    }
    return rows
  }, [currentMonth, selectedDate, savedActivities])

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const handleSaveActivity = () => {
    if (!activityTitle) {
      alert('Por favor, digite o título da atividade!')
      return
    }

    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    const newActivity = {
      id: Date.now(),
      title: activityTitle,
      type: activityType,
      distance: activityDistance,
      time: activityTime,
      description: activityDescription,
      icon: activityType === 'running' ? 'fa-running' : activityType === 'cycling' ? 'fa-bicycle' : 'fa-swimmer',
      date: dateKey,
      createdAt: new Date().toISOString()
    }

    setSavedActivities(prev => ({
      ...prev,
      [dateKey]: newActivity
    }))

    resetForm()
    setShowEditModal(false)
  }

  const handleUpdateActivity = () => {
    if (!activityTitle) {
      alert('Por favor, digite o título da atividade!')
      return
    }

    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    const updatedActivity = {
      ...selectedActivity,
      title: activityTitle,
      type: activityType,
      distance: activityDistance,
      time: activityTime,
      description: activityDescription,
      icon: activityType === 'running' ? 'fa-running' : activityType === 'cycling' ? 'fa-bicycle' : 'fa-swimmer',
      updatedAt: new Date().toISOString()
    }

    setSavedActivities(prev => ({
      ...prev,
      [dateKey]: updatedActivity
    }))

    resetForm()
    setShowEditModal(false)
    setShowActivityModal(false)
  }

  const handleRemoveActivity = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    if (savedActivities[dateKey]) {
      const newActivities = { ...savedActivities }
      delete newActivities[dateKey]
      setSavedActivities(newActivities)
      setShowActivityModal(false)
      setShowEditModal(false)
    }
  }

  const resetForm = () => {
    setActivityTitle('')
    setActivityType('running')
    setActivityDistance('')
    setActivityTime('')
    setActivityDescription('')
    setSelectedActivity(null)
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'running': return 'fa-running'
      case 'cycling': return 'fa-bicycle'
      case 'swimming': return 'fa-swimmer'
      default: return 'fa-running'
    }
  }

  const getTypeName = (type) => {
    switch(type) {
      case 'running': return 'Corrida'
      case 'cycling': return 'Ciclismo'
      case 'swimming': return 'Natação'
      default: return 'Corrida'
    }
  }

  const selectedDateActivity = savedActivities[format(selectedDate, 'yyyy-MM-dd')]
  const calendarDays = generateDays()

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="calendar-nav">
          <i className="fas fa-chevron-left"></i>
        </button>
        <h3 className="calendar-month">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="calendar-nav">
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot activity"></div>
          <span>Atividade registrada</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot today"></div>
          <span>Hoje</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot selected"></div>
          <span>Selecionado</span>
        </div>
      </div>

      <div className="calendar-instruction">
        <i className="fas fa-info-circle"></i>
        <span>Clique em um dia para ver atividades • Duplo clique para adicionar/editar</span>
      </div>

      {/* Modal de Visualização da Atividade */}
      {showActivityModal && selectedDateActivity && (
        <div className="calendar-modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h3>
                <i className="fas fa-calendar-check"></i>
                Detalhes da Atividade
              </h3>
              <button className="calendar-modal-close" onClick={() => setShowActivityModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="calendar-modal-body">
              <p className="calendar-modal-date">
                <i className="fas fa-calendar-day"></i>
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              
              <div className="activity-detail-card">
                <div className="activity-detail-icon">
                  <i className={`fas ${getTypeIcon(selectedDateActivity.type)}`}></i>
                </div>
                <div className="activity-detail-info">
                  <h4>{selectedDateActivity.title}</h4>
                  <span className="activity-type-badge">{getTypeName(selectedDateActivity.type)}</span>
                </div>
              </div>
              
              {(selectedDateActivity.distance || selectedDateActivity.time) && (
                <div className="activity-detail-stats">
                  {selectedDateActivity.distance && (
                    <div className="activity-stat">
                      <i className="fas fa-road"></i>
                      <div>
                        <span>Distância</span>
                        <strong>{selectedDateActivity.distance} km</strong>
                      </div>
                    </div>
                  )}
                  {selectedDateActivity.time && (
                    <div className="activity-stat">
                      <i className="fas fa-clock"></i>
                      <div>
                        <span>Tempo</span>
                        <strong>{selectedDateActivity.time} min</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {selectedDateActivity.description && (
                <div className="activity-detail-description">
                  <i className="fas fa-align-left"></i>
                  <p>{selectedDateActivity.description}</p>
                </div>
              )}
            </div>
            
            <div className="calendar-modal-footer">
              <button className="calendar-btn-remove" onClick={handleRemoveActivity}>
                <i className="fas fa-trash-alt"></i> Excluir
              </button>
              <button className="calendar-btn-edit" onClick={() => {
                setShowActivityModal(false)
                setActivityTitle(selectedDateActivity.title || '')
                setActivityType(selectedDateActivity.type || 'running')
                setActivityDistance(selectedDateActivity.distance || '')
                setActivityTime(selectedDateActivity.time || '')
                setActivityDescription(selectedDateActivity.description || '')
                setSelectedActivity(selectedDateActivity)
                setShowEditModal(true)
              }}>
                <i className="fas fa-edit"></i> Editar
              </button>
              <button className="calendar-btn-cancel" onClick={() => setShowActivityModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar/Editar Atividade */}
      {showEditModal && (
        <div className="calendar-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h3>
                {selectedActivity ? 'Editar Atividade' : 'Nova Atividade'}
              </h3>
              <button className="calendar-modal-close" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="calendar-modal-body">
              <p className="calendar-modal-date">
                <i className="fas fa-calendar-day"></i>
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              
              <div className="calendar-form-group">
                <label>Título da atividade *</label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Ex: Corrida matinal, Pedal noturno..."
                  className="calendar-input"
                />
              </div>
              
              <div className="calendar-form-group">
                <label>Tipo de atividade</label>
                <div className="calendar-type-buttons">
                  <button
                    className={`calendar-type-btn ${activityType === 'running' ? 'active' : ''}`}
                    onClick={() => setActivityType('running')}
                  >
                    <i className="fas fa-running"></i> Corrida
                  </button>
                  <button
                    className={`calendar-type-btn ${activityType === 'cycling' ? 'active' : ''}`}
                    onClick={() => setActivityType('cycling')}
                  >
                    <i className="fas fa-bicycle"></i> Bike
                  </button>
                  <button
                    className={`calendar-type-btn ${activityType === 'swimming' ? 'active' : ''}`}
                    onClick={() => setActivityType('swimming')}
                  >
                    <i className="fas fa-swimmer"></i> Natação
                  </button>
                </div>
              </div>
              
              <div className="calendar-form-row">
                <div className="calendar-form-group half">
                  <label>Distância (km)</label>
                  <input
                    type="number"
                    value={activityDistance}
                    onChange={(e) => setActivityDistance(e.target.value)}
                    placeholder="Ex: 5.0"
                    className="calendar-input"
                    step="0.1"
                  />
                </div>
                <div className="calendar-form-group half">
                  <label>Tempo (min)</label>
                  <input
                    type="text"
                    value={activityTime}
                    onChange={(e) => setActivityTime(e.target.value)}
                    placeholder="Ex: 30:00"
                    className="calendar-input"
                  />
                </div>
              </div>
              
              <div className="calendar-form-group">
                <label>Descrição (opcional)</label>
                <textarea
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder="Adicione detalhes sobre o treino..."
                  className="calendar-textarea"
                  rows="3"
                />
              </div>
            </div>
            
            <div className="calendar-modal-footer">
              {selectedActivity && (
                <button className="calendar-btn-remove" onClick={handleRemoveActivity}>
                  <i className="fas fa-trash-alt"></i> Excluir
                </button>
              )}
              <button className="calendar-btn-cancel" onClick={() => setShowEditModal(false)}>
                Cancelar
              </button>
              <button className="calendar-btn-save" onClick={selectedActivity ? handleUpdateActivity : handleSaveActivity}>
                <i className="fas fa-save"></i> {selectedActivity ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-container {
          background: var(--bg-card);
          border-radius: 20px;
          padding: 20px;
          border: 1px solid var(--border-color);
        }
        
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .calendar-nav {
          background: var(--chat-bg);
          border: 1px solid var(--border-color);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }
        
        .calendar-nav:hover {
          background: #ff1e2d;
          color: white;
          border-color: #ff1e2d;
        }
        
        .calendar-month {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: capitalize;
        }
        
        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          margin-bottom: 8px;
        }
        
        .calendar-weekday {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 8px 0;
        }
        
        .calendar-grid {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .calendar-week {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--chat-bg);
          border-radius: 12px;
          cursor: pointer;
          transition: 0.2s;
          position: relative;
          min-height: 60px;
        }
        
        .calendar-day:hover {
          background: rgba(255, 30, 45, 0.1);
          transform: scale(1.02);
        }
        
        .calendar-day.other-month {
          opacity: 0.4;
        }
        
        .calendar-day.selected {
          background: #ff1e2d;
          color: white;
        }
        
        .calendar-day.selected .calendar-day-number {
          color: white;
        }
        
        .calendar-day.today {
          border: 2px solid #ff1e2d;
        }
        
        .calendar-day.has-activity {
          background: rgba(255, 30, 45, 0.15);
        }
        
        .calendar-day-number {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .activity-indicator {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
        }
        
        .activity-indicator i {
          color: #ff1e2d;
        }
        
        .calendar-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-secondary);
        }
        
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }
        
        .legend-dot.activity {
          background: #ff1e2d;
          opacity: 0.5;
        }
        
        .legend-dot.today {
          background: transparent;
          border: 2px solid #ff1e2d;
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }
        
        .legend-dot.selected {
          background: #ff1e2d;
        }
        
        .calendar-instruction {
          text-align: center;
          margin-top: 12px;
          font-size: 11px;
          color: var(--text-light);
        }
        
        .calendar-instruction i {
          margin-right: 6px;
        }
        
        /* Activity Detail Card */
        .activity-detail-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--chat-bg);
          border-radius: 16px;
          margin-bottom: 16px;
        }
        
        .activity-detail-icon {
          width: 56px;
          height: 56px;
          background: #ff1e2d20;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .activity-detail-icon i {
          font-size: 28px;
          color: #ff1e2d;
        }
        
        .activity-detail-info h4 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 6px 0;
        }
        
        .activity-type-badge {
          background: #ff1e2d20;
          color: #ff1e2d;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .activity-detail-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .activity-stat {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--chat-bg);
          border-radius: 12px;
        }
        
        .activity-stat i {
          font-size: 20px;
          color: #ff1e2d;
        }
        
        .activity-stat span {
          font-size: 11px;
          color: var(--text-secondary);
          display: block;
        }
        
        .activity-stat strong {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }
        
        .activity-detail-description {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: var(--chat-bg);
          border-radius: 12px;
        }
        
        .activity-detail-description i {
          font-size: 16px;
          color: #ff1e2d;
        }
        
        .activity-detail-description p {
          flex: 1;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }
        
        /* Modal */
        .calendar-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        
        .calendar-modal {
          background: var(--bg-card);
          border-radius: 24px;
          width: 90%;
          max-width: 500px;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }
        
        .calendar-modal-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border-radius: 24px 24px 0 0;
          position: sticky;
          top: 0;
        }

        .calendar-modal-header h3 {
          margin: 0;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: white !important;  /* ← FORÇA A COR BRANCA */
        }
        
        .calendar-modal-close {
          background: rgba(255,255,255,0.2);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          color: white;
          cursor: pointer;
        }
        
        .calendar-modal-body {
          padding: 24px;
        }
        
        .calendar-modal-date {
          text-align: center;
          padding: 12px;
          background: var(--chat-bg);
          border-radius: 12px;
          margin-bottom: 20px;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: capitalize;
        }
        
        .calendar-modal-date i {
          margin-right: 8px;
          color: #ff1e2d;
        }
        
        .calendar-form-group {
          margin-bottom: 16px;
        }
        
        .calendar-form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 13px;
          color: var(--text-primary);
        }
        
        .calendar-form-row {
          display: flex;
          gap: 12px;
        }
        
        .calendar-form-group.half {
          flex: 1;
        }
        
        .calendar-input {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 14px;
        }
        
        .calendar-input:focus {
          outline: none;
          border-color: #ff1e2d;
        }
        
        .calendar-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 14px;
          resize: vertical;
          font-family: inherit;
        }
        
        .calendar-textarea:focus {
          outline: none;
          border-color: #ff1e2d;
        }
        
        .calendar-type-buttons {
          display: flex;
          gap: 10px;
        }
        
        .calendar-type-btn {
          flex: 1;
          padding: 10px;
          border: 1px solid var(--border-color);
          background: var(--chat-bg);
          border-radius: 30px;
          cursor: pointer;
          transition: 0.2s;
          color: var(--text-secondary);
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        
        .calendar-type-btn.active {
          background: #ff1e2d;
          color: white;
          border-color: #ff1e2d;
        }
        
        .calendar-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 12px;
          position: sticky;
          bottom: 0;
          background: var(--bg-card);
        }
        
        /* Botão Cancelar - Funciona em ambos os temas */
        .calendar-btn-cancel {
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

        .calendar-btn-cancel:hover {
          background: var(--border-color);
          transform: translateY(-1px);
        }

        /* Modo claro específico para cancelar */
        [data-theme="light"] .calendar-btn-cancel {
          background: #f0f2f8;
          color: #1a1a1a;
          border-color: #e2e8f0;
        }

        [data-theme="light"] .calendar-btn-cancel:hover {
          background: #e2e8f0;
        }

        /* Modo escuro específico para cancelar */
        [data-theme="dark"] .calendar-btn-cancel {
          background: #2a2a2a;
          color: #ffffff;
          border-color: #444444;
        }

        [data-theme="dark"] .calendar-btn-cancel:hover {
          background: #3a3a3a;
          border-color: #ff1e2d;
        }
        
        .calendar-btn-save {
          flex: 1;
          background: linear-gradient(135deg, #ff1e2d, #e5182a);
          border: none;
          padding: 12px;
          border-radius: 40px;
          font-weight: 600;
          color: white;
          cursor: pointer;
        }
        
        .calendar-btn-edit {
          flex: 1;
          background: #3b82f6;
          border: none;
          padding: 12px;
          border-radius: 40px;
          font-weight: 600;
          color: white;
          cursor: pointer;
        }
        
        .calendar-btn-remove {
          background: rgba(255, 30, 45, 0.15);
          border: 1px solid #ff1e2d;
          padding: 12px;
          border-radius: 40px;
          font-weight: 600;
          color: #ff1e2d;
          cursor: pointer;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .calendar-day {
            min-height: 50px;
          }
          .calendar-day-number {
            font-size: 12px;
          }
          .calendar-weekday {
            font-size: 10px;
          }
          .activity-detail-stats {
            flex-direction: column;
          }
          .calendar-modal-footer {
            flex-wrap: wrap;
          }
          .calendar-modal-footer button {
            min-width: 100px;
          }
        }
      `}</style>
    </div>
  )
}

export default Calendar