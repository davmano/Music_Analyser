const mongoose = require('mongoose');

const arrangementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sections: [{
    id: String,
    startTime: Number,
    endTime: Number,
    sectionType: String,
    customName: String,
    notes: String,
    order: Number
  }],
  suggestions: [{
    type: String,
    description: String,
    confidence: Number,
    applied: {
      type: Boolean,
      default: false
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

arrangementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Arrangement', arrangementSchema);
