const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getStudyTips } = require('../controllers/studyTipsController');

router.get('/', auth, getStudyTips);

module.exports = router;