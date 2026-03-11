'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/(auth)/actions'
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  FolderOpen,
  CalendarCheck,
  Settings,
  LogOut
} from 'lucide-react'

const navigation = [
  { href: '/dashboard',                 label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/dashboard/applications',    label: 'Mes candidatures',  icon: ClipboardList   },
  { href: '/dashboard/companies',       label: 'Entreprises',       icon: Building2       },
  { href: '/dashboard/documents',       label: 'Mes documents',     icon: FolderOpen      },
  { href: '/dashboard/interviews',      label: 'Entretiens',        icon: CalendarCheck   },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">InternTrack</h1>
        <p className="text-xs text-gray-400">Suivi de candidatures</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map(item => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bas de sidebar */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            pathname === '/dashboard/settings'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          <Settings size={18} />
          <span>Paramètres</span>
        </Link>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}