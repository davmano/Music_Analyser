import React, { useCallback } from 'react';
import { Upload, Music2Icon } from 'lucide-react';
export function FileUpload({
  onFileUpload
}) {
  const handleDragOver = useCallback(e => {
    e.preventDefault();
  }, []);
  const handleDrop = useCallback(e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      onFileUpload(file);
    }
  }, [onFileUpload]);
  const handleFileInput = useCallback(e => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      onFileUpload(file);
    }
  }, [onFileUpload]);
  return <div className="max-w-2xl mx-auto mt-10">
      <div className="border-4 border-dashed border-purple-200 rounded-lg p-12 text-center" onDragOver={handleDragOver} onDrop={handleDrop}>
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-purple-100 p-4 rounded-full">
            <Music2Icon size={48} className="text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Upload your audio file
            </h2>
            <p className="text-gray-500 mb-4">
              Drag and drop or click to select
            </p>
          </div>
          <label className="cursor-pointer">
            <input type="file" className="hidden" accept="audio/*" onChange={handleFileInput} />
            <div className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
              <Upload size={20} />
              <span>Select File</span>
            </div>
          </label>
          <p className="text-sm text-gray-400">
            Supports MP3, WAV, and other audio formats
          </p>
        </div>
      </div>
    </div>;
}