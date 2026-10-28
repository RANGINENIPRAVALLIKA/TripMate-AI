/**
 * India-first currency formatting utility for TripMate AI.
 * Uses the Indian numbering system (Lakhs and Crores) with the ₹ symbol.
 */
export const formatINR = (amount, options = {}) => {
  const num = Number(amount || 0)
  if (isNaN(num)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: options.decimals !== undefined ? options.decimals : 0,
    ...options
  }).format(num)
}

export const formatINRNumber = (amount) => {
  const num = Number(amount || 0)
  if (isNaN(num)) return '0'
  return num.toLocaleString('en-IN')
}

export const formatINRCompact = (amount) => {
  const num = Number(amount || 0)
  if (isNaN(num)) return '₹0'
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`
  return `₹${num.toLocaleString('en-IN')}`
}
