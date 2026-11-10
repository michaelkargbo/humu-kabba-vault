import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'NLe') {
  return `${currency} ${amount.toLocaleString('en-SL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function generateOrderRef() {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `HKV-${ts}-${rand}`
}

export function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function buildWhatsAppLink(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function buildOrderWhatsAppMessage(order: {
  reference: string
  customerName: string
  items: { name: string; qty: number; price: number }[]
  total: number
  deliveryAddress: string
  paymentMethod: string
}) {
  const lines = [
    `🛍️ *New Order – Humu Kabba Variety Vault*`,
    ``,
    `📦 *Order Reference:* ${order.reference}`,
    `👤 *Customer:* ${order.customerName}`,
    `📍 *Delivery Address:* ${order.deliveryAddress}`,
    `💳 *Payment:* ${order.paymentMethod}`,
    ``,
    `*Items:*`,
    ...order.items.map(i => `  • ${i.name} × ${i.qty} — NLe ${(i.price * i.qty).toLocaleString()}`),
    ``,
    `💰 *Total: NLe ${order.total.toLocaleString()}*`,
  ]
  return lines.join('\n')
}

export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '23277416008'

