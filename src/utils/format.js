// Formatea número al estilo argentino: 178056 → $178.056,00
export function formatARS(num) {
  if (num == null) return ''
  return '$' + Number(num).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
