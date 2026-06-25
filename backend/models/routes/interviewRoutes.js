const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  startSession,
  submitAnswer,
  getResult,
  getHistory
} = require('../controllers/interviewController');

router.post('/start', auth, startSession);
router.post('/answer', auth, submitAnswer);
router.get('/result/:sessionId', auth, getResult);
router.get('/history', auth, getHistory);

module.exports = router;