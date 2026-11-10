'use client'

type ToastType = 'success' | 'error' | 'info'

function showToast(message: string, type: ToastType = 'info') {
  const container = document.getElementById('toast-container') || (() => {
    const el = document.createElement('div')
    el.id = 'toast-container'
    el.className = 'fixed bottom-20 lg:bottom-6 right-4 z-[100] flex flex-col gap-2 pointer-events-none'
    document.body.appendChild(el)
    return el
  })()

  const toast = document.createElement('div')
  const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-vault-surface border border-vault-border' }
  toast.className = `${colors[type]} text-white text-sm px-4 py-3 rounded-xl shadow-lg pointer-events-auto animate-fade-in max-w-xs`
  toast.textContent = message
  container.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.3s'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

export const toast = {
  success: (msg: string) => showToast(msg, 'success'),
  error: (msg: string) => showToast(msg, 'error'),
  info: (msg: string) => showToast(msg, 'info'),
}

export default function ToastContainer() {
  return <div id="toast-container" className="fixed bottom-20 lg:bottom-6 right-4 z-[100] flex flex-col gap-2 pointer-events-none" />
}

