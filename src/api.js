const BASE_URL = '/api'
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

// ─── HTTP core ───────────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

// ─── Auth — POST /users/register  POST /users/login  GET /users/me ───────────

export const auth = {
  register: ({ username, password, display_name }) =>
    request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, display_name }),
    }),

  login: (username, password) =>
    request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  me: () => request('/users/me'),
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

export const rooms = {
  list: () => request('/rooms'),
  create: (data) => request('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  get: (id) => request(`/rooms/${id}`),
  join: (id) => request(`/rooms/${id}/join`, { method: 'POST' }),
  leave: (id) => request(`/rooms/${id}/leave`, { method: 'POST' }),
  members: (id) => request(`/rooms/${id}/members`),
}

// ─── Messages — returns { messages, total, has_more } ────────────────────────

export const messages = {
  list: (roomId, params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/rooms/${roomId}/messages${qs ? '?' + qs : ''}`)
  },
  send: (roomId, content) =>
    request(`/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  delete: (roomId, msgId) =>
    request(`/rooms/${roomId}/messages/${msgId}`, { method: 'DELETE' }),
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = {
  list: () => request('/users'),
  get: (id) => request(`/users/${id}`),
  updateStatus: (status) =>
    request('/users/me/status', { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateMe: (data) =>
    request('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
}

// ─── WebSocket — ws://host/ws/rooms/{id}?token=<jwt> ─────────────────────────

export function createWebSocket(roomId, handlers = {}) {
  const token = localStorage.getItem('token')
  const ws = new WebSocket(`${WS_BASE}/ws/rooms/${roomId}?token=${token}`)

  ws.onopen = () => handlers.onOpen?.()
  ws.onclose = (e) => handlers.onClose?.(e)
  ws.onerror = (e) => handlers.onError?.(e)
  ws.onmessage = (e) => {
    try { handlers.onMessage?.(JSON.parse(e.data)) }
    catch { handlers.onRaw?.(e.data) }
  }

  return {
    // Backend expects: { type: "message", content: "..." }
    sendMessage: (content) => ws.send(JSON.stringify({ type: 'message', content })),
    // Backend expects: { type: "typing", is_typing: true/false }
    sendTyping: (is_typing) => ws.send(JSON.stringify({ type: 'typing', is_typing })),
    close: () => ws.close(),
    ws,
  }
}