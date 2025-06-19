import React from 'react';
import { MusicIcon } from 'lucide-react';
export function SongList({
  songs,
  onSelectSong
}) {
  // Function to determine which icon to display based on primary instrument
  const getInstrumentIcon = instruments => {
    if (instruments.includes('Guitar')) {
      return <div size={16} />;
    } else if (instruments.includes('Piano')) {
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
  return <div>
      <h2 className="text-2xl font-bold mb-4">Songs ({songs.length})</h2>
      {songs.length === 0 ? <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">
            No songs found matching your criteria.
          </p>
        </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map(song => <div key={song.id} onClick={() => onSelectSong(song)} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <img src={song.imageUrl} alt={`${song.title} by ${song.artist}`} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-lg">{song.title}</h3>
                <p className="text-gray-600">{song.artist}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {getInstrumentIcon(song.instruments)}
                    <span className="text-xs text-gray-500">
                      {song.instruments.join(', ')}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${difficultyColor[song.difficulty]}`}>
                    {song.difficulty}
                  </span>
                </div>
              </div>
            </div>)}
        </div>}
    </div>;
}