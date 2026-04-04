'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, X, ExternalLink } from 'lucide-react'
import { Notification } from '@/lib/types'
import { useRouter } from 'next/navigation'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    fetchNotifications()
    // Refresh toutes les 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchNotifications() {
    const res  = await fetch('/api/notifications')
    const data = await res.json()
    setNotifications(Array.isArray(data) ? data : [])
  }

  async function markRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'DELETE' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  function handleNotifClick(notif: Notification) {
    markRead(notif.id)
    if (notif.link) router.push(notif.link)
    setOpen(false)
  }

  const formatDate = (s: string) => {
    const d = new Date(s)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60)
    if (diff < 60) return `Il y a ${diff} min`
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Bell size={17} />
        <span>Notifications</span>
        {unread > 0 && (
          <span className="ml-auto bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full ml-2 bottom-0 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
                >
                  Tout lire
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell size={24} className="text-gray-200 dark:text-gray-700 mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Aucune notification</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 ${
                    !notif.read ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${!notif.read ? 'bg-indigo-600' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{notif.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">{formatDate(notif.created_at)}</p>
                  </div>
                  {notif.link && <ExternalLink size={12} className="text-gray-300 dark:text-gray-600 flex-shrink-0 mt-1" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}