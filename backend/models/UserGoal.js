const mongoose = require('mongoose');

const userGoalSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  daily_goal: { type: Number, default: 5 }, // kitne questions roz
  streak: { type: Number, default: 0 },
  last_practiced: { type: Date, default: null },
  today_count: { type: Number, default: 0 },
  last_reset: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserGoal', userGoalSchema);