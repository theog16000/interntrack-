'use client'

import { useState, useEffect } from 'react'
import { Document } from '@/lib/types'
import {
  X, Download, Trash2, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, FileText,
  FileBadge, Paperclip, RotateCw, Maximize2
} from 'lucide-react'

type Props = {
  documents: Document[]
  initialIndex: number
  onClose: () => void
  onDelete: (id: string) => void
}

const FILE_TYPE_CONFIG = {
  cv:           { label: 'CV',               icon: FileBadge,  className: 'bg-indigo-50 text-indigo-600' },
  cover_letter: { label: 'Lettre de motiv.', icon: FileText,   className: 'bg-blue-50 text-blue-600'    },
  other:        { label: 'Autre',            icon: Paperclip,  className: 'bg-gray-50 text-gray-600'    },
}

function getFileExtension(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

function isImage(name: string) {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(getFileExtension(name))
}

function isPDF(name: string) {
  return getFileExtension(name) === 'pdf'
}

export default function DocumentViewer({ documents, initialIndex, onClose, onDelete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [signedUrl, setSignedUrl]       = useState<string | null>(null)
  const [loadingUrl, setLoadingUrl]     = useState(false)
  const [zoom, setZoom]                 = useState(1)
  const [rotation, setRotation]         = useState(0)
  const [fullscreen, setFullscreen]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const current = documents[currentIndex]
  const config  = FILE_TYPE_CONFIG[current?.file_type]
  const Icon    = config?.icon

  // Récupère l'URL signée à chaque changement de document
  useEffect(() => {
    if (!current) return
    setSignedUrl(null)
    setZoom(1)
    setRotation(0)
    setConfirmDelete(false)
    setLoadingUrl(true)

    fetch(`/api/documents/${current.id}`)
      .then(r => r.json())
      .then(data => { setSignedUrl(data.url ?? null) })
      .finally(() => setLoadingUrl(false))
  }, [current?.id])

  // Ferme avec Escape, navigue avec les flèches
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === '+') setZoom(z => Math.min(z + 0.25, 3))
      if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.5))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentIndex])

  function prev() {
    if (currentIndex > 0) setCurrentIndex(i => i - 1)
  }

  function next() {
    if (currentIndex < documents.length - 1) setCurrentIndex(i => i + 1)
  }

  function handleDownload() {
    if (signedUrl) window.open(signedUrl, '_blank')
  }

  async function handleDelete() {
    await fetch(`/api/documents/${current.id}`, { method: 'DELETE' })
    onDelete(current.id)
    if (documents.length === 1) {
      onClose()
    } else if (currentIndex === documents.length - 1) {
      setCurrentIndex(i => i - 1)
    }
  }

  const canPreview = isImage(current?.name ?? '') || isPDF(current?.name ?? '')

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950/95 backdrop-blur-sm" onClick={onClose}>

      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Infos document */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config?.className}`}>
            {Icon && <Icon size={14} />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate max-w-48 md:max-w-80">{current?.name}</p>
            <p className="text-xs text-gray-400">{config?.label} · {getFileExtension(current?.name ?? '').toUpperCase()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">

          {/* Zoom — seulement si preview disponible */}
          {canPreview && (
            <div className="hidden sm:flex items-center gap-1 mr-2 bg-white/10 rounded-lg px-2 py-1">
              <button
                onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                className="text-gray-300 hover:text-white p-1 rounded transition-colors"
                title="Zoom arrière (-)"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-xs text-gray-300 w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                className="text-gray-300 hover:text-white p-1 rounded transition-colors"
                title="Zoom avant (+)"
              >
                <ZoomIn size={15} />
              </button>
            </div>
          )}

          {/* Rotation image */}
          {isImage(current?.name ?? '') && (
            <button
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Rotation"
            >
              <RotateCw size={16} />
            </button>
          )}

          {/* Plein écran PDF */}
          {isPDF(current?.name ?? '') && signedUrl && (
            <button
              onClick={() => setFullscreen(f => !f)}
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Plein écran"
            >
              <Maximize2 size={16} />
            </button>
          )}

          {/* Télécharger */}
          <button
            onClick={handleDownload}
            disabled={!signedUrl}
            className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-40"
            title="Télécharger"
          >
            <Download size={16} />
          </button>

          {/* Supprimer */}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-gray-300 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-1.5">
              <span className="text-xs text-red-300">Supprimer ?</span>
              <button
                onClick={handleDelete}
                className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                Oui
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs font-medium text-gray-400 hover:text-gray-300 transition-colors"
              >
                Non
              </button>
            </div>
          )}

          {/* Fermer */}
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors ml-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Zone principale */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >

        {/* Navigation prev */}
        {currentIndex > 0 && (
          <button
            onClick={prev}
            className="absolute left-3 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Contenu */}
        <div className="w-full h-full flex items-center justify-center p-4 md:p-8 overflow-auto">
          {loadingUrl ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Chargement...</p>
            </div>
          ) : !signedUrl ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${config?.className}`}>
                {Icon && <Icon size={28} />}
              </div>
              <p className="text-gray-300 text-sm">Impossible de charger l'aperçu</p>
              <p className="text-gray-500 text-xs">Le fichier est peut-être inaccessible</p>
            </div>
          ) : isImage(current.name) ? (
            <img
              src={signedUrl}
              alt={current.name}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          ) : isPDF(current.name) ? (
            <div
              className={`bg-white rounded-xl shadow-2xl transition-all ${fullscreen ? 'w-full h-full' : 'w-full max-w-3xl'}`}
              style={{ height: fullscreen ? '100%' : '75vh' }}
            >
              <iframe
                src={`${signedUrl}#toolbar=1&view=FitH`}
                className="w-full h-full rounded-xl"
                title={current.name}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
              />
            </div>
          ) : (
            // Fichier non prévisualisable (doc, docx, etc.)
            <div className="flex flex-col items-center gap-4 text-center">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${config?.className}`}>
                {Icon && <Icon size={36} />}
              </div>
              <div>
                <p className="text-white font-medium mb-1">{current.name}</p>
                <p className="text-gray-400 text-sm mb-6">Aperçu non disponible pour ce format</p>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors mx-auto"
                >
                  <Download size={16} />
                  Télécharger pour ouvrir
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation next */}
        {currentIndex < documents.length - 1 && (
          <button
            onClick={next}
            className="absolute right-3 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Barre du bas — miniatures */}
      {documents.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-3 border-t border-white/10 overflow-x-auto flex-shrink-0"
          onClick={e => e.stopPropagation()}
        >
          {documents.map((doc, i) => {
            const cfg     = FILE_TYPE_CONFIG[doc.file_type]
            const DocIcon = cfg?.icon
            return (
              <button
                key={doc.id}
                onClick={() => setCurrentIndex(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all flex-shrink-0 ${
                  i === currentIndex
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${cfg?.className}`}>
                  {DocIcon && <DocIcon size={11} />}
                </div>
                <span className="truncate max-w-24">{doc.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}