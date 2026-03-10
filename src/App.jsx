import React, { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/Chatarea'
import Login from './components/Login'
import { useStore } from './store'

export default function App() {
  const { isAuthenticated, token, initUser, setToken, fetchRooms } = useStore()
  const [booting, setBooting] = useState(true)

  // On first load — if a token exists in localStorage, validate it with /users/me
  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (stored) {
      setToken(stored)
      initUser().finally(() => setBooting(false))
    } else {
      setBooting(false)
    }
  }, [])

  // Once authenticated, load the room list
  useEffect(() => {
    if (isAuthenticated) fetchRooms()
  }, [isAuthenticated])

  // Called by Login after it receives the JWT
  const handleLogin = (accessToken) => {
    setToken(accessToken)
    initUser()
  }

  if (booting) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: 'var(--bg-base)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden' }}>
      <Sidebar />
      <ChatArea />
    </div>
  )
}