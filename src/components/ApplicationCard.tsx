'use client'

import { Application } from '@/lib/types'
import { Pencil, Trash2, ExternalLink, User, Calendar, Building2 } from 'lucide-react'

type Props = {
  application: Application
  onDelete: (id: string) => void
  onEdit: (application: Application) => void
}

const STATUS_DOT: Record<string, string> = {
  to_apply:  'bg-gray-400',
  sent:      'bg-blue-400',
  interview: 'bg-orange-400',
  offer:     'bg-green-400',
  rejected:  'bg-red-400',
}

const STATUS_LABEL: Record<string, string> = {
  to_apply:  'À postuler',
  sent:      'Envoyé',
  interview: 'Entretien',
  offer:     'Offre',
  rejected:  'Refus',
}

export default function ApplicationCard({ application, onDelete, onEdit }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 size={13} className="text-gray-500" />
          </div>
          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {application.company_name}
          </h3>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
          <button onClick={() => onEdit(application)} className="text-gray-300 hover:text-indigo-600 p-1 rounded transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(application.id)} className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <p className="text-gray-500 text-xs mb-3">{application.job_title}</p>

      <div className="space-y-1.5">
        {application.hr_contact && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <User size={11} className="flex-shrink-0" />
            <span className="truncate">{application.hr_contact}</span>
          </div>
        )}
        {application.applied_at && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={11} className="flex-shrink-0" />
            <span>{new Date(application.applied_at).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
        {application.offer_url && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-500">
            <ExternalLink size={11} className="flex-shrink-0" />
            <a href={application.offer_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="hover:text-indigo-700 transition-colors">
              Voir l'offre
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
        <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[application.status]}`} />
        <span className="text-xs text-gray-400">{STATUS_LABEL[application.status]}</span>
      </div>
    </div>
  )
}