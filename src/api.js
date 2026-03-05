const BASE_URL = '/api'
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

// ─── HTTP helpers ────────────────────────────────────────────────────────────

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
  return res.json()
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const auth = {
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (data) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
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

// ─── Messages ────────────────────────────────────────────────────────────────

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

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = {
  list: () => request('/users'),
  get: (id) => request(`/users/${id}`),
  updateStatus: (status) =>
    request('/users/me/status', { method: 'PATCH', body: JSON.stringify({ status }) }),
}

// ─── WebSocket ───────────────────────────────────────────────────────────────

export function createWebSocket(roomId, handlers = {}) {
  const token = localStorage.getItem('token')
  const ws = new WebSocket(`${WS_URL}/ws/rooms/${roomId}?token=${token}`)

  ws.onopen = () => handlers.onOpen?.()
  ws.onclose = (e) => handlers.onClose?.(e)
  ws.onerror = (e) => handlers.onError?.(e)
  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data)
      handlers.onMessage?.(data)
    } catch {
      handlers.onRaw?.(e.data)
    }
  }

  return {
    send: (data) => ws.send(JSON.stringify(data)),
    sendRaw: (data) => ws.send(data),
    close: () => ws.close(),
    ws,
  }
}