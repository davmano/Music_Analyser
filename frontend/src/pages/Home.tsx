import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Music, Zap, BarChart3, Users, ArrowRight } from 'lucide-react'

export default function Home() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI-Powered Music Analysis
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Upload your songs and get intelligent arrangement suggestions based on advanced 
          audio analysis. Discover song structure, timing, and musical insights with cutting-edge AI.
        </p>
        <div className="flex justify-center space-x-4">
          {isAuthenticated ? (
            <Link
              to="/upload"
              className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <span>Start Analyzing</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 py-16">
        <div className="text-center p-6">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Advanced Audio Analysis</h3>
          <p className="text-gray-600">
            Upload MP3 or WAV files to detect intros, verses, choruses, bridges, and more using 
            state-of-the-art Librosa analysis.
          </p>
        </div>

        <div className="text-center p-6">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-3">AI + Manual Workflow</h3>
          <p className="text-gray-600">
            Get AI-generated arrangement suggestions combined with intuitive manual editing 
            tools for complete creative control.
          </p>
        </div>

        <div className="text-center p-6">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Timeline Breakdown</h3>
          <p className="text-gray-600">
            View your song's structure section-by-section in a clean, interactive timeline 
            interface with detailed musical insights.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          For Musicians, Producers & Arrangers
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Whether you're a singer looking to understand song structure, a producer seeking 
          arrangement ideas, or an arranger exploring new possibilities, our AI-powered 
          analysis provides the insights you need.
        </p>
        <div className="flex justify-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}
