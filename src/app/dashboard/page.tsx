'use client'

import { useEffect, useState } from 'react'
import { Application, Interview } from '@/lib/types'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { CalendarCheck, Send, ClipboardList, Trophy } from 'lucide-react'

const STATUS_CONFIG = {
  to_apply:  { label: 'À postuler', color: '#6366f1' },
  sent:      { label: 'Envoyé',     color: '#3b82f6' },
  interview: { label: 'Entretien',  color: '#f97316' },
  offer:     { label: 'Offre',      color: '#22c55e' },
  rejected:  { label: 'Refus',      color: '#ef4444' },
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)

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

  // Données pour le graphique
  const chartData = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
    name: config.label,
    value: applications.filter(a => a.status === key).length,
    color: config.color,
  })).filter(d => d.value > 0)

  // Prochains entretiens
  const upcomingInterviews = interviews
    .filter(i => i.status === 'scheduled' && new Date(i.interview_date) >= new Date())
    .sort((a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime())
    .slice(0, 4)

  const stats = [
    {
      label: 'Total candidatures',
      value: applications.length,
      icon: ClipboardList,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Envoyées',
      value: applications.filter(a => a.status === 'sent').length,
      icon: Send,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Entretiens',
      value: applications.filter(a => a.status === 'interview').length,
      icon: CalendarCheck,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Offres reçues',
      value: applications.filter(a => a.status === 'offer').length,
      icon: Trophy,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ]

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const interviewTypeLabel: Record<string, string> = {
    phone: 'Téléphone',
    video: 'Visio',
    onsite: 'Présentiel',
    technical: 'Technique',
    hr: 'RH',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-400 text-sm mt-1">Vue d'ensemble de tes candidatures</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{stat.label}</span>
                <div className={`${stat.bg} p-2 rounded-lg`}>
                  <Icon size={16} className={stat.color} />
                </div>
              </div>
              <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Graphique + Entretiens */}
      <div className="grid grid-cols-2 gap-6">

        {/* Graphique */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-sm font-medium text-gray-900 mb-6">Répartition par statut</h2>

          {applications.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-gray-400 text-sm">Aucune candidature pour l'instant</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, '']}
                    contentStyle={{ border: '1px solid #f3f4f6', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Légende */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {chartData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs text-gray-500">{entry.name}</span>
                    <span className="text-xs font-medium text-gray-900 ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Prochains entretiens */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-sm font-medium text-gray-900 mb-6">Prochains entretiens</h2>

          {upcomingInterviews.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-gray-400 text-sm">Aucun entretien planifié</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {interview.applications?.company_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {interview.applications?.job_title} · {interviewTypeLabel[interview.type]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-indigo-600">
                      {formatDate(interview.interview_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}