const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  artist: {
    type: String,
    trim: true,
    maxlength: 200
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  analysis: {
    duration: Number,
    tempo: Number,
    key: String,
    timeSignature: String,
    energy: Number,
    danceability: Number,
    sections: [{
      startTime: Number,
      endTime: Number,
      sectionType: String,
      confidence: Number
    }],
    spectralFeatures: {
      spectralCentroidMean: Number,
      spectralRolloffMean: Number,
      spectralBandwidthMean: Number,
      zeroCrossingRateMean: Number
    },
    rhythmFeatures: {
      tempo: Number,
      beatCount: Number,
      onsetCount: Number,
      rhythmRegularity: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

songSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Song', songSchema);
