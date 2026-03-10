import { create } from 'zustand'
import { auth, rooms as roomsApi, messages as messagesApi } from './api'

export const useStore = create((set, get) => ({

  // ─── Auth ──────────────────────────────────────────────────────────────────
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,

  setToken: (token) => {
    localStorage.setItem('token', token)
    set({ token })
  },

  // Called after login/register — fetches /users/me to populate user
  initUser: async () => {
    try {
      const user = await auth.me()
      // Backend returns snake_case — normalise to camelCase for UI
      set({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          status: user.status,
        },
        isAuthenticated: true,
      })
    } catch {
      get().logout()
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false, rooms: [], messages: {} })
  },

  // ─── Rooms ────────────────────────────────────────────────────────────────
  rooms: [],
  activeRoomId: null,
  roomsLoading: false,

  fetchRooms: async () => {
    set({ roomsLoading: true })
    try {
      const data = await roomsApi.list()
      // Backend returns snake_case — map to shape the UI expects
      const mapped = data.map(r => ({
        id: r.id,
        name: r.name,
        type: r.type,
        description: r.description,
        isPrivate: r.is_private,
        memberCount: r.member_count,
        lastMessage: r.last_message || null,
        lastAt: r.last_message_at ? new Date(r.last_message_at) : null,
        unread: 0,
      }))
      set({ rooms: mapped, roomsLoading: false })
      // Auto-select first room
      if (mapped.length && !get().activeRoomId) {
        set({ activeRoomId: mapped[0].id })
      }
    } catch {
      set({ roomsLoading: false })
    }
  },

  setActiveRoom: (id) => {
    set((s) => ({
      activeRoomId: id,
      rooms: s.rooms.map(r => r.id === id ? { ...r, unread: 0 } : r),
    }))
  },

  addRoom: (room) => set((s) => ({ rooms: [room, ...s.rooms] })),

  updateRoomLastMessage: (roomId, content) => {
    set((s) => ({
      rooms: s.rooms.map(r =>
        r.id === roomId ? { ...r, lastMessage: content, lastAt: new Date() } : r
      ),
    }))
  },

  incrementUnread: (roomId) => {
    set((s) => ({
      rooms: s.rooms.map(r =>
        r.id === roomId && r.id !== s.activeRoomId
          ? { ...r, unread: (r.unread || 0) + 1 }
          : r
      ),
    }))
  },

  // ─── Messages ─────────────────────────────────────────────────────────────
  messages: {},       // { [roomId]: MessagePublic[] }
  messagesLoading: {},

  fetchMessages: async (roomId) => {
    set((s) => ({ messagesLoading: { ...s.messagesLoading, [roomId]: true } }))
    try {
      const data = await messagesApi.list(roomId, { limit: 50 })
      // Backend returns snake_case fields
      const mapped = (data.messages || []).map(normalizeMessage)
      set((s) => ({
        messages: { ...s.messages, [roomId]: mapped },
        messagesLoading: { ...s.messagesLoading, [roomId]: false },
      }))
    } catch {
      set((s) => ({ messagesLoading: { ...s.messagesLoading, [roomId]: false } }))
    }
  },

  setMessages: (roomId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [roomId]: msgs } })),

  appendMessage: (roomId, msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: [...(s.messages[roomId] || []), msg],
      },
    })),

  // Replace an optimistic temp message (matched by tempId) with confirmed one
  confirmMessage: (roomId, tempId, confirmedMsg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: (s.messages[roomId] || []).map(m =>
          m.id === tempId ? confirmedMsg : m
        ),
      },
    })),

  // ─── Typing ───────────────────────────────────────────────────────────────
  typingUsers: {},  // { [roomId]: { [displayName]: true } }

  setTyping: (roomId, displayName, isTyping) =>
    set((s) => ({
      typingUsers: {
        ...s.typingUsers,
        [roomId]: { ...(s.typingUsers[roomId] || {}), [displayName]: isTyping },
      },
    })),

  // ─── WebSocket ────────────────────────────────────────────────────────────
  wsConnected: false,
  setWsConnected: (v) => set({ wsConnected: v }),

  // Handle every incoming WS event from the server
  handleWsEvent: (roomId, event) => {
    const { type, data } = event
    const { user, appendMessage, updateRoomLastMessage, incrementUnread, setTyping, activeRoomId } = get()

    if (type === 'message') {
      const msg = normalizeMessage(data)
      appendMessage(roomId, msg)
      updateRoomLastMessage(roomId, msg.content)
      if (roomId !== activeRoomId) incrementUnread(roomId)
    }

    else if (type === 'message_deleted') {
      set((s) => ({
        messages: {
          ...s.messages,
          [roomId]: (s.messages[roomId] || []).filter(m => m.id !== data.message_id),
        },
      }))
    }

    else if (type === 'typing') {
      setTyping(roomId, data.display_name, data.is_typing)
      // Auto-clear typing after 4s in case server doesn't send a stop event
      if (data.is_typing) {
        setTimeout(() => setTyping(roomId, data.display_name, false), 4000)
      }
    }

    else if (type === 'status_change') {
      // Update status in rooms list for DMs
      set((s) => ({
        rooms: s.rooms.map(r =>
          r.type === 'dm' && r.otherUserId === data.user_id
            ? { ...r, status: data.status }
            : r
        ),
      }))
    }
  },

  // ─── UI ───────────────────────────────────────────────────────────────────
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))

// ─── Helper: normalize snake_case backend message → camelCase UI shape ───────

function normalizeMessage(m) {
  return {
    id: m.id,
    roomId: m.room_id,
    senderId: m.sender_id,
    senderName: m.sender_name,
    content: m.content,
    status: m.status,
    edited: m.edited,
    timestamp: new Date(m.created_at),
  }
}