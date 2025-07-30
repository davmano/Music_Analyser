import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Settings, Music, Plus, Trash2, Eye, Calendar } from 'lucide-react'

interface Arrangement {
  _id: string
  name: string
  description: string
  song: {
    _id: string
    title: string
    artist: string
  }
  sections: Array<{
    id: string
    startTime: number
    endTime: number
    sectionType: string
    customName: string
    notes: string
    order: number
  }>
  suggestions: Array<{
    type: string
    description: string
    confidence: number
    applied: boolean
  }>
  isPublic: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Arrangements() {
  const [arrangements, setArrangements] = useState<Arrangement[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchArrangements()
  }, [])

  const fetchArrangements = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/arrangements`)
      setArrangements(response.data.arrangements)
    } catch (error) {
      toast.error('Failed to fetch arrangements')
    } finally {
      setLoading(false)
    }
  }

  const deleteArrangement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this arrangement?')) {
      return
    }

    setDeleting(id)
    try {
      await axios.delete(`${API_URL}/api/arrangements/${id}`)
      setArrangements(arrangements.filter(arr => arr._id !== id))
      toast.success('Arrangement deleted successfully')
    } catch (error) {
      toast.error('Failed to delete arrangement')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSuggestionTypeColor = (type: string) => {
    const colors = {
      tempo: 'bg-blue-100 text-blue-800',
      energy: 'bg-green-100 text-green-800',
      structure: 'bg-purple-100 text-purple-800',
      arrangement: 'bg-orange-100 text-orange-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Arrangements</h1>
            <p className="text-gray-600">Manage your song arrangements and AI suggestions</p>
          </div>
        </div>
        <Link
          to="/upload"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {arrangements.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No arrangements yet</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Upload and analyze songs to create arrangements with AI-powered suggestions.
          </p>
          <Link
            to="/upload"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Your First Song</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {arrangements.map((arrangement) => (
            <div key={arrangement._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{arrangement.name}</h2>
                    {arrangement.isPublic && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Public
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Music className="h-4 w-4" />
                      <span>{arrangement.song.title}</span>
                      {arrangement.song.artist && (
                        <span>by {arrangement.song.artist}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {formatDate(arrangement.createdAt)}</span>
                    </div>
                  </div>
                  {arrangement.description && (
                    <p className="text-gray-600 mb-3">{arrangement.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/analysis/${arrangement.song._id}`}
                    className="text-gray-600 hover:text-primary transition-colors p-2"
                    title="View Analysis"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deleteArrangement(arrangement._id)}
                    disabled={deleting === arrangement._id}
                    className="text-gray-600 hover:text-red-600 transition-colors p-2 disabled:opacity-50"
                    title="Delete Arrangement"
                  >
                    {deleting === arrangement._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Sections ({arrangement.sections.length})</h3>
                  <div className="space-y-2">
                    {arrangement.sections.slice(0, 4).map((section) => (
                      <div key={section.id} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{section.customName || section.sectionType}</span>
                        <span className="text-gray-500">
                          {Math.floor(section.startTime / 60)}:{Math.floor(section.startTime % 60).toString().padStart(2, '0')} - 
                          {Math.floor(section.endTime / 60)}:{Math.floor(section.endTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    ))}
                    {arrangement.sections.length > 4 && (
                      <p className="text-xs text-gray-500">
                        +{arrangement.sections.length - 4} more sections
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">AI Suggestions ({arrangement.suggestions.length})</h3>
                  <div className="space-y-2">
                    {arrangement.suggestions.slice(0, 3).map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getSuggestionTypeColor(suggestion.type)}`}>
                          {suggestion.type}
                        </span>
                        <p className="text-sm text-gray-600 flex-1">{suggestion.description}</p>
                        <span className="text-xs text-gray-500">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                    {arrangement.suggestions.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{arrangement.suggestions.length - 3} more suggestions
                      </p>
                    )}
                    {arrangement.suggestions.length === 0 && (
                      <p className="text-sm text-gray-500">No suggestions available</p>
                    )}
                  </div>
                </div>
              </div>

              {arrangement.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {arrangement.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
