import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { Music, Upload, BarChart3, TrendingUp } from 'lucide-react'
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
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-lg text-earth-300">
            Here's an overview of your music analysis activity
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8 animate-slide-up">
          <div className="card p-6 hover:shadow-glow-blue transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gold-500 mb-1">Total Songs</p>
                <p className="text-3xl font-bold text-earth-100">{songs.length}</p>
              </div>
              <div className="p-3 bg-accent-blue-500/20 rounded-lg">
                <Music className="h-8 w-8 text-accent-blue-500" />
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-glow-green transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gold-500 mb-1">Avg Tempo</p>
                <p className="text-3xl font-bold text-earth-100">
                  {songs.length > 0 
                    ? Math.round(songs.reduce((acc, song) => acc + song.analysis.tempo, 0) / songs.length)
                    : 0
                  } BPM
                </p>
              </div>
              <div className="p-3 bg-accent-green-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent-green-500" />
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-glow-purple transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gold-500 mb-1">Avg Energy</p>
                <p className="text-3xl font-bold text-earth-100">
                  {songs.length > 0 
                    ? (songs.reduce((acc, song) => acc + song.analysis.energy, 0) / songs.length * 100).toFixed(0)
                    : 0
                  }%
                </p>
              </div>
              <div className="p-3 bg-accent-purple-500/20 rounded-lg">
                <BarChart3 className="h-8 w-8 text-accent-purple-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gold-500 flex items-center">
                <Music className="h-6 w-6 mr-2" />
                Recent Songs
              </h2>
              <Link
                to="/upload"
                className="text-accent-blue-500 hover:text-accent-blue-400 text-sm font-semibold transition-colors duration-200"
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
                  <div key={song._id} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg border border-dark-500 hover:border-accent-blue-500/50 transition-all duration-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-accent-blue-500/20 rounded-lg mr-3">
                        <Music className="h-5 w-5 text-accent-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-earth-100">{song.title}</h3>
                        <p className="text-sm text-earth-400">
                          {song.artist || 'Unknown Artist'} • {song.analysis.key} • {Math.round(song.analysis.tempo)} BPM
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-earth-400 mb-1">{formatDuration(song.analysis.duration)}</p>
                      <Link
                        to={`/analysis/${song._id}`}
                        className="text-xs text-accent-green-500 hover:text-accent-green-400 font-medium transition-colors duration-200"
                      >
                        View Analysis
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-bounce-gentle mb-4">
                  <Music className="h-16 w-16 text-earth-400 mx-auto" />
                </div>
                <p className="text-earth-300 mb-6 text-lg">No songs uploaded yet</p>
                <Link
                  to="/upload"
                  className="btn-primary inline-flex items-center"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Your First Song
                </Link>
              </div>
            )}
        </div>

          <div className="card p-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-gold-500 mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2" />
              Quick Actions
            </h2>
            <div className="space-y-4">
              <Link
                to="/upload"
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-accent-blue-500/10 to-accent-blue-500/5 rounded-lg border border-accent-blue-500/20 hover:border-accent-blue-500/50 hover:shadow-glow-blue transition-all duration-300 group"
              >
                <div className="p-3 bg-accent-blue-500/20 rounded-lg group-hover:bg-accent-blue-500/30 transition-colors duration-300">
                  <Upload className="h-6 w-6 text-accent-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-earth-100 mb-1">Upload New Song</h3>
                  <p className="text-sm text-earth-400">Analyze a new audio file</p>
                </div>
              </Link>

              <Link
                to="/arrangements"
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-accent-green-500/10 to-accent-green-500/5 rounded-lg border border-accent-green-500/20 hover:border-accent-green-500/50 hover:shadow-glow-green transition-all duration-300 group"
              >
                <div className="p-3 bg-accent-green-500/20 rounded-lg group-hover:bg-accent-green-500/30 transition-colors duration-300">
                  <BarChart3 className="h-6 w-6 text-accent-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-earth-100 mb-1">View Arrangements</h3>
                  <p className="text-sm text-earth-400">Manage your arrangements</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
