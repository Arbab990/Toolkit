const Assessment = require('../models/Assessment');
const Site = require('../models/Site');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Save/Update assessment data
// @route   POST /api/assessments
// @access  Private
exports.saveAssessment = asyncHandler(async (req, res, next) => {
  const { siteId, toolNumber, data, isCompleted, rating } = req.body;

  let assessment = await Assessment.findOne({
    user: req.user.id,
    site: siteId,
    toolNumber: toolNumber
  });

  if (assessment) {
    assessment.data = data;
    assessment.isCompleted = isCompleted || false;
    assessment.rating = rating;
    assessment.updatedAt = Date.now();
    await assessment.save();
  } else {
    assessment = await Assessment.create({
      user: req.user.id,
      site: siteId,
      toolNumber,
      data,
      isCompleted,
      rating
    });
  }

  // Calculate progress for the site
  const completedAssessments = await Assessment.countDocuments({
    user: req.user.id,
    site: siteId
  });

  const totalTools = 12;
  const progress = Number(((completedAssessments / totalTools) * 100).toFixed(2));
  
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  await Site.findByIdAndUpdate(siteId, {
    progress: progress,
    lastAssessment: dateStr
  });

  res.status(200).json({
    success: true,
    data: assessment
  });
});

// @desc    Get assessment data for a site and tool
// @route   GET /api/assessments/:siteId/:toolNumber
// @access  Private
exports.getAssessment = asyncHandler(async (req, res, next) => {
  const assessment = await Assessment.findOne({
    user: req.user.id,
    site: req.params.siteId,
    toolNumber: req.params.toolNumber
  });

  res.status(200).json({
    success: true,
    data: assessment ? assessment.data : null,
    isCompleted: assessment ? assessment.isCompleted : false,
    rating: assessment ? assessment.rating : null
  });
});
