import { create } from 'zustand'

// ─── Mock data for demo ───────────────────────────────────────────────────────

const MOCK_USER = {
  id: 'me',
  username: 'alex_dev',
  displayName: 'Alex Chen',
  avatar: null,
  status: 'online',
}

const MOCK_ROOMS = [
  { id: '1', name: 'general', type: 'channel', unread: 3, lastMessage: 'Hey everyone! 👋', lastAt: new Date(Date.now() - 60000 * 2) },
  { id: '2', name: 'engineering', type: 'channel', unread: 0, lastMessage: 'PR merged successfully', lastAt: new Date(Date.now() - 60000 * 15) },
  { id: '3', name: 'design-team', type: 'channel', unread: 12, lastMessage: 'Check out the new mockups', lastAt: new Date(Date.now() - 60000 * 45) },
  { id: '4', name: 'random', type: 'channel', unread: 0, lastMessage: 'Anyone up for lunch?', lastAt: new Date(Date.now() - 60000 * 120) },
  { id: 'dm1', name: 'Jordan Mills', type: 'dm', unread: 1, avatar: null, status: 'online', lastMessage: 'Sounds good, let\'s sync later', lastAt: new Date(Date.now() - 60000 * 5) },
  { id: 'dm2', name: 'Sam Rivera', type: 'dm', unread: 0, avatar: null, status: 'away', lastMessage: 'Thanks for the help!', lastAt: new Date(Date.now() - 60000 * 60) },
  { id: 'dm3', name: 'Taylor Brooks', type: 'dm', unread: 0, avatar: null, status: 'offline', lastMessage: 'See you tomorrow', lastAt: new Date(Date.now() - 60000 * 300) },
]

const MOCK_MESSAGES = {
  '1': [
    { id: 'm1', senderId: 'u2', senderName: 'Jordan Mills', content: 'Hey everyone! 👋 How\'s the sprint going?', timestamp: new Date(Date.now() - 60000 * 30), status: 'read' },
    { id: 'm2', senderId: 'u3', senderName: 'Sam Rivera', content: 'Going well! Just finished the auth module.', timestamp: new Date(Date.now() - 60000 * 25), status: 'read' },
    { id: 'm3', senderId: 'me', senderName: 'Alex Chen', content: 'Nice work Sam! I\'ll start on the messaging layer today.', timestamp: new Date(Date.now() - 60000 * 20), status: 'read' },
    { id: 'm4', senderId: 'u2', senderName: 'Jordan Mills', content: 'Perfect. Don\'t forget we have standup at 10am.', timestamp: new Date(Date.now() - 60000 * 15), status: 'read' },
    { id: 'm5', senderId: 'u4', senderName: 'Taylor Brooks', content: 'I\'ll be 5 min late, in another call 🙏', timestamp: new Date(Date.now() - 60000 * 10), status: 'read' },
    { id: 'm6', senderId: 'me', senderName: 'Alex Chen', content: 'No worries! We\'ll start without you and catch you up.', timestamp: new Date(Date.now() - 60000 * 8), status: 'read' },
    { id: 'm7', senderId: 'u3', senderName: 'Sam Rivera', content: 'Also — the new deploy pipeline is live 🚀 should cut build times in half', timestamp: new Date(Date.now() - 60000 * 3), status: 'read' },
    { id: 'm8', senderId: 'u2', senderName: 'Jordan Mills', content: 'That\'s amazing! Been waiting for this. 🎉', timestamp: new Date(Date.now() - 60000 * 2), status: 'read' },
    { id: 'm9', senderId: 'me', senderName: 'Alex Chen', content: 'Hey everyone! 👋', timestamp: new Date(Date.now() - 60000 * 0.5), status: 'delivered' },
  ],
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useStore = create((set, get) => ({
  // Auth
  user: MOCK_USER,
  token: localStorage.getItem('token'),
  isAuthenticated: true, // demo mode

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    localStorage.setItem('token', token)
    set({ token })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  // Rooms
  rooms: MOCK_ROOMS,
  activeRoomId: '1',
  setRooms: (rooms) => set({ rooms }),
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

  // Messages
  messages: MOCK_MESSAGES,
  typingUsers: {},
  setMessages: (roomId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [roomId]: msgs } })),
  appendMessage: (roomId, msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: [...(s.messages[roomId] || []), msg],
      },
    })),
  setTyping: (roomId, userId, isTyping) =>
    set((s) => ({
      typingUsers: {
        ...s.typingUsers,
        [roomId]: { ...(s.typingUsers[roomId] || {}), [userId]: isTyping },
      },
    })),

  // UI
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  theme: 'dark',

  // Connection
  wsConnected: false,
  setWsConnected: (v) => set({ wsConnected: v }),
}))