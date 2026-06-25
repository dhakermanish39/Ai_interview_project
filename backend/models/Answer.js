const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  session_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'InterviewSession', 
    required: true 
  },
  answer_text: { 
    type: String, 
    default: '' 
  },
  score: { 
    type: Number, 
    default: 0 
  },
  strong_points: [String],
  missing_points: [String],
  better_answer: { 
    type: String, 
    default: null 
  },

  // MCQ specific fields
  is_mcq: { 
    type: Boolean, 
    default: false 
  },
  is_correct: { 
    type: Boolean, 
    default: null 
  },
  your_option: { 
    type: String, 
    default: '' 
  },
  correct_option_text: { 
    type: String, 
    default: '' 
  },

  submitted_at: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Answer', answerSchema);