'use client'

import { useEffect, useState } from 'react'
import { Application, Interview } from '@/lib/types'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { CalendarCheck, Send, ClipboardList, Trophy, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from '@/app/(auth)/actions'
import Loader from '@/components/Loader'
const STATUS_CONFIG = {
  to_apply:  { label: 'À postuler', color: '#6366f1' },
  sent:      { label: 'Envoyé',     color: '#3b82f6' },
  interview: { label: 'Entretien',  color: '#f97316' },
  offer:     { label: 'Offre',      color: '#22c55e' },
  rejected:  { label: 'Refus',      color: '#ef4444' },
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [interviews, setInterviews]     = useState<Interview[]>([])
  const [loading, setLoading]           = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const [appsRes, interviewsRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/interviews'),
      ])
      const apps = await appsRes.json()
      const ints = await interviewsRes.json()
      setApplications(Array.isArray(apps) ? apps : [])
      setInterviews(Array.isArray(ints) ? ints : [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const chartData = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
    name: config.label,
    value: applications.filter(a => a.status === key).length,
    color: config.color,
  })).filter(d => d.value > 0)

  const upcomingInterviews = interviews
    .filter(i => i.status === 'scheduled' && i.interview_date && new Date(i.interview_date) >= new Date())
    .sort((a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime())
    .slice(0, 4)

  const stats = [
    { label: 'Total',      value: applications.length,                                    icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Envoyées',   value: applications.filter(a => a.status === 'sent').length,   icon: Send,          color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Entretiens', value: applications.filter(a => a.status === 'interview').length, icon: CalendarCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Offres',     value: applications.filter(a => a.status === 'offer').length,  icon: Trophy,        color: 'text-green-600',  bg: 'bg-green-50'  },
  ]

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const interviewTypeLabel: Record<string, string> = {
    phone: 'Téléphone', video: 'Visio', onsite: 'Présentiel', technical: 'Technique', hr: 'RH',
  }

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  if (loading) return <Loader />

  return (
    <div className="p-4 md:p-8">

      {/* Header mobile */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-400 text-xs md:text-sm mt-0.5">Vue d'ensemble de tes candidatures</p>
        </div>
        {/* Actions mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/dashboard/settings" className="p-2 rounded-xl bg-gray-100 text-gray-500">
            <Settings size={18} />
          </Link>
          <button onClick={handleSignOut} className="p-2 rounded-xl bg-gray-100 text-gray-500">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{stat.label}</span>
                <div className={`${stat.bg} p-1.5 rounded-lg`}>
                  <Icon size={14} className={stat.color} />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Graphique + Entretiens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

        {/* Graphique */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Répartition par statut</h2>
          {applications.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-400 text-sm">Aucune candidature pour l'instant</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, '']} contentStyle={{ border: '1px solid #f3f4f6', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {chartData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs text-gray-500">{entry.name}</span>
                    <span className="text-xs font-medium text-gray-900 ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Prochains entretiens */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Prochains entretiens</h2>
          {upcomingInterviews.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-400 text-sm">Aucun entretien planifié</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{interview.applications?.company_name ?? '—'}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {interview.applications?.job_title ?? '—'}
                      {interview.type && ` · ${interviewTypeLabel[interview.type] ?? interview.type}`}
                    </p>
                  </div>
                  <p className="text-xs font-medium text-indigo-600 flex-shrink-0 ml-3">{formatDate(interview.interview_date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}