'use client'

import { Application } from '@/lib/types'
import { Pencil, Trash2, ExternalLink, User, Calendar, Building2, ChevronDown } from 'lucide-react'

type Props = {
  application: Application
  onDelete: (id: string) => void
  onEdit: (application: Application) => void
  onStatusChange?: (id: string, status: string) => void
  listView?: boolean
}

const STATUS_DOT: Record<string, string> = {
  to_apply:  'bg-gray-400',
  sent:      'bg-blue-400',
  interview: 'bg-orange-400',
  offer:     'bg-green-400',
  rejected:  'bg-red-400',
}

const STATUS_LABEL: Record<string, string> = {
  to_apply:  'A postuler',
  sent:      'Envoye',
  interview: 'Entretien',
  offer:     'Offre',
  rejected:  'Refus',
}

const STATUS_OPTIONS = [
  { value: 'to_apply',  label: 'A postuler' },
  { value: 'sent',      label: 'Envoye'     },
  { value: 'interview', label: 'Entretien'  },
  { value: 'offer',     label: 'Offre'      },
  { value: 'rejected',  label: 'Refus'      },
]

export default function ApplicationCard({ application, onDelete, onEdit, onStatusChange, listView }: Props) {

  if (listView) {
    return (
      <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 size={14} className="text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{application.company_name}</p>
            <p className="text-xs text-gray-400 truncate">{application.job_title}</p>
          </div>
        </div>

        {application.applied_at && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
            <Calendar size={11} />
            <span>{new Date(application.applied_at).toLocaleDateString('fr-FR')}</span>
          </div>
        )}

        {onStatusChange && (
          <div className="relative flex-shrink-0">
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={application.status}
              onChange={e => onStatusChange(application.id, e.target.value)}
              onClick={e => e.stopPropagation()}
              className="pl-2 pr-6 py-1 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:border-indigo-500 appearance-none bg-white"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-1 flex-shrink-0">
          {application.offer_url && (
            <a href={application.offer_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-gray-300 hover:text-indigo-500 p-1 rounded transition-colors">
              <ExternalLink size={13} />
            </a>
          )}
          <button onClick={() => onEdit(application)} className="text-gray-300 hover:text-indigo-600 p-1 rounded transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(application.id)} className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">

      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
            <Building2 size={11} className="text-gray-500" />
          </div>
          <h3 className="font-semibold text-gray-900 text-xs truncate">{application.company_name}</h3>
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">
          <button onClick={() => onEdit(application)} className="text-gray-300 hover:text-indigo-600 p-1 rounded transition-colors">
            <Pencil size={11} />
          </button>
          <button onClick={() => onDelete(application.id)} className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors">
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      <p className="text-gray-500 text-xs mb-2 truncate">{application.job_title}</p>

      <div className="space-y-1">
        {application.hr_contact && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <User size={10} className="flex-shrink-0" />
            <span className="truncate">{application.hr_contact}</span>
          </div>
        )}
        {application.applied_at && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={10} className="flex-shrink-0" />
            <span>{new Date(application.applied_at).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
        {application.offer_url && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-500">
            <ExternalLink size={10} className="flex-shrink-0" />
            <a href={application.offer_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="hover:text-indigo-700 transition-colors truncate">
              Voir offre
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[application.status]}`} />
          <span className="text-xs text-gray-400">{STATUS_LABEL[application.status]}</span>
        </div>
        {onStatusChange && (
          <div className="relative">
            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={application.status}
              onChange={e => onStatusChange(application.id, e.target.value)}
              onClick={e => e.stopPropagation()}
              className="pl-1.5 pr-4 py-0.5 border border-gray-200 rounded text-xs text-gray-600 focus:outline-none appearance-none bg-white"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}