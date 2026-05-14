const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Site name is required'],
      trim: true,
    },
    siteUrl: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    description: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: 'Natural',
    },
    country: {
      type: String,
    },
    lastAssessment: {
      type: String,
      default: 'Not assessed',
    },
    progress: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: 'Not Assessed',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Site', siteSchema);
