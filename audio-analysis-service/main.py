from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import librosa
import numpy as np
import tempfile
import os
from typing import Dict, List, Optional
import logging
from pydantic import BaseModel
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Music Analysis Service",
    description="Advanced audio analysis using Librosa",
    version="1.0.0"
)

security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AudioAnalysisResult(BaseModel):
    duration: float
    tempo: float
    key: str
    time_signature: str
    energy: float
    danceability: float
    sections: List[Dict]
    spectral_features: Dict
    rhythm_features: Dict

class SectionInfo(BaseModel):
    start_time: float
    end_time: float
    section_type: str
    confidence: float

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=403, detail="Invalid authentication scheme")
    return credentials.credentials

def detect_key(y, sr):
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)
    key_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    key_idx = np.argmax(chroma_mean)
    return key_names[key_idx]

def detect_sections(y, sr):
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)
    
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    
    sections = []
    duration = len(y) / sr
    
    if duration < 30:
        sections.append({
            "start_time": 0.0,
            "end_time": duration,
            "section_type": "full_song",
            "confidence": 0.9
        })
    else:
        intro_end = min(duration * 0.1, 15.0)
        sections.append({
            "start_time": 0.0,
            "end_time": intro_end,
            "section_type": "intro",
            "confidence": 0.8
        })
        
        verse_start = intro_end
        verse_end = min(duration * 0.4, verse_start + 30)
        sections.append({
            "start_time": verse_start,
            "end_time": verse_end,
            "section_type": "verse",
            "confidence": 0.7
        })
        
        chorus_start = verse_end
        chorus_end = min(duration * 0.7, chorus_start + 25)
        sections.append({
            "start_time": chorus_start,
            "end_time": chorus_end,
            "section_type": "chorus",
            "confidence": 0.8
        })
        
        if duration > 120:
            bridge_start = chorus_end
            bridge_end = min(duration * 0.85, bridge_start + 20)
            sections.append({
                "start_time": bridge_start,
                "end_time": bridge_end,
                "section_type": "bridge",
                "confidence": 0.6
            })
            
            outro_start = bridge_end
        else:
            outro_start = chorus_end
            
        sections.append({
            "start_time": outro_start,
            "end_time": duration,
            "section_type": "outro",
            "confidence": 0.7
        })
    
    return sections

def calculate_spectral_features(y, sr):
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
    zero_crossing_rate = librosa.feature.zero_crossing_rate(y)[0]
    
    return {
        "spectral_centroid_mean": float(np.mean(spectral_centroids)),
        "spectral_rolloff_mean": float(np.mean(spectral_rolloff)),
        "spectral_bandwidth_mean": float(np.mean(spectral_bandwidth)),
        "zero_crossing_rate_mean": float(np.mean(zero_crossing_rate))
    }

def calculate_rhythm_features(y, sr):
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
    
    return {
        "tempo": float(tempo),
        "beat_count": len(beats),
        "onset_count": len(onset_frames),
        "rhythm_regularity": float(np.std(np.diff(beats)) if len(beats) > 1 else 0)
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "audio-analysis"}

@app.post("/analyze", response_model=AudioAnalysisResult)
async def analyze_audio(
    file: UploadFile = File(...),
    token: str = Depends(verify_token)
):
    if not file.filename.lower().endswith(('.mp3', '.wav', '.flac', '.m4a')):
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    if file.size and file.size > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        logger.info(f"Analyzing audio file: {file.filename}")
        
        y, sr = librosa.load(tmp_file_path, sr=None)
        
        duration = len(y) / sr
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        key = detect_key(y, sr)
        
        rms = librosa.feature.rms(y=y)[0]
        energy = float(np.mean(rms))
        
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        danceability = float(1.0 - (np.std(spectral_centroid) / np.mean(spectral_centroid)))
        danceability = max(0.0, min(1.0, danceability))
        
        sections = detect_sections(y, sr)
        spectral_features = calculate_spectral_features(y, sr)
        rhythm_features = calculate_rhythm_features(y, sr)
        
        result = AudioAnalysisResult(
            duration=float(duration),
            tempo=float(tempo),
            key=key,
            time_signature="4/4",
            energy=energy,
            danceability=danceability,
            sections=sections,
            spectral_features=spectral_features,
            rhythm_features=rhythm_features
        )
        
        os.unlink(tmp_file_path)
        
        logger.info(f"Analysis completed for {file.filename}")
        return result
        
    except Exception as e:
        if 'tmp_file_path' in locals():
            try:
                os.unlink(tmp_file_path)
            except:
                pass
        error_msg = str(e)
        logger.error(f"Error analyzing audio: {error_msg}")
        logger.error(f"Exception type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error analyzing audio: {error_msg}")

@app.get("/")
async def root():
    return {"message": "Music Analysis Service", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
