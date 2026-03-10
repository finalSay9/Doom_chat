import React, { useState, useEffect, useRef } from 'react'
import { Hash, MessageCircle, Plus, Settings, Search, Zap, X, Check, LogOut } from 'lucide-react'
import Avatar from './Avatar'
import { useStore } from '../store'
import { formatDate, truncate } from '../util'
import { users as usersApi, rooms as roomsApi } from '../api'

// ─── Single room row ──────────────────────────────────────────────────────────

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
        padding: '7px 10px',
        borderRadius: 10,
        background: active ? 'var(--bg-active)' : 'transparent',
        border: active ? '1px solid var(--border-mid)' : '1px solid transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.12s ease',
        textAlign: 'left',
        marginBottom: 2,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {isChannel ? (
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: active ? 'var(--accent-light)' : 'var(--bg-elevated)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${active ? 'var(--accent-glow)' : 'var(--border)'}`,
        }}>
          <Hash size={14} color={active ? 'var(--accent)' : 'var(--text-muted)'} />
        </div>
      ) : (
        <Avatar name={room.name} size={34} status={room.status} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: 13.5, fontWeight: active ? 600 : 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            color: active ? 'var(--text-primary)' : undefined,
          }}>
            {room.name}
          </span>
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 6 }}>
            {formatDate(room.lastAt)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
          <span style={{
            fontSize: 12, color: 'var(--text-muted)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150,
          }}>
            {truncate(room.lastMessage || 'No messages yet', 34)}
          </span>
          {room.unread > 0 && (
            <span style={{
              background: 'var(--accent)', color: '#fff',
              fontSize: 10, fontWeight: 700, borderRadius: 99,
              padding: '1px 6px', minWidth: 18, textAlign: 'center',
              flexShrink: 0, marginLeft: 6,
            }}>
              {room.unread > 99 ? '99+' : room.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── New DM modal — shows all users from DB ───────────────────────────────────

function NewDMModal({ onClose, onStart }) {
  const { user } = useStore()
  const [allUsers, setAllUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    usersApi.list()
      .then(data => setAllUsers(data.filter(u => u.id !== user.id)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = allUsers.filter(u =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = async (u) => {
    setStarting(u.id)
    try {
      // Create a DM room named after the other user, type=dm
      const room = await roomsApi.create({
        name: u.display_name,
        type: 'dm',
        is_private: true,
      })
      onStart(room, u)
    } catch (e) {
      console.error('Failed to create DM:', e)
    } finally {
      setStarting(null)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#00000070',
      animation: 'fadeIn 0.15s ease',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 380, maxHeight: '70vh',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-mid)',
          borderRadius: 18,
          boxShadow: '0 24px 60px #000000a0',
          display: 'flex', flexDirection: 'column',
          animation: 'fadeUp 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
              New Direct Message
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Select a person to chat with
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--bg-hover)', border: 'none', cursor: 'pointer',
            width: 28, height: 28, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
          }}>
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 16px', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 9, padding: '8px 12px',
          }}>
            <Search size={13} color="var(--text-muted)" />
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or username..."
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 13, flex: 1,
              }}
            />
          </div>
        </div>

        {/* User list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 12px' }}>
          {loading && (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Loading users...
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              {search ? 'No users match your search' : 'No other users found'}
            </div>
          )}
          {!loading && filtered.map(u => (
            <button
              key={u.id}
              onClick={() => handleSelect(u)}
              disabled={starting === u.id}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '9px 10px', borderRadius: 10, border: 'none',
                background: 'transparent', cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.12s',
                opacity: starting && starting !== u.id ? 0.5 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar name={u.display_name} size={38} status={u.status} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {u.display_name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  @{u.username}
                </div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
                background: u.status === 'online' ? 'var(--online-bg)' : 'var(--bg-hover)',
                color: u.status === 'online' ? 'var(--online)' : 'var(--text-muted)',
              }}>
                {u.status}
              </div>
              {starting === u.id && (
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: '2px solid var(--border)', borderTopColor: 'var(--accent)',
                  animation: 'spin 0.8s linear infinite', flexShrink: 0,
                }} />
              )}
            </button>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── New Channel modal ────────────────────────────────────────────────────────

function NewChannelModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) { setError('Channel name is required'); return }
    setLoading(true)
    try {
      const room = await roomsApi.create({
        name: name.trim().toLowerCase().replace(/\s+/g, '-'),
        description: desc.trim() || undefined,
        type: 'channel',
        is_private: isPrivate,
      })
      onCreate(room)
    } catch (e) {
      setError(e.message || 'Failed to create channel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#00000070', animation: 'fadeIn 0.15s ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 360, background: 'var(--bg-elevated)',
        border: '1px solid var(--border-mid)', borderRadius: 18,
        boxShadow: '0 24px 60px #000000a0',
        padding: '24px', animation: 'fadeUp 0.2s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>New Channel</div>
          <button onClick={onClose} style={{
            background: 'var(--bg-hover)', border: 'none', cursor: 'pointer',
            width: 28, height: 28, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
          }}><X size={14} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Channel name
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 9, padding: '9px 12px',
            }}>
              <Hash size={13} color="var(--text-muted)" />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. general"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: 13, flex: 1,
                  fontFamily: 'var(--font-body)',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Description (optional)
            </label>
            <input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="What's this channel about?"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 9, padding: '9px 12px',
                color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div
              onClick={() => setIsPrivate(p => !p)}
              style={{
                width: 36, height: 20, borderRadius: 99, cursor: 'pointer',
                background: isPrivate ? 'var(--accent)' : 'var(--bg-hover)',
                border: '1px solid var(--border)',
                position: 'relative', transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: 14, height: 14, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2,
                left: isPrivate ? 18 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px #00000040',
              }} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Private channel</span>
          </label>
        </div>

        {error && (
          <div style={{
            marginTop: 12, padding: '8px 12px', background: '#f43f5e18',
            border: '1px solid #f43f5e30', borderRadius: 8,
            fontSize: 12, color: '#f43f5e',
          }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>Cancel</button>
          <button
            onClick={handleCreate}
            disabled={loading}
            style={{
              flex: 2, padding: '10px', borderRadius: 10, border: 'none',
              background: loading ? 'var(--bg-hover)' : 'var(--accent)',
              color: loading ? 'var(--text-muted)' : '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
              fontFamily: 'var(--font-display)',
            }}
          >
            {loading ? 'Creating…' : 'Create Channel'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { user, rooms, activeRoomId, setActiveRoom, addRoom, logout } = useStore()
  const [search, setSearch] = useState('')
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [showNewDM, setShowNewDM] = useState(false)

  const channels = rooms.filter(r => r.type === 'channel')
  const dms = rooms.filter(r => r.type === 'dm')
  const filtered = (list) =>
    search ? list.filter(r => r.name.toLowerCase().includes(search.toLowerCase())) : list

  const handleDMStart = (room, otherUser) => {
    addRoom({
      id: room.id,
      name: room.name,
      type: 'dm',
      status: otherUser.status,
      lastMessage: null,
      lastAt: null,
      unread: 0,
    })
    setActiveRoom(room.id)
    setShowNewDM(false)
  }

  const handleChannelCreate = (room) => {
    addRoom({
      id: room.id,
      name: room.name,
      type: 'channel',
      memberCount: 1,
      lastMessage: null,
      lastAt: null,
      unread: 0,
    })
    setActiveRoom(room.id)
    setShowNewChannel(false)
  }

  return (
    <>
      <aside style={{
        width: 'var(--sidebar-w)',
        height: '100%',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '0 16px',
          height: 'var(--topbar-h)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, background: 'var(--accent)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={14} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>
              Pulse
            </span>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              padding: 6, borderRadius: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={15} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 10px 6px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 9, padding: '7px 11px',
          }}>
            <Search size={12} color="var(--text-muted)" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search rooms..."
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 13, flex: 1,
              }}
            />
          </div>
        </div>

        {/* Room lists */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>

          {/* Channels */}
          <SectionHeader label="Channels" onAdd={() => setShowNewChannel(true)} />
          {filtered(channels).length === 0 && !search && (
            <button
              onClick={() => setShowNewChannel(true)}
              style={{
                width: '100%', padding: '10px', borderRadius: 10,
                border: '1px dashed var(--border-mid)', background: 'none',
                color: 'var(--text-muted)', fontSize: 12.5, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'border-color 0.15s, color 0.15s', marginBottom: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Plus size={13} /> Create your first channel
            </button>
          )}
          {filtered(channels).map(r => (
            <RoomItem key={r.id} room={r} active={r.id === activeRoomId} onClick={() => setActiveRoom(r.id)} />
          ))}

          {/* Direct Messages */}
          <SectionHeader label="Direct Messages" onAdd={() => setShowNewDM(true)} style={{ marginTop: 10 }} />
          {filtered(dms).length === 0 && !search && (
            <button
              onClick={() => setShowNewDM(true)}
              style={{
                width: '100%', padding: '10px', borderRadius: 10,
                border: '1px dashed var(--border-mid)', background: 'none',
                color: 'var(--text-muted)', fontSize: 12.5, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'border-color 0.15s, color 0.15s', marginBottom: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Plus size={13} /> Message someone
            </button>
          )}
          {filtered(dms).map(r => (
            <RoomItem key={r.id} room={r} active={r.id === activeRoomId} onClick={() => setActiveRoom(r.id)} />
          ))}
        </div>

        {/* Profile bar */}
        <div style={{
          padding: '10px 12px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
          flexShrink: 0,
          background: 'var(--bg-surface)',
        }}>
          <Avatar name={user?.displayName || '?'} size={34} status="online" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.displayName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{user?.username}</div>
          </div>
        </div>
      </aside>

      {showNewDM && (
        <NewDMModal
          onClose={() => setShowNewDM(false)}
          onStart={handleDMStart}
        />
      )}
      {showNewChannel && (
        <NewChannelModal
          onClose={() => setShowNewChannel(false)}
          onCreate={handleChannelCreate}
        />
      )}
    </>
  )
}

function SectionHeader({ label, onAdd, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 6px 5px', ...style,
    }}>
      <span style={{
        fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.8px',
      }}>
        {label}
      </span>
      {onAdd && (
        <button
          onClick={onAdd}
          title={`New ${label}`}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', padding: '2px 4px', borderRadius: 5,
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 11, transition: 'color 0.12s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Plus size={13} />
        </button>
      )}
    </div>
  )
}