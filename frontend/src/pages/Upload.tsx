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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Song</h1>
        <p className="text-gray-600">
          Upload an audio file to get advanced AI-powered analysis and arrangement suggestions
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-8">
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                <UploadIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop your audio file here' : 'Drag & drop your audio file here'}
                </p>
                <p className="text-gray-600 mb-4">
                  or click to browse files
                </p>
                <p className="text-sm text-gray-500">
                  Supports MP3, WAV, FLAC, M4A (max 50MB)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <FileAudio className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Song Title *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter song title"
                />
              </div>

              <div>
                <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-2">
                  Artist (Optional)
                </label>
                <input
                  id="artist"
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter artist name"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Music className="h-5 w-5" />
                    <span>Upload & Analyze</span>
                  </>
                )}
              </button>
            </form>

            {uploading && (
              <div className="text-center text-sm text-gray-600">
                <p>This may take a few moments while we analyze your audio...</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Advanced audio analysis using AI-powered Librosa</li>
          <li>• Detection of song structure (intro, verse, chorus, bridge, outro)</li>
          <li>• Musical feature extraction (tempo, key, energy, danceability)</li>
          <li>• AI-generated arrangement suggestions</li>
          <li>• Interactive timeline for manual editing</li>
        </ul>
      </div>
    </div>
  )
}
