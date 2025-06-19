import React from 'react';
import { Volume2, VolumeX, RotateCcw, Download, Loader } from 'lucide-react';
export function TrackSeparator({
  file,
  isProcessing,
  separatedTracks,
  onReset
}) {
  return <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">{file.name}</h2>
            <p className="text-gray-500 text-sm">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <button onClick={onReset} className="text-gray-500 hover:text-gray-700 p-2">
            <RotateCcw size={20} />
          </button>
        </div>
        {isProcessing ? <div className="text-center py-12">
            <Loader size={48} className="animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-lg font-medium">Separating tracks...</p>
            <p className="text-gray-500">This may take a few minutes</p>
          </div> : separatedTracks ? <div className="space-y-4">
            {Object.entries(separatedTracks).map(([key, track]) => <div key={key} className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
                <div className="w-32 font-medium">{track.name}</div>
                <div className="flex-1">
                  <div className="text-purple-600 w-full" size={32} />
                </div>
                <div className="flex items-center space-x-4">
                  <button className="text-gray-600 hover:text-gray-800">
                    {track.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input type="range" min="0" max="100" value={track.volume} className="w-24" />
                  <button className="text-gray-600 hover:text-gray-800">
                    <Download size={20} />
                  </button>
                </div>
              </div>)}
            <div className="mt-6 flex justify-end">
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                <Download size={20} />
                <span>Export All Tracks</span>
              </button>
            </div>
          </div> : null}
      </div>
    </div>;
}