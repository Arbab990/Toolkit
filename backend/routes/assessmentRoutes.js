const express = require('express');
const { saveAssessment, getAssessment } = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', saveAssessment);
router.get('/:siteId/:toolNumber', getAssessment);

module.exports = router;
