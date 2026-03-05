// Avatar initials & colors
const AVATAR_COLORS = [
  '#6c63ff', '#22d4a0', '#f59e0b', '#f43f5e',
  '#3b82f6', '#a855f7', '#ec4899', '#14b8a6',
]

export function getAvatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Time formatting
export function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return formatTime(d)
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function shouldGroupMessage(prev, curr) {
  if (!prev || prev.senderId !== curr.senderId) return false
  return new Date(curr.timestamp) - new Date(prev.timestamp) < 60000 * 5
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

export function truncate(str, n = 40) {
  return str.length > n ? str.slice(0, n) + '…' : str
}