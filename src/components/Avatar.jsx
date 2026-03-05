import React from 'react'
import { getInitials, getAvatarColor } from '../util'

export default function Avatar({ name = '', size = 36, status, style = {} }) {
  const bg = getAvatarColor(name)
  const initials = getInitials(name)
  const fontSize = size * 0.38

  return (
    <div style={{ position: 'relative', flexShrink: 0, ...style }}>
      <div style={{
        width: size, height: size,
        borderRadius: '50%',
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize, fontWeight: 700,
        color: '#fff',
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.5px',
        userSelect: 'none',
      }}>
        {initials}
      </div>
      {status && (
        <span style={{
          position: 'absolute',
          bottom: 1, right: 1,
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: '50%',
          background: status === 'online' ? 'var(--online)' : status === 'away' ? 'var(--away)' : '#444',
          border: '2px solid var(--bg-surface)',
        }} />
      )}
    </div>
  )
}