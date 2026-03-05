import React, { useState } from 'react'
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ username: '', password: '', displayName: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      // TODO: Replace with real API call
      // const res = await auth.login(form.username, form.password)
      // localStorage.setItem('token', res.access_token)
      await new Promise(r => setTimeout(r, 800)) // demo delay
      onLogin({ username: form.username, displayName: form.displayName || form.username })
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, #6c63ff18 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: 380,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px 36px',
        animation: 'fadeUp 0.4s ease',
        position: 'relative',
        boxShadow: '0 24px 60px #00000080, 0 0 80px #6c63ff10',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--accent)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px var(--accent-glow)',
          }}>
            <Zap size={20} color="#fff" fill="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>Pulse</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Real-time chat</div>
          </div>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginBottom: 6 }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 28 }}>
          {mode === 'login' ? 'Sign in to continue to Pulse' : 'Join the conversation'}
        </p>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <Field label="Display name" type="text" value={form.displayName} onChange={update('displayName')} placeholder="Your name" onKeyDown={handleKey} />
          )}
          <Field label="Username" type="text" value={form.username} onChange={update('username')} placeholder="username" onKeyDown={handleKey} />
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '0 12px',
              transition: 'border-color 0.2s',
            }}
              onFocus={() => {}} // handled by input
            >
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={update('password')}
                placeholder="••••••••"
                onKeyDown={handleKey}
                style={{
                  flex: 1,
                  background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: 14,
                  padding: '11px 0',
                  fontFamily: 'var(--font-body)',
                }}
              />
              <button onClick={() => setShowPw(s => !s)} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: 4, display: 'flex',
              }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: 14, padding: '10px 14px',
            background: '#f43f5e18', border: '1px solid #f43f5e30',
            borderRadius: 8, fontSize: 13, color: '#f43f5e',
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', marginTop: 24,
            padding: '13px',
            background: loading ? 'var(--bg-elevated)' : 'var(--accent)',
            border: 'none', borderRadius: 12,
            color: loading ? 'var(--text-muted)' : '#fff',
            fontSize: 14.5, fontWeight: 700,
            fontFamily: 'var(--font-display)',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.2s, transform 0.1s',
            boxShadow: loading ? 'none' : '0 4px 20px var(--accent-glow)',
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={e => !loading && (e.currentTarget.style.background = 'var(--accent)')}
        >
          {loading ? (
            <>
              <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--text-muted)', borderTopColor: 'var(--text-secondary)', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              Signing in...
            </>
          ) : (
            <>
              {mode === 'login' ? 'Sign in' : 'Create account'}
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Toggle mode */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(m => m === 'login' ? 'register' : 'login')} style={{
            background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, textDecoration: 'underline',
          }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, onKeyDown }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        style={{
          width: '100%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '11px 14px',
          color: 'var(--text-primary)',
          fontSize: 14, outline: 'none',
          fontFamily: 'var(--font-body)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxSizing: 'border-box',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}