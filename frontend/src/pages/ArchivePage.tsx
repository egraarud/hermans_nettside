import { Link } from 'react-router-dom'
import { useEditions } from '../api/editions'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function ArchivePage() {
  const { data: editions, isLoading } = useEditions()
  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Arkiv</h1>
      {!editions?.length && <p className="text-gray-500">Ingen utgaver funnet.</p>}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {editions?.map(ed => (
          <Link
            key={ed.id}
            to={`/arkiv/${ed.id}`}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition group"
          >
            <div className="text-3xl font-bold text-green-700">{ed.year}</div>
            <div className="font-semibold text-gray-800 group-hover:text-green-700 mt-1">{ed.name}</div>
            {ed.start_date && (
              <div className="text-sm text-gray-400 mt-1">
                {ed.start_date}{ed.end_date ? ` – ${ed.end_date}` : ''}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
