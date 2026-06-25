const Resume = require('../models/Resume');
const { parseResume } = require('../services/resumeParser');
const fs = require('fs');

// Upload Resume
exports.uploadResume = async (req, res) => {
  try {
    console.log('User uploading resume:', req.user.email);
    if (!req.file) {
      console.log('No file uploaded by user:', req.user.email);
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileUrl = `/uploads/${req.file.filename}`;

    // Parse PDF
    const parsed = await parseResume(filePath);

    // Check if resume already exists for user — update karo
    let resume = await Resume.findOne({ user_id: req.user.id });

    if (resume) {
      console.log('Updating existing resume for user:', req.user.email);
      resume.file_url = fileUrl;
      resume.original_filename = req.file.originalname;
      resume.parsed_text = parsed.parsed_text;
      resume.skills = parsed.skills;
      resume.projects = parsed.projects;
      resume.education = parsed.education;
      resume.uploaded_at = Date.now();
      await resume.save();
    } else {
      console.log('Creating new resume entry for user:', req.user.email);
      resume = await Resume.create({
        user_id: req.user.id,
        file_url: fileUrl,
        original_filename: req.file.originalname,
        parsed_text: parsed.parsed_text,
        skills: parsed.skills,
        projects: parsed.projects,
        education: parsed.education
      });
    }
console.log('Resume processed for user:', req.user.email, 'Skills found:', parsed.skills.length, 'Projects found:', parsed.projects.length);
    res.status(201).json({
      message: 'Resume uploaded and parsed successfully',
      resume: {
        id: resume._id,
        file_url: resume.file_url,
        skills: resume.skills,
        projects: resume.projects,
        education: resume.education
      }
    });

  } catch (err) {
    console.error('Error uploading resume for user:', req.user.email, 'Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET Resume Data
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user_id: req.user.id });
    console.log('Fetching resume for user:', req.user.email, 'Resume found:', !!resume);
    if (!resume) {
      console.log('No resume found for user:', req.user.email);
      return res.status(404).json({ message: 'No resume found' });
    }
    console.log('Resume data sent for user:', req.user.email, 'Skills:', resume.skills.length, 'Projects:', resume.projects.length);
    res.json(resume);
  } catch (err) {
    console.error('Error fetching resume for user:', req.user.email, 'Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};