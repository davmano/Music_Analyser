const express = require('express');
const { body, validationResult } = require('express-validator');
const Arrangement = require('../models/Arrangement');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, [
  body('name').isLength({ min: 1, max: 200 }).trim().escape(),
  body('songId').isMongoId(),
  body('description').optional().isLength({ max: 1000 }).trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, songId, sections, isPublic, tags } = req.body;

    const song = await Song.findOne({
      _id: songId,
      uploadedBy: req.user.userId
    });

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const suggestions = generateArrangementSuggestions(song.analysis);

    const arrangement = new Arrangement({
      name,
      description: description || '',
      song: songId,
      createdBy: req.user.userId,
      sections: sections || song.analysis.sections.map((section, index) => ({
        id: `section-${index}`,
        startTime: section.startTime,
        endTime: section.endTime,
        sectionType: section.sectionType,
        customName: section.sectionType,
        notes: '',
        order: index
      })),
      suggestions,
      isPublic: isPublic || false,
      tags: tags || []
    });

    await arrangement.save();

    const populatedArrangement = await Arrangement.findById(arrangement._id)
      .populate('song', 'title artist analysis')
      .populate('createdBy', 'username');

    res.status(201).json({
      message: 'Arrangement created successfully',
      arrangement: populatedArrangement
    });

  } catch (error) {
    console.error('Create arrangement error:', error);
    res.status(500).json({ error: 'Error creating arrangement' });
  }
});

function generateArrangementSuggestions(analysis) {
  const suggestions = [];

  if (analysis.tempo > 120) {
    suggestions.push({
      type: 'tempo',
      description: 'Consider adding a breakdown section to create dynamic contrast',
      confidence: 0.7
    });
  }

  if (analysis.energy > 0.7) {
    suggestions.push({
      type: 'energy',
      description: 'High energy detected - consider adding a quiet bridge for contrast',
      confidence: 0.8
    });
  }

  if (analysis.sections.length < 4) {
    suggestions.push({
      type: 'structure',
      description: 'Simple structure detected - consider adding a pre-chorus or bridge',
      confidence: 0.6
    });
  }

  const hasIntro = analysis.sections.some(s => s.sectionType === 'intro');
  if (!hasIntro) {
    suggestions.push({
      type: 'structure',
      description: 'Consider adding an intro section to build anticipation',
      confidence: 0.5
    });
  }

  if (analysis.danceability > 0.6) {
    suggestions.push({
      type: 'arrangement',
      description: 'High danceability - consider extending the chorus sections',
      confidence: 0.7
    });
  }

  return suggestions;
}

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const arrangements = await Arrangement.find({ createdBy: req.user.userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('song', 'title artist')
      .populate('createdBy', 'username');

    const total = await Arrangement.countDocuments({ createdBy: req.user.userId });

    res.json({
      arrangements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get arrangements error:', error);
    res.status(500).json({ error: 'Error fetching arrangements' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const arrangement = await Arrangement.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    })
    .populate('song', 'title artist analysis')
    .populate('createdBy', 'username');

    if (!arrangement) {
      return res.status(404).json({ error: 'Arrangement not found' });
    }

    res.json({ arrangement });
  } catch (error) {
    console.error('Get arrangement error:', error);
    res.status(500).json({ error: 'Error fetching arrangement' });
  }
});

router.put('/:id', auth, [
  body('name').optional().isLength({ min: 1, max: 200 }).trim().escape(),
  body('description').optional().isLength({ max: 1000 }).trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, sections, isPublic, tags } = req.body;

    const arrangement = await Arrangement.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!arrangement) {
      return res.status(404).json({ error: 'Arrangement not found' });
    }

    if (name) arrangement.name = name;
    if (description !== undefined) arrangement.description = description;
    if (sections) arrangement.sections = sections;
    if (isPublic !== undefined) arrangement.isPublic = isPublic;
    if (tags) arrangement.tags = tags;

    await arrangement.save();

    const updatedArrangement = await Arrangement.findById(arrangement._id)
      .populate('song', 'title artist analysis')
      .populate('createdBy', 'username');

    res.json({
      message: 'Arrangement updated successfully',
      arrangement: updatedArrangement
    });

  } catch (error) {
    console.error('Update arrangement error:', error);
    res.status(500).json({ error: 'Error updating arrangement' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const arrangement = await Arrangement.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!arrangement) {
      return res.status(404).json({ error: 'Arrangement not found' });
    }

    res.json({ message: 'Arrangement deleted successfully' });
  } catch (error) {
    console.error('Delete arrangement error:', error);
    res.status(500).json({ error: 'Error deleting arrangement' });
  }
});

module.exports = router;
