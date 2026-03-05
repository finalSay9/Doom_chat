import React, { useEffect, useRef, useCallback } from 'react'
import { Hash, Users, Bell, Pin, Search, Phone, Video, MoreVertical, Wifi, WifiOff } from 'lucide-react'
import MessageBubble, { TypingIndicator, DateDivider } from './MessageBubble'
import ChatInput from './Chatinput'
import { useStore } from '../store'
import { shouldGroupMessage, generateId } from '../util'

function formatDateLabel(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.setHours(0,0,0,0) - d.setHours(0,0,0,0)
  if (diff === 0) return 'Today'
  if (diff === 86400000) return 'Yesterday'
  return new Date(date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

function groupByDate(messages) {
  const groups = []
  let lastDate = null
  messages.forEach((msg, i) => {
    const dateKey = new Date(msg.timestamp).toDateString()
    if (dateKey !== lastDate) {
      groups.push({ type: 'date', label: formatDateLabel(msg.timestamp), key: dateKey })
      lastDate = dateKey
    }
    const prev = messages[i - 1]
    const grouped = prev && shouldGroupMessage(prev, msg)
    groups.push({ type: 'message', msg, grouped })
  })
  return groups
}

export default function ChatArea() {
  const { user, activeRoomId, rooms, messages, typingUsers, appendMessage, updateRoomLastMessage, wsConnected } = useStore()
  const bottomRef = useRef(null)
  const messagesEndRef = useRef(null)

  const activeRoom = rooms.find(r => r.id === activeRoomId)
  const roomMessages = messages[activeRoomId] || []
  const typing = typingUsers[activeRoomId] || {}
  const typingNames = Object.entries(typing).filter(([k, v]) => v && k !== user.id).map(([k]) => k)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [roomMessages.length, activeRoomId])

  const handleSend = useCallback((content) => {
    const msg = {
      id: generateId(),
      senderId: user.id,
      senderName: user.displayName,
      content,
      timestamp: new Date(),
      status: 'sending',
    }
    appendMessage(activeRoomId, msg)
    updateRoomLastMessage(activeRoomId, content)

    // TODO: replace with real API call
    // messages.send(activeRoomId, content).then(...)
  }, [activeRoomId, user, appendMessage, updateRoomLastMessage])

  if (!activeRoom) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontSize: 15,
      }}>
        Select a room to start chatting
      </div>
    )
  }

  const isChannel = activeRoom.type === 'channel'
  const grouped = groupByDate(roomMessages)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div style={{
        height: 'var(--topbar-h)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isChannel ? (
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Hash size={15} color="var(--accent)" />
            </div>
          ) : null}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.2px' }}>
              {isChannel ? activeRoom.name : activeRoom.name}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              {isChannel ? '8 members' : activeRoom.status === 'online' ? '● Online' : 'Last seen recently'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* WS indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 99,
            background: wsConnected ? 'var(--online-bg)' : '#f43f5e18',
            border: `1px solid ${wsConnected ? '#22d4a030' : '#f43f5e30'}`,
            fontSize: 11, color: wsConnected ? 'var(--online)' : 'var(--danger)',
            fontWeight: 600,
            marginRight: 8,
          }}>
            {wsConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
            {wsConnected ? 'Live' : 'Offline'}
          </div>
          <TopbarBtn title="Search"><Search size={16} /></TopbarBtn>
          <TopbarBtn title="Pinned"><Pin size={16} /></TopbarBtn>
          <TopbarBtn title="Members"><Users size={16} /></TopbarBtn>
          {!isChannel && <>
            <TopbarBtn title="Voice call"><Phone size={16} /></TopbarBtn>
            <TopbarBtn title="Video call"><Video size={16} /></TopbarBtn>
          </>}
          <TopbarBtn title="Notifications"><Bell size={16} /></TopbarBtn>
          <TopbarBtn title="More"><MoreVertical size={16} /></TopbarBtn>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 20px 8px',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Room intro */}
        <div style={{ marginBottom: 28, animation: 'fadeUp 0.3s ease' }}>
          <div style={{
            width: 52, height: 52,
            borderRadius: 14,
            background: 'var(--accent-light)',
            border: '1px solid var(--accent-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            {isChannel ? <Hash size={22} color="var(--accent)" /> : <span style={{ fontSize: 24 }}>👤</span>}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
            {isChannel ? `# ${activeRoom.name}` : activeRoom.name}
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 480 }}>
            {isChannel
              ? `This is the start of the #${activeRoom.name} channel. Send a message to get the conversation going.`
              : `This is the beginning of your direct message history with ${activeRoom.name}.`
            }
          </p>
        </div>

        {/* Message list */}
        {grouped.map((item, idx) =>
          item.type === 'date' ? (
            <DateDivider key={item.key} label={item.label} />
          ) : (
            <MessageBubble
              key={item.msg.id}
              msg={item.msg}
              isOwn={item.msg.senderId === user.id}
              grouped={item.grouped}
            />
          )
        )}

        {/* Typing indicator */}
        {typingNames.length > 0 && (
          <div style={{ paddingLeft: 42 }}>
            <TypingIndicator names={typingNames} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        roomName={isChannel ? activeRoom.name : null}
      />
    </div>
  )
}

function TopbarBtn({ children, title, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 34, height: 34,
        background: 'none', border: 'none',
        color: 'var(--text-muted)',
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {children}
    </button>
  )
}