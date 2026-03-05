import React, { useState } from 'react'
import { Hash, MessageCircle, Plus, Settings, Search, ChevronDown, Zap } from 'lucide-react'
import Avatar from './Avatar'
import { useStore } from '../store'
import { formatDate, truncate } from '../util'

function RoomItem({ room, active, onClick }) {
  const isChannel = room.type === 'channel'
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        background: active ? 'var(--bg-active)' : 'transparent',
        border: active ? '1px solid var(--border-mid)' : '1px solid transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textAlign: 'left',
        marginBottom: 2,
      }}
      onMouseEnter={e => !active && (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
    >
      {isChannel ? (
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: active ? 'var(--accent-light)' : 'var(--bg-elevated)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Hash size={14} color={active ? 'var(--accent)' : 'var(--text-muted)'} />
        </div>
      ) : (
        <Avatar name={room.name} size={32} status={room.status} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: 13.5,
            fontWeight: active ? 600 : 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            color: active ? 'var(--text-primary)' : undefined,
          }}>
            {room.name}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 6 }}>
            {formatDate(room.lastAt)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
          <span style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: 160,
          }}>
            {truncate(room.lastMessage || '', 36)}
          </span>
          {room.unread > 0 && (
            <span style={{
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 99,
              padding: '1px 6px',
              minWidth: 18,
              textAlign: 'center',
              flexShrink: 0,
              marginLeft: 6,
            }}>
              {room.unread > 99 ? '99+' : room.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export default function Sidebar() {
  const { user, rooms, activeRoomId, setActiveRoom } = useStore()
  const [search, setSearch] = useState('')
  const [showNewRoom, setShowNewRoom] = useState(false)

  const channels = rooms.filter(r => r.type === 'channel')
  const dms = rooms.filter(r => r.type === 'dm')

  const filtered = (list) =>
    search ? list.filter(r => r.name.toLowerCase().includes(search.toLowerCase())) : list

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      height: '100%',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Workspace header */}
      <div style={{
        padding: '0 16px',
        height: 'var(--topbar-h)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={14} color="#fff" fill="#fff" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: '-0.3px',
          }}>
            Pulse
          </span>
        </div>
        <button style={{
          background: 'none', border: 'none',
          color: 'var(--text-muted)',
          padding: 4, borderRadius: 6,
          display: 'flex', alignItems: 'center',
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 12px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '7px 12px',
        }}>
          <Search size={13} color="var(--text-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 13,
              flex: 1,
            }}
          />
        </div>
      </div>

      {/* Room lists */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {/* Channels */}
        <SectionHeader label="Channels" onAdd={() => setShowNewRoom(true)} />
        {filtered(channels).map(r => (
          <RoomItem key={r.id} room={r} active={r.id === activeRoomId} onClick={() => setActiveRoom(r.id)} />
        ))}

        {/* DMs */}
        <SectionHeader label="Direct Messages" style={{ marginTop: 12 }} />
        {filtered(dms).map(r => (
          <RoomItem key={r.id} room={r} active={r.id === activeRoomId} onClick={() => setActiveRoom(r.id)} />
        ))}
      </div>

      {/* User profile bar */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <Avatar name={user.displayName} size={34} status={user.status} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {user.displayName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--online)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--online)', display: 'inline-block' }} />
            Online
          </div>
        </div>
        <button style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          padding: 4, borderRadius: 6,
        }}>
          <MessageCircle size={15} />
        </button>
      </div>
    </aside>
  )
}

function SectionHeader({ label, onAdd, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 4px 5px',
      ...style,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {label}
      </span>
      {onAdd && (
        <button
          onClick={onAdd}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', padding: 2, borderRadius: 4,
            display: 'flex', alignItems: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  )
}