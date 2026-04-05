import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Using regex instead of toLocaleString('en-IN') — that locale is not available
// in Vercel's minimal Node.js ICU build and produces incorrect output on Linux.
export function formatCurrency(amount: number, symbol = '₹') {
  const fixed = Math.abs(amount).toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${amount < 0 ? '-' : ''}${symbol}${withCommas}.${decPart}`
}

export function formatDate(date: Date | string | null, fmt = 'dd/MM/yyyy') {
  if (!date) return '-'
  return format(new Date(date), fmt)
}

export function isExpiringSoon(date: Date | string | null, days = 30): boolean {
  if (!date) return false
  const expiry = new Date(date)
  const today = new Date()
  const diff = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= days
}

export function isExpired(date: Date | string | null): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

export function getExpiryStatus(date: Date | string | null): 'expired' | 'expiring' | 'valid' | 'none' {
  if (!date) return 'none'
  if (isExpired(date)) return 'expired'
  if (isExpiringSoon(date)) return 'expiring'
  return 'valid'
}
