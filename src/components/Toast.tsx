'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type ToastData = {
  id: string
  message: string
  type: ToastType
}

const TOAST_CONFIG = {
  success: { icon: CheckCircle,    bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-800', icon_color: 'text-green-500' },
  error:   { icon: XCircle,        bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-800',   icon_color: 'text-red-500'   },
  warning: { icon: AlertTriangle,  bg: 'bg-yellow-50', border: 'border-yellow-200',text: 'text-yellow-800',icon_color: 'text-yellow-500' },
  info:    { icon: Info,           bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-800',  icon_color: 'text-blue-500'  },
}

type ToastItemProps = {
  toast: ToastData
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [visible, setVisible] = useState(false)
  const config = TOAST_CONFIG[toast.type]
  const Icon = config.icon

  useEffect(() => {
    // Apparition
    const showTimer = setTimeout(() => setVisible(true), 10)
    // Disparition auto après 3.5s
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, 3500)
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer) }
  }, [toast.id, onRemove])

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm text-sm font-medium transition-all duration-300 ${config.bg} ${config.border} ${config.text} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <Icon size={16} className={`flex-shrink-0 ${config.icon_color}`} />
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }}
        className="text-current opacity-40 hover:opacity-70 transition-opacity ml-1"
      >
        <X size={14} />
      </button>
    </div>
  )
}

type ToastContainerProps = {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}