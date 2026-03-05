import React, { useState, useRef, useCallback } from 'react'
import { Send, Paperclip, Smile, Mic } from 'lucide-react'

const EMOJIS = ['😀','😂','😍','🤔','👍','❤️','🔥','🎉','😎','🙌','💯','⚡']

export default function ChatInput({ onSend, roomName, disabled }) {
  const [value, setValue] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef(null)

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    setShowEmoji(false)
    textareaRef.current?.focus()
  }, [value, onSend, disabled])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setValue(e.target.value)
    // Auto-resize
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
    }
  }

  const insertEmoji = (emoji) => {
    setValue(v => v + emoji)
    setShowEmoji(false)
    textareaRef.current?.focus()
  }

  const canSend = value.trim().length > 0

  return (
    <div style={{ padding: '0 16px 16px', position: 'relative' }}>
      {/* Emoji picker */}
      {showEmoji && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 16, right: 16,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 12,
          marginBottom: 8,
          display: 'flex', flexWrap: 'wrap', gap: 6,
          animation: 'fadeUp 0.15s ease',
          boxShadow: 'var(--shadow-md)',
          zIndex: 100,
        }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => insertEmoji(e)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 22, padding: '4px 6px', borderRadius: 6,
              transition: 'transform 0.1s, background 0.1s',
            }}
              onMouseEnter={el => { el.currentTarget.style.transform = 'scale(1.25)'; el.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={el => { el.currentTarget.style.transform = 'scale(1)'; el.currentTarget.style.background = 'none' }}
            >{e}</button>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        background: 'var(--bg-elevated)',
        border: `1px solid ${focused ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '8px 8px 8px 14px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
      }}>
        {/* Left actions */}
        <div style={{ display: 'flex', gap: 2, alignSelf: 'flex-end', paddingBottom: 4 }}>
          <IconButton onClick={() => {}} title="Attach file">
            <Paperclip size={17} />
          </IconButton>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={`Message ${roomName ? '#' + roomName : ''}`}
          rows={1}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            resize: 'none',
            color: 'var(--text-primary)',
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'var(--font-body)',
            paddingTop: 4,
            maxHeight: 140,
            overflowY: 'auto',
          }}
        />

        {/* Right actions */}
        <div style={{ display: 'flex', gap: 2, alignSelf: 'flex-end', paddingBottom: 2 }}>
          <IconButton onClick={() => setShowEmoji(s => !s)} active={showEmoji} title="Emoji">
            <Smile size={17} />
          </IconButton>

          {canSend ? (
            <button
              onClick={handleSend}
              style={{
                width: 34, height: 34,
                borderRadius: 10,
                background: 'var(--accent)',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s, transform 0.1s',
                boxShadow: '0 4px 12px var(--accent-glow)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <Send size={15} color="#fff" />
            </button>
          ) : (
            <IconButton title="Voice message">
              <Mic size={17} />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  )
}

function IconButton({ children, onClick, active, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 34, height: 34,
        borderRadius: 10,
        background: active ? 'var(--accent-light)' : 'none',
        border: 'none',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)' }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}}
    >
      {children}
    </button>
  )
}