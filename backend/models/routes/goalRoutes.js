const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getGoal, setGoal, incrementCount } = require('../controllers/goalController');

router.get('/', auth, getGoal);
router.put('/', auth, setGoal);
router.post('/increment', auth, incrementCount);

module.exports = router;