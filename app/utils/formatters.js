export function formatDate(dateString) {
  if (!dateString) return ''

  const [year, month, day] = dateString.split('-')
  const date = new Date(year, month - 1, day)

  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export function formatTime(timeString) {
  if (!timeString) return ''

  return timeString.slice(0, 5) + ' Uhr'
}

export function formatDateTime(dateString, timeString) {
  return `${formatDate(dateString)} - ${formatTime(timeString)}`
}