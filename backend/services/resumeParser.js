const pdfParse = require('pdf-parse/lib/pdf-parse.js');
const fs = require('fs');
console.log('PDF parser service initialized successfully');
// Common skills list for matching
const SKILLS_LIST = [
  'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'swift',
  'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
  'mongodb', 'mysql', 'postgresql', 'redis', 'firebase',
  'html', 'css', 'tailwind', 'bootstrap',
  'git', 'docker', 'aws', 'linux',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch',
  'rest api', 'graphql', 'typescript', 'next.js'
];

// Extract skills from text
const extractSkills = (text) => {
  const lowerText = text.toLowerCase();
  return SKILLS_LIST.filter(skill => lowerText.includes(skill));
};
console.log('Skill extraction function defined successfully');
// Extract education info
const extractEducation = (text) => {
  const education = [];
  const lines = text.split('\n');

  const degreeKeywords = ['b.tech', 'btech', 'b.e', 'bca', 'mca', 'm.tech', 'mtech', 'b.sc', 'mba', '12th', '10th'];

  lines.forEach(line => {
    const lower = line.toLowerCase();
    if (degreeKeywords.some(k => lower.includes(k))) {
      education.push({
        degree: line.trim(),
        college: '',
        year: ''
      });
    }
  });

  return education.slice(0, 3); // max 3 entries
};
console.log('Education extraction function defined successfully');
// Extract projects (basic)
const extractProjects = (text) => {
  const projects = [];
  const lines = text.split('\n');

  let inProjectSection = false;
  let currentProject = null;

  lines.forEach(line => {
    const lower = line.toLowerCase();

    if (lower.includes('project')) {
      inProjectSection = true;
    }

    if (inProjectSection && line.trim().length > 10) {
      if (currentProject === null) {
        currentProject = {
          name: line.trim(),
          description: '',
          tech_used: extractSkills(line)
        };
      } else {
        currentProject.description += line.trim() + ' ';
      }

      if (projects.length < 5 && currentProject.name) {
        projects.push(currentProject);
        currentProject = null;
      }
    }
  });

  return projects;
};

console.log('Project extraction function defined successfully');

// Main parser function
const parseResume = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  const text = pdfData.text;
console.log('Parsed resume text length:', text.length);
  return {
    parsed_text: text,
    skills: extractSkills(text),
    education: extractEducation(text),
    projects: extractProjects(text)
  };
};

console.log('Resume parsing function defined successfully');
module.exports = { parseResume };