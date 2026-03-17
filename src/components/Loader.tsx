export default function Loader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 animate-spin" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-gray-700">Chargement</p>
        <p className="text-xs text-gray-400">Un instant...</p>
      </div>
    </div>
  )
}