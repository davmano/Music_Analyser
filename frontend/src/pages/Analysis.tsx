import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import { Music, Clock, Zap, Key, Activity, ArrowLeft, Save } from 'lucide-react'

interface Song {
  _id: string
  title: string
  artist: string
  analysis: {
    duration: number
    tempo: number
    key: string
    timeSignature: string
    energy: number
    danceability: number
    sections: Array<{
      startTime: number
      endTime: number
      sectionType: string
      confidence: number
    }>
    spectralFeatures: {
      spectralCentroidMean: number
      spectralRolloffMean: number
      spectralBandwidthMean: number
      zeroCrossingRateMean: number
    }
    rhythmFeatures: {
      tempo: number
      beatCount: number
      onsetCount: number
      rhythmRegularity: number
    }
  }
  createdAt: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Analysis() {
  const { songId } = useParams<{ songId: string }>()
  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (songId) {
      fetchSong()
    }
  }, [songId])

  const fetchSong = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/songs/${songId}`)
      setSong(response.data.song)
    } catch (error) {
      toast.error('Failed to fetch song analysis')
    } finally {
      setLoading(false)
    }
  }

  const createArrangement = async () => {
    if (!song) return

    setSaving(true)
    try {
      await axios.post(`${API_URL}/api/arrangements`, {
        name: `${song.title} - Arrangement`,
        songId: song._id,
        description: 'Auto-generated arrangement from analysis'
      })

      toast.success('Arrangement created successfully!')
    } catch (error) {
      toast.error('Failed to create arrangement')
    } finally {
      setSaving(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getSectionColor = (sectionType: string) => {
    const colors = {
      intro: 'bg-blue-100 text-blue-800 border-blue-200',
      verse: 'bg-green-100 text-green-800 border-green-200',
      chorus: 'bg-purple-100 text-purple-800 border-purple-200',
      bridge: 'bg-orange-100 text-orange-800 border-orange-200',
      outro: 'bg-gray-100 text-gray-800 border-gray-200',
      full_song: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    }
    return colors[sectionType as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!song) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Song not found</h2>
        <p className="text-gray-600 mb-6">The song you're looking for doesn't exist or you don't have access to it.</p>
        <Link
          to="/dashboard"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const chartData = song.analysis.sections.map((section, index) => ({
    name: section.sectionType,
    duration: section.endTime - section.startTime,
    confidence: section.confidence * 100,
    index
  }))

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{song.title}</h1>
            {song.artist && (
              <p className="text-lg text-gray-600">by {song.artist}</p>
            )}
          </div>
        </div>
        <button
          onClick={createArrangement}
          disabled={saving}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Create Arrangement</span>
            </>
          )}
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Duration</p>
              <p className="text-xl font-bold text-gray-900">
                {formatDuration(song.analysis.duration)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.round(song.analysis.tempo)} BPM
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Key className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Key</p>
              <p className="text-xl font-bold text-gray-900">{song.analysis.key}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <Zap className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Energy</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.round(song.analysis.energy * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Song Structure</h2>
          <div className="space-y-3">
            {song.analysis.sections.map((section, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getSectionColor(section.sectionType)}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium capitalize">{section.sectionType.replace('_', ' ')}</h3>
                    <p className="text-sm opacity-75">
                      {formatTime(section.startTime)} - {formatTime(section.endTime)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDuration(section.endTime - section.startTime)}
                    </p>
                    <p className="text-xs opacity-75">
                      {Math.round(section.confidence * 100)}% confidence
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Section Duration Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}s`, 'Duration']}
                labelFormatter={(label) => `Section: ${label}`}
              />
              <Bar dataKey="duration" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Musical Features</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Danceability</span>
              <span className="font-medium">{Math.round(song.analysis.danceability * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Signature</span>
              <span className="font-medium">{song.analysis.timeSignature}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Beat Count</span>
              <span className="font-medium">{song.analysis.rhythmFeatures.beatCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Onset Count</span>
              <span className="font-medium">{song.analysis.rhythmFeatures.onsetCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Spectral Analysis</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Spectral Centroid</span>
              <span className="font-medium">{Math.round(song.analysis.spectralFeatures.spectralCentroidMean)} Hz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Spectral Rolloff</span>
              <span className="font-medium">{Math.round(song.analysis.spectralFeatures.spectralRolloffMean)} Hz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Spectral Bandwidth</span>
              <span className="font-medium">{Math.round(song.analysis.spectralFeatures.spectralBandwidthMean)} Hz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Zero Crossing Rate</span>
              <span className="font-medium">{song.analysis.spectralFeatures.zeroCrossingRateMean.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
