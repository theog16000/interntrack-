'use client'

import { useEffect, useState } from 'react'
import { Interview, Application, INTERVIEW_TYPES } from '@/lib/types'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import frLocale from '@fullcalendar/core/locales/fr'
import {
  Plus, CalendarCheck, Clock, Briefcase,
  FileText, ChevronDown, X,
  Pencil, Trash2, CheckCircle, XCircle, Circle,
  List, Calendar
} from 'lucide-react'
import { ToastContainer } from '@/components/Toast'
import { useToast } from '@/lib/useToast'

const inputClass = "w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
const labelClass = "block text-xs font-medium text-gray-700 mb-1.5"

const STATUS_CONFIG = {
  scheduled: { label: 'Planifié', icon: Circle,      className: 'bg-blue-50 text-blue-600',   color: '#6366f1' },
  done:      { label: 'Effectué', icon: CheckCircle, className: 'bg-green-50 text-green-600', color: '#22c55e' },
  cancelled: { label: 'Annulé',   icon: XCircle,     className: 'bg-red-50 text-red-600',     color: '#ef4444' },
}

type InterviewFormProps = {
  onClose: () => void
  onSave: (interview: Interview) => void
  initial?: Interview | null
  applications: Application[]
  defaultDate?: string
}

function InterviewForm({ onClose, onSave, initial, applications, defaultDate }: InterviewFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const body = {
      application_id: formData.get('application_id'),
      interview_date: formData.get('interview_date'),
      type:           formData.get('type'),
      notes:          formData.get('notes'),
      status:         formData.get('status'),
    }
    const url    = initial ? `/api/interviews/${initial.id}` : '/api/interviews'
    const method = initial ? 'PATCH' : 'POST'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data   = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    onSave(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>

        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {initial ? "Modifier l'entretien" : 'Nouvel entretien'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {initial ? 'Modifie les informations' : 'Planifie un entretien'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">

            <div>
              <label className={labelClass}>Candidature <span className="text-red-400">*</span></label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select name="application_id" required defaultValue={initial?.application_id ?? ''} className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-indigo-500 appearance-none bg-white">
                  <option value="">Sélectionne une candidature</option>
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>{app.company_name} — {app.job_title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Date et heure <span className="text-red-400">*</span></label>
                <div className="relative">
                  <CalendarCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input name="interview_date" type="datetime-local" required defaultValue={initial?.interview_date ? new Date(initial.interview_date).toISOString().slice(0, 16) : defaultDate ?? ''} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Type <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select name="type" required defaultValue={initial?.type ?? ''} className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-indigo-500 appearance-none bg-white">
                    <option value="">Type</option>
                    {INTERVIEW_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Statut</label>
              <div className="relative">
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select name="status" defaultValue={initial?.status ?? 'scheduled'} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-indigo-500 appearance-none bg-white">
                  <option value="scheduled">Planifié</option>
                  <option value="done">Effectué</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Notes</label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                <textarea name="notes" defaultValue={initial?.notes ?? ''} rows={3} placeholder="Questions prévues, informations utiles..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 resize-none bg-white" />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          </div>

          <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {loading ? 'Sauvegarde...' : initial ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function InterviewsPage() {
  const [interviews, setInterviews]         = useState<Interview[]>([])
  const [applications, setApplications]     = useState<Application[]>([])
  const [loading, setLoading]               = useState(true)
  const [showForm, setShowForm]             = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const [defaultDate, setDefaultDate]       = useState<string>('')
  const [view, setView]                     = useState<'calendar' | 'list'>('list')
  const [filter, setFilter]                 = useState<'all' | 'scheduled' | 'done' | 'cancelled'>('all')
  const { toasts, removeToast, toast }      = useToast()

  useEffect(() => {
    setShowForm(false)
    setEditingInterview(null)
    fetchData()
  }, [])

  async function fetchData() {
    const [interviewsRes, appsRes] = await Promise.all([
      fetch('/api/interviews'),
      fetch('/api/applications'),
    ])
    const interviewsData = await interviewsRes.json()
    const appsData       = await appsRes.json()
    setInterviews(Array.isArray(interviewsData) ? interviewsData : [])
    setApplications(Array.isArray(appsData) ? appsData : [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet entretien ?')) return
    const res = await fetch(`/api/interviews/${id}`, { method: 'DELETE' })
    if (res.ok) { setInterviews(prev => prev.filter(i => i.id !== id)); toast.success('Entretien supprimé') }
    else toast.error('Erreur lors de la suppression')
  }

  function handleSave(updated: Interview) {
    setInterviews(prev => {
      const exists = prev.find(i => i.id === updated.id)
      if (exists) { toast.success('Entretien mis à jour !'); return prev.map(i => i.id === updated.id ? updated : i) }
      toast.success('Entretien ajouté !')
      return [updated, ...prev]
    })
  }

  function handleCloseForm() { setShowForm(false); setEditingInterview(null); setDefaultDate('') }

  function handleDateClick(info: { dateStr: string }) {
    setDefaultDate(info.dateStr + 'T09:00')
    setEditingInterview(null)
    setShowForm(true)
  }

  function handleEventClick(info: { event: { id: string } }) {
    const interview = interviews.find(i => i.id === info.event.id)
    if (interview) { setEditingInterview(interview); setShowForm(true) }
  }

  async function handleEventDrop(info: { event: { id: string; start: Date | null } }) {
    if (!info.event.start) return
    const newDate = info.event.start.toISOString()
    setInterviews(prev => prev.map(i => i.id === info.event.id ? { ...i, interview_date: newDate } : i))
    const res = await fetch(`/api/interviews/${info.event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interview_date: newDate }),
    })
    if (res.ok) toast.success('Entretien déplacé !')
    else toast.error('Erreur lors du déplacement')
  }

  const calendarEvents = interviews.map(interview => ({
    id: interview.id,
    title: `${interview.applications?.company_name} — ${INTERVIEW_TYPES.find(t => t.id === interview.type)?.label}`,
    start: interview.interview_date,
    end: new Date(new Date(interview.interview_date).getTime() + 60 * 60 * 1000).toISOString(),
    backgroundColor: STATUS_CONFIG[interview.status].color,
    borderColor: STATUS_CONFIG[interview.status].color,
  }))

  const filtered   = filter === 'all' ? interviews : interviews.filter(i => i.status === filter)
  const isUpcoming = (dateStr: string) => new Date(dateStr) >= new Date()

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    })

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-sm">Chargement...</p></div>

  return (
    <div className="p-4 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Entretiens</h1>
          <p className="text-gray-400 text-xs md:text-sm mt-0.5">
            {interviews.filter(i => i.status === 'scheduled' && isUpcoming(i.interview_date)).length} à venir
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle vue — calendrier caché sur mobile */}
          <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setView('calendar')} className={`p-2 transition-colors ${view === 'calendar' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}>
              <Calendar size={15} />
            </button>
            <button onClick={() => setView('list')} className={`p-2 transition-colors ${view === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}>
              <List size={15} />
            </button>
          </div>
          <button
            onClick={() => { setEditingInterview(null); setShowForm(true) }}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Nouvel entretien</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Vue Calendrier — desktop uniquement */}
      {view === 'calendar' && (
        <div className="hidden sm:block bg-white border border-gray-100 rounded-xl p-4 md:p-6">
          <style>{`
            .fc { font-family: inherit !important; }
            .fc .fc-button { background-color: #6366f1 !important; border-color: #6366f1 !important; border-radius: 8px !important; font-size: 12px !important; padding: 6px 12px !important; font-weight: 500 !important; color: white !important; box-shadow: none !important; }
            .fc .fc-button:hover { background-color: #4f46e5 !important; }
            .fc .fc-toolbar-title { font-size: 15px !important; font-weight: 600 !important; color: #111827 !important; }
            .fc .fc-col-header-cell-cushion { font-size: 11px !important; font-weight: 500 !important; color: #6b7280 !important; text-decoration: none !important; padding: 6px 0 !important; }
            .fc .fc-daygrid-day-number { font-size: 11px !important; color: #374151 !important; text-decoration: none !important; padding: 4px 6px !important; }
            .fc .fc-event { border-radius: 6px !important; font-size: 11px !important; padding: 2px 6px !important; cursor: pointer !important; border: none !important; font-weight: 500 !important; color: white !important; }
            .fc .fc-event-title { color: white !important; font-size: 11px !important; }
            .fc .fc-event-time { color: rgba(255,255,255,0.8) !important; font-size: 10px !important; }
            .fc .fc-daygrid-event-dot { display: none !important; }
            .fc a.fc-event { color: white !important; }
            .fc .fc-daygrid-block-event .fc-event-title { color: white !important; padding: 0 2px !important; }
            .fc .fc-daygrid-dot-event { background: var(--fc-event-bg-color) !important; border-radius: 6px !important; padding: 2px 6px !important; }
            .fc .fc-daygrid-dot-event .fc-event-title { color: white !important; font-weight: 500 !important; }
            .fc .fc-day-today { background-color: #eef2ff !important; }
            .fc .fc-day-today .fc-daygrid-day-number { color: #6366f1 !important; font-weight: 600 !important; }
            .fc th, .fc td { border-color: #f3f4f6 !important; }
            .fc .fc-scrollgrid { border-color: #f3f4f6 !important; }
            .fc .fc-daygrid-day-frame { min-height: 70px !important; }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={frLocale}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            editable={true}
            eventDrop={handleEventDrop}
            height="auto"
          />
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium">Légende :</p>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                <span className="text-xs text-gray-500">{config.label}</span>
              </div>
            ))}
            <p className="text-xs text-gray-400 ml-auto hidden lg:block">Clic sur un jour pour créer · Glisse pour déplacer</p>
          </div>
        </div>
      )}

      {/* Vue Liste */}
      {(view === 'list' || true) && (
        <div className={view === 'calendar' ? 'sm:hidden' : ''}>

          {/* Filtres */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {([
              { key: 'all',       label: 'Tous'      },
              { key: 'scheduled', label: 'Planifiés' },
              { key: 'done',      label: 'Effectués' },
              { key: 'cancelled', label: 'Annulés'   },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                  filter === f.key ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-500'
                }`}
              >
                {f.label}
                <span className="ml-1.5 opacity-60">
                  {f.key === 'all' ? interviews.length : interviews.filter(i => i.status === f.key).length}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <CalendarCheck size={22} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Aucun entretien</p>
              <p className="text-gray-400 text-xs mt-1">Planifie ton premier entretien</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered
                .sort((a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime())
                .map(interview => {
                  const statusConfig = STATUS_CONFIG[interview.status]
                  const StatusIcon   = statusConfig.icon
                  const typeLabel    = INTERVIEW_TYPES.find(t => t.id === interview.type)?.label ?? interview.type
                  const upcoming     = isUpcoming(interview.interview_date) && interview.status === 'scheduled'

                  return (
                    <div key={interview.id} className={`bg-white border rounded-xl p-4 hover:shadow-sm transition-all group ${upcoming ? 'border-indigo-100' : 'border-gray-100'}`}>
                      <div className="flex items-start gap-3">

                        {/* Icône statut */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${statusConfig.className}`}>
                          <StatusIcon size={16} />
                        </div>

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900 text-sm truncate">{interview.applications?.company_name}</h3>
                                <span className="text-xs text-gray-400">{typeLabel}</span>
                                {upcoming && <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-full">À venir</span>}
                              </div>
                              <p className="text-xs text-gray-400 truncate mt-0.5">{interview.applications?.job_title}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className={`hidden sm:inline text-xs font-medium px-2 py-1 rounded-full ${statusConfig.className}`}>
                                {statusConfig.label}
                              </span>
                              <button onClick={() => { setEditingInterview(interview); setShowForm(true) }} className="text-gray-400 hover:text-indigo-600 p-1 rounded transition-colors">
                                <Pencil size={13} />
                              </button>
                              <button onClick={() => handleDelete(interview.id)} className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <CalendarCheck size={11} />
                              <span>{formatDate(interview.interview_date)}</span>
                            </div>
                            {interview.notes && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <FileText size={11} />
                                <span className="truncate max-w-48">{interview.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <InterviewForm
          onClose={handleCloseForm}
          onSave={handleSave}
          initial={editingInterview}
          applications={applications}
          defaultDate={defaultDate}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}