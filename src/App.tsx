import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { FileUpload } from './components/FileUpload';
import { TrackSeparator } from './components/TrackSeparator';
export function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [separatedTracks, setSeparatedTracks] = useState(null);
  const handleFileUpload = file => {
    setUploadedFile(file);
    setIsProcessing(true);
    setTimeout(() => {
      setSeparatedTracks({
        vocals: {
          name: 'Vocals',
          volume: 100,
          muted: false
        },
        drums: {
          name: 'Drums',
          volume: 100,
          muted: false
        },
        bass: {
          name: 'Bass',
          volume: 100,
          muted: false
        },
        other: {
          name: 'Other',
          volume: 100,
          muted: false
        }
      });
      setIsProcessing(false);
    }, 3000);
  };
  const SplitterContent = () => !uploadedFile ? <FileUpload onFileUpload={handleFileUpload} /> : <TrackSeparator file={uploadedFile} isProcessing={isProcessing} separatedTracks={separatedTracks} onReset={() => {
    setUploadedFile(null);
    setSeparatedTracks(null);
  }} />;
  return <BrowserRouter>
      <div className="bg-gray-100 min-h-screen w-full">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/split" element={<SplitterContent />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>;
}