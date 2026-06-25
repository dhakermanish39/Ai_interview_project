const mongoose = require('mongoose');
console.log('Defining Question schema with fields: session_id, question_text, question_type, difficulty, order_index');

const questionSchema = new mongoose.Schema({
  session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession', required: true },
  question_text: { type: String, required: true },
  question_type: { type: String, enum: ['technical', 'hr', 'project', 'aptitude'] },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  type: { type: String, enum: ['text', 'mcq'], default: 'text' },
  options: [String],
  correct_option: Number,
  tags: [String],
  order_index: Number
});
console.log('Question schema defined successfully');
module.exports = mongoose.model('Question', questionSchema);