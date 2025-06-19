import React, { useState } from 'react';
import { SearchIcon, FilterIcon } from 'lucide-react';
export function SearchBar({
  onSearch,
  onInstrumentFilter,
  onDifficultyFilter,
  currentInstrument,
  currentDifficulty
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };
  const instruments = ['', 'Guitar', 'Piano', 'Ukulele', 'Bass'];
  const difficulties = ['', 'Beginner', 'Intermediate', 'Advanced'];
  return <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <input type="text" placeholder="Search songs or artists..." value={searchTerm} onChange={handleSearchChange} className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <SearchIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="ml-3 p-3 bg-indigo-600 text-white rounded-lg flex items-center hover:bg-indigo-700 transition-colors">
          <FilterIcon size={18} />
          <span className="ml-2">Filters</span>
        </button>
      </div>
      {showFilters && <div className="bg-white p-4 rounded-lg shadow-md mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instrument
            </label>
            <select value={currentInstrument} onChange={e => onInstrumentFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {instruments.map(instrument => <option key={instrument} value={instrument}>
                  {instrument || 'All Instruments'}
                </option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select value={currentDifficulty} onChange={e => onDifficultyFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {difficulties.map(difficulty => <option key={difficulty} value={difficulty}>
                  {difficulty || 'All Levels'}
                </option>)}
            </select>
          </div>
        </div>}
    </div>;
}