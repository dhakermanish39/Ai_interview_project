const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
console.log('Groq client initialized successfully');
const generateQuestions = async ({ role, skills, difficulty, session_type, count = 10, include_mcq = false }) => {
  
  let prompt;

  if (include_mcq) {
    // Sare MCQ
    prompt = `Generate exactly ${count} MCQ (Multiple Choice Questions) for ${role} role interview.
Skills: ${skills.join(', ') || 'General Programming'}.
Difficulty: ${difficulty}.

Every single question MUST be MCQ type with exactly 4 options.

Return ONLY a valid JSON array, no extra text, no markdown:
[
  {
    "question_text": "Which of the following is used to manage state in React?",
    "question_type": "technical",
    "difficulty": "${difficulty}",
    "type": "mcq",
    "options": ["useEffect", "useState", "useContext", "useRef"],
    "correct_option": 1,
    "tags": ["react", "state"]
  }
]

Generate exactly ${count} questions like this. ALL must have type: "mcq" and exactly 4 options.`;

  } else {
    // Sare text questions
    prompt = `Generate exactly ${count} interview questions for ${role} role.
Skills: ${skills.join(', ') || 'General Programming'}.
Difficulty: ${difficulty}. Session type: ${session_type}.

Return ONLY a valid JSON array:
[
  {
    "question_text": "...",
    "question_type": "technical",
    "difficulty": "${difficulty}",
    "type": "text",
    "options": [],
    "correct_option": null,
    "tags": ["tag1"]
  }
]`;
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  const text = response.choices[0].message.content;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Invalid AI response');
  return JSON.parse(jsonMatch[0]);
};
const evaluateAnswer = async ({ question, answer }) => {
  const prompt = `You are an interview evaluator.
Question: "${question}"
Candidate Answer: "${answer}"
Return ONLY a JSON object:
{
  "score": <0-10>,
  "strong_points": ["..."],
  "missing_points": ["..."],
  "better_answer": "..."
}`;
console.log('Sending prompt to Groq for answer evaluation:', prompt);
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  const text = response.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response');
  return JSON.parse(jsonMatch[0]);
};
console.log('Groq service functions defined successfully');

const generateStudyTips = async ({ weakAreas, missingPoints }) => {
  const prompt = `You are an interview coach. Based on the candidate's weak areas and missing points, give 5 specific, actionable study tips.

Weak areas: ${weakAreas.map(a => `${a.type} (avg score: ${a.avg}/10)`).join(', ')}
Common missing points: ${missingPoints.join(', ')}

Return ONLY a JSON array:
[
  {
    "topic": "Topic name",
    "tip": "Specific actionable tip in 2-3 lines",
    "resources": "What to study or practice",
    "priority": "high/medium/low"
  }
]`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  const text = response.choices[0].message.content;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  return JSON.parse(jsonMatch[0]);
};

const mockInterviewChat = async (messages) => {
  const systemPrompt = `You are a professional technical interviewer conducting a real job interview. 
Your behavior:
- Start by greeting the candidate and asking them to introduce themselves
- Ask ONE question at a time
- After candidate answers, give brief feedback (1-2 lines) then ask next question
- Ask follow-up questions based on their answers
- Cover technical skills, projects, and HR questions naturally
- After 8-10 exchanges, conclude the interview professionally
- Give a final overall feedback at the end with score out of 10

Keep responses concise and conversational. Be encouraging but professional.
Always respond in this JSON format:
{
  "message": "your response as interviewer",
  "type": "question/feedback/conclusion",
  "score": null or number (only at conclusion)
}`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: 0.8
  });

  const text = response.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { message: text, type: 'question', score: null };
  return JSON.parse(jsonMatch[0]);
};

module.exports = { generateQuestions, evaluateAnswer, generateStudyTips, mockInterviewChat };