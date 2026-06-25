const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question_text: { type: String, required: true },
  question_type: String,
  session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession' },
  note: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);