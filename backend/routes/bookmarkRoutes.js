const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addBookmark, getBookmarks, deleteBookmark } = require('../controllers/bookmarkController');

router.post('/', auth, addBookmark);
router.get('/', auth, getBookmarks);
router.delete('/:id', auth, deleteBookmark);

module.exports = router;