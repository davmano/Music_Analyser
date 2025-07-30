import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { Music, Upload, BarChart3, Clock, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface Song {
  _id: string
  title: string
  artist: string
  analysis: {
    duration: number
    tempo: number
    key: string
    energy: number
  }
  createdAt: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/songs?limit=5`)
      setSongs(response.data.songs)
    } catch (error) {
      toast.error('Failed to fetch songs')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your music analysis activity
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Songs</p>
              <p className="text-2xl font-bold text-gray-900">{songs.length}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Music className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Tempo</p>
              <p className="text-2xl font-bold text-gray-900">
                {songs.length > 0 
                  ? Math.round(songs.reduce((acc, song) => acc + song.analysis.tempo, 0) / songs.length)
                  : 0
                } BPM
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Energy</p>
              <p className="text-2xl font-bold text-gray-900">
                {songs.length > 0 
                  ? (songs.reduce((acc, song) => acc + song.analysis.energy, 0) / songs.length * 100).toFixed(0)
                  : 0
                }%
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Songs</h2>
            <Link
              to="/upload"
              className="text-primary hover:underline text-sm font-medium"
            >
              Upload New
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : songs.length > 0 ? (
            <div className="space-y-4">
              {songs.map((song) => (
                <div key={song._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{song.title}</h3>
                    <p className="text-sm text-gray-600">
                      {song.artist || 'Unknown Artist'} • {song.analysis.key} • {Math.round(song.analysis.tempo)} BPM
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{formatDuration(song.analysis.duration)}</p>
                    <Link
                      to={`/analysis/${song._id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      View Analysis
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No songs uploaded yet</p>
              <Link
                to="/upload"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Upload Your First Song
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/upload"
              className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <div className="bg-primary/10 p-2 rounded-full">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Upload New Song</h3>
                <p className="text-sm text-gray-600">Analyze a new audio file</p>
              </div>
            </Link>

            <Link
              to="/arrangements"
              className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="bg-green-100 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">View Arrangements</h3>
                <p className="text-sm text-gray-600">Manage your arrangements</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
