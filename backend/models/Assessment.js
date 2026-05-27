const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  toolNumber: {
    type: Number,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  rating: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one assessment per user/site/tool
AssessmentSchema.index({ user: 1, site: 1, toolNumber: 1 }, { unique: true });

module.exports = mongoose.model('Assessment', AssessmentSchema);
