const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadResume, getResume } = require('../controllers/resumeController');

router.post('/upload', auth, upload.single('resume'), uploadResume);
router.get('/', auth, getResume);

module.exports = router;