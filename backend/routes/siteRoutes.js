const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
  createSite,
  getSites,
  getSite,
  deleteSite,
} = require('../controllers/siteController');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.use(protect);

router.route('/')
  .get(getSites)
  .post(upload.array('images', 5), createSite);

router.route('/:id')
  .get(getSite)
  .delete(deleteSite);

module.exports = router;
