const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

// Question Generation
const generateQuestions = async ({ role, skills, difficulty, session_type, count = 10 }) => {
  let prompt = '';

  if (session_type === 'resume') {
    prompt = `Generate ${count} interview questions for a candidate applying for ${role} role.
Their skills from resume: ${skills.join(', ')}.
Difficulty level: ${difficulty}.
Include mix of: technical questions, project-based questions, and 2 HR questions.
Return ONLY a JSON array like this (no extra text):
[
  { "question_text": "...", "question_type": "technical", "difficulty": "${difficulty}" },
  { "question_text": "...", "question_type": "hr", "difficulty": "easy" }
]`;
  } else if (session_type === 'hr') {
    prompt = `Generate ${count} HR interview questions for a fresher applying for ${role} role.
Return ONLY a JSON array:
[
  { "question_text": "...", "question_type": "hr", "difficulty": "${difficulty}" }
]`;
  } else {
    prompt = `Generate ${count} ${session_type} interview questions for ${role} role.
Difficulty: ${difficulty}.
Return ONLY a JSON array:
[
  { "question_text": "...", "question_type": "technical", "difficulty": "${difficulty}" }
]`;
  }

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // JSON extract karo response se
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Invalid AI response format');

  return JSON.parse(jsonMatch[0]);
};

// Answer Evaluation
const evaluateAnswer = async ({ question, answer }) => {
  const prompt = `You are an interview evaluator.
Question: "${question}"
Candidate's Answer: "${answer}"

Evaluate this answer and return ONLY a JSON object (no extra text):
{
  "score": <number 0-10>,
  "strong_points": ["point1", "point2"],
  "missing_points": ["point1", "point2"],
  "better_answer": "A ideal sample answer in 3-4 lines"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response format');

  return JSON.parse(jsonMatch[0]);
};

module.exports = { generateQuestions, evaluateAnswer };