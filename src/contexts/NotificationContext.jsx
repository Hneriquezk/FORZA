import React, { createContext, useState, useContext, useCallback } from 'react'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    unread: [],
    read: []
  })

  const addNotification = useCallback((title, message, type = 'info', icon = 'fa-bell', avatar = null) => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      time: 'Agora mesmo',
      read: false,
      type,
      icon,
      avatar
    }
    
    setNotifications(prev => ({
      ...prev,
      unread: [newNotification, ...prev.unread]
    }))
    
    // Usar alert simples em vez de toast
    console.log(`🔔 ${title}: ${message}`)
  }, [])

  const unreadCount = notifications.unread.length

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead: () => {},
      markAllAsRead: () => {},
      removeNotification: () => {},
      showToast: null
    }}>
      {children}
    </NotificationContext.Provider>
  )
}