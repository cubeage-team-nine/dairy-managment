export function formatCurrency(amount, currency = 'INR') {
  if (amount == null) return ''
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount)
}
