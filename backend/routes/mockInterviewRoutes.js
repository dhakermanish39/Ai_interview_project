const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { chat } = require('../controllers/mockInterviewController');

router.post('/chat', auth, chat);

module.exports = router;