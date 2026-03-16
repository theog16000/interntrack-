'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/app/(auth)/actions'
import {
  LayoutDashboard, Briefcase, Building2,
  FileText, CalendarCheck, Settings, LogOut
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',              label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/applications', label: 'Candidatures',    icon: Briefcase       },
  { href: '/dashboard/companies',    label: 'Entreprises',     icon: Building2       },
  { href: '/dashboard/documents',    label: 'Documents',       icon: FileText        },
  { href: '/dashboard/interviews',   label: 'Entretiens',      icon: CalendarCheck   },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <aside className="hidden md:flex w-56 h-screen flex-col border-r border-gray-100 bg-white px-3 py-5 fixed left-0 top-0">

      <div className="px-3 mb-8">
        <h1 className="text-base font-bold text-gray-900">InternTrack</h1>
        <p className="text-xs text-gray-400">Suivi de candidatures</p>
      </div>

      <nav className="flex-1 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-0.5 pt-4 border-t border-gray-100">
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === '/dashboard/settings'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Settings size={17} />
          Paramètres
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}