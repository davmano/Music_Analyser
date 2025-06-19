import React from 'react';
import { Link } from 'react-router-dom';
import { Music2Icon, SplitIcon, DownloadIcon } from 'lucide-react';
export function HomePage() {
  return <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-700 to-purple-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Separate Any Song Into Individual Tracks
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-purple-100">
            Extract vocals, drums, bass, and more from any song with AI-powered
            precision
          </p>
          <Link to="/split" className="inline-flex items-center bg-white text-purple-700 px-8 py-3 rounded-full text-lg font-semibold hover:bg-purple-100 transition-colors">
            <Music2Icon className="mr-2" />
            Start Splitting
          </Link>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Professional-Grade Audio Separation
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <div size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Isolate Vocals</h3>
              <p className="text-gray-600">
                Extract clean vocals for karaoke, remixes, or vocal training
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <div size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Separate Drums</h3>
              <p className="text-gray-600">
                Isolate drum tracks for practice, sampling, or remixing
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <div size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Extract Instruments
              </h3>
              <p className="text-gray-600">
                Separate bass, guitars, and other instruments with clarity
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Three Simple Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Song</h3>
              <p className="text-center text-gray-600">
                Upload any audio file in MP3 or WAV format
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
              <p className="text-center text-gray-600">
                Our AI separates the audio into individual tracks
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Download Tracks</h3>
              <p className="text-center text-gray-600">
                Download separated tracks in high quality
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-purple-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Split Your First Track?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Start separating your music into individual tracks today
          </p>
          <Link to="/split" className="inline-flex items-center bg-white text-purple-700 px-8 py-3 rounded-full text-lg font-semibold hover:bg-purple-100 transition-colors">
            <SplitIcon className="mr-2" />
            Try It Now
          </Link>
        </div>
      </section>
    </div>;
}