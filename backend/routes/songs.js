const express = require('express');
const multer = require('multer');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3, WAV, FLAC, and M4A files are allowed.'));
    }
  }
});

const AUDIO_SERVICE_URL = process.env.AUDIO_SERVICE_URL || 'http://localhost:8001';

router.post('/upload', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { title, artist } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname);

    const token = req.headers.authorization;

    const analysisResponse = await axios.post(
      `${AUDIO_SERVICE_URL}/analyze`,
      formData,
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000
      }
    );

    const analysis = analysisResponse.data;

    const song = new Song({
      title: title.trim(),
      artist: artist ? artist.trim() : '',
      filename: `${Date.now()}-${req.file.originalname}`,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.userId,
      analysis: {
        duration: analysis.duration,
        tempo: analysis.tempo,
        key: analysis.key,
        timeSignature: analysis.time_signature,
        energy: analysis.energy,
        danceability: analysis.danceability,
        sections: analysis.sections.map(section => ({
          startTime: section.start_time,
          endTime: section.end_time,
          sectionType: section.section_type,
          confidence: section.confidence
        })),
        spectralFeatures: {
          spectralCentroidMean: analysis.spectral_features.spectral_centroid_mean,
          spectralRolloffMean: analysis.spectral_features.spectral_rolloff_mean,
          spectralBandwidthMean: analysis.spectral_features.spectral_bandwidth_mean,
          zeroCrossingRateMean: analysis.spectral_features.zero_crossing_rate_mean
        },
        rhythmFeatures: {
          tempo: analysis.rhythm_features.tempo,
          beatCount: analysis.rhythm_features.beat_count,
          onsetCount: analysis.rhythm_features.onset_count,
          rhythmRegularity: analysis.rhythm_features.rhythm_regularity
        }
      }
    });

    await song.save();

    res.status(201).json({
      message: 'Song uploaded and analyzed successfully',
      song: {
        id: song._id,
        title: song.title,
        artist: song.artist,
        analysis: song.analysis,
        createdAt: song.createdAt
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Audio analysis service unavailable' 
      });
    }
    
    if (error.response && error.response.status === 400) {
      return res.status(400).json({ 
        error: error.response.data.detail || 'Invalid audio file' 
      });
    }

    res.status(500).json({ 
      error: 'Error processing audio file',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const songs = await Song.find({ uploadedBy: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'username');

    const total = await Song.countDocuments({ uploadedBy: req.user.userId });

    res.json({
      songs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get songs error:', error);
    res.status(500).json({ error: 'Error fetching songs' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findOne({
      _id: req.params.id,
      uploadedBy: req.user.userId
    }).populate('uploadedBy', 'username');

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json({ song });
  } catch (error) {
    console.error('Get song error:', error);
    res.status(500).json({ error: 'Error fetching song' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findOneAndDelete({
      _id: req.params.id,
      uploadedBy: req.user.userId
    });

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Delete song error:', error);
    res.status(500).json({ error: 'Error deleting song' });
  }
});

module.exports = router;
