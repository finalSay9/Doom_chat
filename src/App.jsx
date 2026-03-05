import React, { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/Chatarea'
import Login from './components/Login'
import { useStore } from './store'

export default function App() {
  const { isAuthenticated, setUser, setWsConnected } = useStore()

  // Demo: simulate WS connection
  useEffect(() => {
    if (!isAuthenticated) return
    const t = setTimeout(() => setWsConnected(true), 1200)
    return () => clearTimeout(t)
  }, [isAuthenticated])

  const handleLogin = (user) => {
    setUser({ ...user, id: 'me', status: 'online' })
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex',
      overflow: 'hidden',
      background: 'var(--bg-base)',
    }}>
      <Sidebar />
      <ChatArea />
    </div>
  )
}