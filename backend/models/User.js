const mongoose = require('mongoose');
console.log('Defining User schema with fields: name, email, password_hash, target_role, college, experience_level, created_at');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  password_hash: { type: String, required: true },
  target_role: { type: String, default: '' },
  college: { type: String, default: '' },
  experience_level: {
    type: String,
    enum: ['fresher', '1-2 years', '2+ years'],
    default: 'fresher'
  },
  created_at: { type: Date, default: Date.now }
});
console.log('User schema defined successfully');
module.exports = mongoose.model('User', userSchema);