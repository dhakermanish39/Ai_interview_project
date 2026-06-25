const mongoose = require('mongoose');
console.log('Defining InterviewSession schema with fields: user_id, session_type, role, topic, difficulty, total_questions, total_score, status, created_at, completed_at');
const interviewSessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session_type: {
    type: String,
    enum: ['resume', 'role', 'topic', 'hr', 'aptitude', 'mock'],
    required: true
  },
  role: String,
  topic: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  total_questions: { type: Number, default: 0 },
  total_score: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  created_at: { type: Date, default: Date.now },
  completed_at: Date
});
console.log('InterviewSession schema defined successfully');
module.exports = mongoose.model('InterviewSession', interviewSessionSchema);