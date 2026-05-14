const Site = require('../models/Site');
const Assessment = require('../models/Assessment');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create new heritage site
// @route   POST /api/sites
// @access  Private
const createSite = asyncHandler(async (req, res) => {
  const { name, siteUrl, location, description, category, country } = req.body;

  let images = [];
  if (req.files) {
    images = req.files.map((file) => `/uploads/${file.filename}`);
  }

  const site = await Site.create({
    name,
    siteUrl,
    location,
    description,
    category,
    country,
    images,
    createdBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: site,
  });
});

// @desc    Get all heritage sites
// @route   GET /api/sites
// @access  Private
const getSites = asyncHandler(async (req, res) => {
  const sites = await Site.find({ createdBy: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: sites.length,
    data: sites,
  });
});

// @desc    Get single site
// @route   GET /api/sites/:id
// @access  Private
const getSite = asyncHandler(async (req, res) => {
  const site = await Site.findById(req.params.id);

  if (!site) {
    res.status(404);
    throw new Error('Site not found');
  }

  res.status(200).json({
    success: true,
    data: site,
  });
});

// @desc    Delete heritage site
// @route   DELETE /api/sites/:id
// @access  Private
const deleteSite = asyncHandler(async (req, res) => {
  const site = await Site.findById(req.params.id);

  if (!site) {
    res.status(404);
    throw new Error('Site not found');
  }

  // Check ownership
  if (site.createdBy.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to delete this site');
  }

  // Delete associated assessments
  await Assessment.deleteMany({ site: req.params.id });
  
  // Delete the site
  await site.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

module.exports = {
  createSite,
  getSites,
  getSite,
  deleteSite,
};
