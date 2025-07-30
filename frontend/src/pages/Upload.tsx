import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Upload as UploadIcon, Music, FileAudio, X, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()
  const { token } = useAuthStore()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, "")
      setTitle(fileName)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024
  })

  const removeFile = () => {
    setFile(null)
    setTitle('')
    setArtist('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast.error('Please select an audio file')
      return
    }

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('audio', file)
      formData.append('title', title.trim())
      if (artist.trim()) {
        formData.append('artist', artist.trim())
      }

      const response = await axios.post(`${API_URL}/api/songs/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 120000
      })

      toast.success('Song uploaded and analyzed successfully!')
      navigate(`/analysis/${response.data.song.id}`)
    } catch (error: any) {
      console.error('Upload error:', error)
      if (error.response?.status === 413) {
        toast.error('File too large. Maximum size is 50MB.')
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.error || 'Invalid file format')
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Upload timeout. Please try again.')
      } else {
        toast.error(error.response?.data?.error || 'Upload failed. Please try again.')
      }
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient mb-4">Upload Your Song</h1>
          <p className="text-lg text-earth-300">
            Upload an audio file to get advanced AI-powered analysis and arrangement suggestions
          </p>
        </div>

        <div className="card p-8 animate-slide-up">
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-accent-blue-500 bg-accent-blue-500/10 shadow-glow-blue'
                  : 'border-dark-500 hover:border-accent-purple-500 hover:bg-accent-purple-500/5 hover:shadow-glow-purple'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-6">
                <div className="animate-bounce-gentle">
                  <UploadIcon className="h-16 w-16 text-accent-blue-500" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-earth-100 mb-3">
                    {isDragActive ? 'Drop your audio file here' : 'Drag & drop your audio file here'}
                  </p>
                  <p className="text-accent-green-500 font-medium mb-6">
                    or click to browse files
                  </p>
                  <div className="inline-flex items-center space-x-2 bg-dark-700 px-4 py-2 rounded-lg border border-dark-500">
                    <Music className="h-4 w-4 text-gold-500" />
                    <span className="text-sm text-earth-300">
                      Supports MP3, WAV, FLAC, M4A (max 50MB)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="card p-6 border-accent-green-500/30 bg-gradient-to-r from-dark-800 to-dark-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-accent-blue-500/20 rounded-lg">
                      <FileAudio className="h-8 w-8 text-accent-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-earth-100 text-lg">{file.name}</p>
                      <p className="text-earth-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 text-earth-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gold-500 mb-3">
                    Song Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter song title"
                  />
                </div>

                <div>
                  <label htmlFor="artist" className="block text-sm font-semibold text-gold-500 mb-3">
                    Artist (Optional)
                  </label>
                  <input
                    id="artist"
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter artist name"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className={`w-full btn-primary text-lg py-4 flex items-center justify-center ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin mr-3" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-6 w-6 mr-3" />
                      <span>Upload & Analyze</span>
                    </>
                  )}
                </button>
              </form>

              {uploading && (
                <div className="text-center p-4 bg-accent-blue-500/10 rounded-lg border border-accent-blue-500/20">
                  <Music className="h-6 w-6 text-accent-blue-500 mx-auto mb-2 animate-pulse" />
                  <p className="text-accent-blue-500 font-medium">
                    This may take a few moments while we analyze your audio...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card p-8 mt-8 animate-slide-up">
          <h3 className="text-xl font-bold text-gold-500 mb-6 flex items-center">
            <Music className="h-6 w-6 mr-2" />
            What happens next?
          </h3>
          <ul className="space-y-3 text-earth-300">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent-blue-500 rounded-full"></div>
              <span>Advanced audio analysis using AI-powered Librosa</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent-green-500 rounded-full"></div>
              <span>Detection of song structure (intro, verse, chorus, bridge, outro)</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent-purple-500 rounded-full"></div>
              <span>Musical feature extraction (tempo, key, energy, danceability)</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gold-500 rounded-full"></div>
              <span>AI-generated arrangement suggestions</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-silver-500 rounded-full"></div>
              <span>Interactive timeline for manual editing</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
