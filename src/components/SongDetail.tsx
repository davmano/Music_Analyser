import React from 'react';
import { ArrowLeftIcon, MusicIcon } from 'lucide-react';
export function SongDetail({
  song,
  onBack
}) {
  // Function to determine which icon to display based on instrument
  const getInstrumentIcon = instrument => {
    if (instrument === 'Guitar') {
      return <div size={16} />;
    } else if (instrument === 'Piano') {
      return <div size={16} />;
    } else {
      return <MusicIcon size={16} />;
    }
  };
  // Difficulty color mapping
  const difficultyColor = {
    Beginner: 'bg-green-100 text-green-800',
    Intermediate: 'bg-yellow-100 text-yellow-800',
    Advanced: 'bg-red-100 text-red-800'
  };
  return <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img src={song.imageUrl} alt={`${song.title} by ${song.artist}`} className="w-full h-48 object-cover" />
        <button onClick={onBack} className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
          <ArrowLeftIcon size={20} />
        </button>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">{song.title}</h1>
          <p className="text-gray-600 text-xl">{song.artist}</p>
          <div className="mt-3 flex items-center space-x-4">
            <span className={`text-xs px-2 py-1 rounded-full ${difficultyColor[song.difficulty]}`}>
              {song.difficulty}
            </span>
            <div className="flex items-center space-x-2">
              {song.instruments.map(instrument => <div key={instrument} className="flex items-center space-x-1">
                  {getInstrumentIcon(instrument)}
                  <span className="text-xs">{instrument}</span>
                </div>)}
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Arrangement</h2>
          <div className="space-y-4">
            {song.arrangement.verses.map((verse, index) => <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{verse.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {verse.chords.map((chord, chordIndex) => <div key={chordIndex} className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded-md font-mono">
                      {chord}
                    </div>)}
                </div>
              </div>)}
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-medium mb-2">Playing Tips</h3>
          <p className="text-gray-700">
            Practice transitioning between chords smoothly. Focus on rhythm and
            timing. For best results, start slow and gradually increase your
            tempo as you get comfortable.
          </p>
        </div>
      </div>
    </div>;
}