const Bookmark = require('../models/Bookmark');

exports.addBookmark = async (req, res) => {
  try {
    const { question_text, question_type, session_id } = req.body;
    const existing = await Bookmark.findOne({ user_id: req.user.id, question_text });
    if (existing) return res.status(400).json({ message: 'Already bookmarked' });

    const bookmark = await Bookmark.create({
      user_id: req.user.id, question_text, question_type, session_id
    });
    res.status(201).json({ message: 'Bookmarked!', bookmark });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteBookmark = async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};