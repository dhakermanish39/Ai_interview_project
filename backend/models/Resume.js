const mongoose = require('mongoose');
console.log('Defining Resume schema with fields: user_id, file_url, original_filename, parsed_text, skills, projects, education, experience, uploaded_at');
const resumeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  file_url: { type: String },
  original_filename: { type: String },
  parsed_text: { type: String },
  skills: [String],
  projects: [
    {
      name: String,
      description: String,
      tech_used: [String]
    }
  ],
  education: [
    {
      degree: String,
      college: String,
      year: String
    }
  ],
  experience: [
    {
      company: String,
      role: String,
      duration: String
    }
  ],
  uploaded_at: { type: Date, default: Date.now }
});
console.log('Resume schema defined successfully');
module.exports = mongoose.model('Resume', resumeSchema);