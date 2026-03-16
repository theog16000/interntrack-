'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Briefcase, Building2,
  FileText, CalendarCheck
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',              label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/dashboard/applications', label: 'Candidatures', icon: Briefcase       },
  { href: '/dashboard/companies',    label: 'Entreprises',  icon: Building2       },
  { href: '/dashboard/documents',    label: 'Documents',    icon: FileText        },
  { href: '/dashboard/interviews',   label: 'Entretiens',   icon: CalendarCheck   },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-2 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-3 rounded-xl transition-colors min-w-0 flex-1 ${
                active ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}