import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import { Music, Clock, Zap, Key, Activity, ArrowLeft, Save, BarChart as BarChartIcon } from 'lucide-react'

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


  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent-blue-500/30 border-t-accent-blue-500 mx-auto mb-4"></div>
          <p className="text-earth-300 text-lg">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="animate-bounce-gentle mb-6">
            <Music className="h-20 w-20 text-earth-400 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-4">Song not found</h2>
          <p className="text-earth-300 mb-8 text-lg max-w-md">
            The song you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link
            to="/dashboard"
            className="btn-primary inline-flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
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
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-accent-blue-500 hover:text-accent-blue-400 transition-colors duration-200"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gradient">{song.title}</h1>
              {song.artist && (
                <p className="text-lg text-earth-300 mt-2">by {song.artist}</p>
              )}
            </div>
          </div>
          <button
            onClick={createArrangement}
            disabled={saving}
            className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-6 w-6 mr-3" />
                Create Arrangement
              </>
            )}
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8 animate-slide-up">
          <div className="card p-6 hover:shadow-glow-blue transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent-blue-500/20 rounded-lg">
                <Clock className="h-6 w-6 text-accent-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gold-500">Duration</p>
                <p className="text-2xl font-bold text-earth-100">
                  {formatDuration(song.analysis.duration)}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-glow-green transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent-green-500/20 rounded-lg">
                <Activity className="h-6 w-6 text-accent-green-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gold-500">Tempo</p>
                <p className="text-2xl font-bold text-earth-100">
                  {Math.round(song.analysis.tempo)} BPM
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-glow-purple transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent-purple-500/20 rounded-lg">
                <Key className="h-6 w-6 text-accent-purple-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gold-500">Key</p>
                <p className="text-2xl font-bold text-earth-100">{song.analysis.key}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-glow-gold transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gold-500/20 rounded-lg">
                <Zap className="h-6 w-6 text-gold-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gold-500">Energy</p>
                <p className="text-2xl font-bold text-earth-100">
                  {Math.round(song.analysis.energy * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="card p-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-gold-500 mb-6 flex items-center">
              <Music className="h-6 w-6 mr-2" />
              Song Structure
            </h2>
            <div className="space-y-3">
              {song.analysis.sections.map((section, index) => (
                <div
                  key={index}
                  className="p-4 bg-dark-700 rounded-lg border border-dark-500 hover:border-accent-blue-500/50 transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-earth-100 capitalize mb-1">
                        {section.sectionType.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-earth-400">
                        {formatTime(section.startTime)} - {formatTime(section.endTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-accent-green-500 mb-1">
                        {formatDuration(section.endTime - section.startTime)}
                      </p>
                      <p className="text-xs text-earth-400">
                        {Math.round(section.confidence * 100)}% confidence
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-gold-500 mb-6 flex items-center">
              <BarChartIcon className="h-6 w-6 mr-2" />
              Section Duration Chart
            </h2>
            <div className="bg-dark-700 p-4 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#d6d3d1', fontSize: 12 }}
                    axisLine={{ stroke: '#6b7280' }}
                  />
                  <YAxis 
                    tick={{ fill: '#d6d3d1', fontSize: 12 }}
                    axisLine={{ stroke: '#6b7280' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}s`, 'Duration']}
                    labelFormatter={(label) => `Section: ${label}`}
                    contentStyle={{
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #4a4a4a',
                      borderRadius: '8px',
                      color: '#d6d3d1'
                    }}
                  />
                  <Bar dataKey="duration" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="card p-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-gold-500 mb-6 flex items-center">
              <Activity className="h-6 w-6 mr-2" />
              Musical Features
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                <span className="text-earth-300">Danceability</span>
                <span className="font-semibold text-accent-green-500">{Math.round(song.analysis.danceability * 100)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                <span className="text-earth-300">Time Signature</span>
                <span className="font-semibold text-earth-100">{song.analysis.timeSignature}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                <span className="text-earth-300">Beat Count</span>
                <span className="font-semibold text-earth-100">{song.analysis.rhythmFeatures.beatCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                <span className="text-earth-300">Onset Count</span>
                <span className="font-semibold text-earth-100">{song.analysis.rhythmFeatures.onsetCount}</span>
              </div>
            </div>
          </div>

          <div className="card p-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-gold-500 mb-6 flex items-center">
              <Zap className="h-6 w-6 mr-2" />
              Spectral Analysis
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                <span className="text-earth-300">Spectral Centroid</span>
                <span className="font-semibold text-accent-blue-500">{Math.round(song.analysis.spectralFeatures.spectralCentroidMean)} Hz</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                <span className="text-earth-300">Spectral Rolloff</span>
                <span className="font-semibold text-accent-blue-500">{Math.round(song.analysis.spectralFeatures.spectralRolloffMean)} Hz</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                <span className="text-earth-300">Spectral Bandwidth</span>
                <span className="font-semibold text-accent-blue-500">{Math.round(song.analysis.spectralFeatures.spectralBandwidthMean)} Hz</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                <span className="text-earth-300">Zero Crossing Rate</span>
                <span className="font-semibold text-earth-100">{song.analysis.spectralFeatures.zeroCrossingRateMean.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
