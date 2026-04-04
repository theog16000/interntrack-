export type Status = 'to_apply' | 'sent' | 'interview' | 'offer' | 'rejected'
export type InterviewType = 'phone' | 'video' | 'onsite' | 'technical' | 'hr'
export type InterviewStatus = 'scheduled' | 'done' | 'cancelled'

export type Application = {
  id: string
  user_id: string
  company_name: string
  job_title: string
  offer_url?: string
  hr_contact?: string
  notes?: string
  status: Status
  applied_at?: string
  created_at: string
  updated_at: string
  company_id?: string
  remind_at?:   string | null
reminded_at?: string | null
}

export type Company = {
  id: string
  user_id: string
  name: string
  sector?: string
  website?: string
  location?: string
  notes?: string
  created_at: string
  updated_at: string
  applications?: { id: string; job_title: string; status: Status }[]
}

export type Interview = {
  id: string
  user_id: string
  application_id: string
  interview_date: string
  type: InterviewType
  notes?: string
  status: InterviewStatus
  created_at: string
  updated_at: string
  applications?: { id: string; job_title: string; company_name: string }
}

export type Document = {
  id: string
  application_id: string
  user_id: string
  name: string
  file_path: string
  file_type: 'cv' | 'cover_letter' | 'other'
  created_at: string
}

export const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: 'to_apply',  label: 'À postuler', color: 'bg-gray-50'    },
  { id: 'sent',      label: 'Envoyé',     color: 'bg-blue-50'    },
  { id: 'interview', label: 'Entretien',  color: 'bg-orange-50'  },
  { id: 'offer',     label: 'Offre',      color: 'bg-green-50'   },
  { id: 'rejected',  label: 'Refus',      color: 'bg-red-50'     },
]

export const INTERVIEW_TYPES: { id: InterviewType; label: string }[] = [
  { id: 'phone',     label: 'Téléphone' },
  { id: 'video',     label: 'Visio'     },
  { id: 'onsite',    label: 'Présentiel'},
  { id: 'technical', label: 'Technique' },
  { id: 'hr',        label: 'RH'        },
]

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}