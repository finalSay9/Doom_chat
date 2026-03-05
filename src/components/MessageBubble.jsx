import React, { useState } from 'react'
import { Check, CheckCheck, Trash2, MoreHorizontal } from 'lucide-react'
import Avatar from './Avatar'
import { formatTime } from '../util'

export default function MessageBubble({ msg, isOwn, grouped, style }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 8,
        marginBottom: grouped ? 3 : 14,
        animation: 'fadeUp 0.2s ease both',
        position: 'relative',
        paddingLeft: isOwn ? 60 : 0,
        paddingRight: isOwn ? 0 : 60,
        ...style,
      }}
    >
      {/* Avatar */}
      {!isOwn && (
        <div style={{ width: 34, flexShrink: 0, alignSelf: 'flex-end', marginBottom: 2 }}>
          {!grouped && <Avatar name={msg.senderName} size={34} />}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
        {/* Sender name */}
        {!grouped && !isOwn && (
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: 4,
            marginLeft: 2,
          }}>
            {msg.senderName}
          </span>
        )}

        <div style={{ position: 'relative' }}>
          {/* Bubble */}
          <div style={{
            background: isOwn ? 'var(--accent)' : 'var(--bg-elevated)',
            color: isOwn ? '#fff' : 'var(--text-primary)',
            padding: '9px 14px',
            borderRadius: isOwn
              ? `var(--radius-lg) var(--radius-lg) ${grouped ? 'var(--radius-lg)' : '6px'} var(--radius-lg)`
              : `var(--radius-lg) var(--radius-lg) var(--radius-lg) ${grouped ? 'var(--radius-lg)' : '6px'}`,
            fontSize: 14,
            lineHeight: 1.5,
            border: isOwn ? 'none' : '1px solid var(--border)',
            boxShadow: isOwn ? '0 4px 16px var(--accent-glow)' : 'var(--shadow-sm)',
            wordBreak: 'break-word',
            position: 'relative',
          }}>
            {msg.content}
          </div>

          {/* Hover actions */}
          {hovered && (
            <div style={{
              position: 'absolute',
              top: -32,
              [isOwn ? 'right' : 'left']: 0,
              display: 'flex',
              gap: 4,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '3px 6px',
              animation: 'fadeIn 0.1s ease',
              zIndex: 10,
            }}>
              {['👍', '❤️', '😂', '😮'].map(e => (
                <button key={e} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, padding: '2px 3px', borderRadius: 4,
                  transition: 'transform 0.1s',
                }}
                  onMouseEnter={el => el.currentTarget.style.transform = 'scale(1.3)'}
                  onMouseLeave={el => el.currentTarget.style.transform = 'scale(1)'}
                >
                  {e}
                </button>
              ))}
              <div style={{ width: 1, background: 'var(--border)', margin: '2px 2px' }} />
              <button style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '2px 4px',
                display: 'flex', alignItems: 'center',
              }}>
                <MoreHorizontal size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Timestamp + status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          marginTop: 4, marginLeft: 2, marginRight: 2,
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {formatTime(msg.timestamp)}
          </span>
          {isOwn && (
            msg.status === 'read'
              ? <CheckCheck size={12} color="var(--accent)" />
              : msg.status === 'delivered'
                ? <CheckCheck size={12} color="var(--text-muted)" />
                : <Check size={12} color="var(--text-muted)" />
          )}
        </div>
      </div>
    </div>
  )
}

export function TypingIndicator({ names }) {
  if (!names?.length) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '4px 0 8px',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: 'var(--text-muted)',
            display: 'inline-block',
            animation: `blink 1.2s ease ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {names.join(', ')} {names.length === 1 ? 'is' : 'are'} typing...
      </span>
    </div>
  )
}

export function DateDivider({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      margin: '16px 0 12px',
    }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{
        fontSize: 11, color: 'var(--text-muted)',
        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}