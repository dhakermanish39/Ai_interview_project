const InterviewSession = require('../models/InterviewSession');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Resume = require('../models/Resume');
const UserGoal = require('../models/UserGoal');
/*const { generateQuestions, evaluateAnswer } = require('../services/gemini');*/
const { generateQuestions, evaluateAnswer } = require('../services/groq');
const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  const d = new Date(date);
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};
// Generate Questions + Start Session
exports.startSession = async (req, res) => {
  try {
    const { session_type, role, topic, difficulty, count } = req.body;
    const { include_mcq } = req.body;
    console.log('Starting session for user:', req.user.email, 'Session type:', session_type, 'Role:', role);

    // Resume se skills lo agar resume-based hai
    let skills = [];
    if (session_type === 'resume') {
      console.log('Generating questions based on resume for user:', req.user.email);
      const resume = await Resume.findOne({ user_id: req.user.id });
      if (!resume) return res.status(400).json({ message: 'Please upload resume first' });
      skills = resume.skills;
    }

    // AI se questions generate karo
    const aiQuestions = await generateQuestions({
      role: role || 'Software Developer',
      skills,
      difficulty: difficulty || 'medium',
      session_type,
      count: count || 10,
      include_mcq: include_mcq || false
    });
    console.log('Generated questions for user:', req.user.email, 'Questions count:', aiQuestions.length);

    // Session create karo
    const session = await InterviewSession.create({
      user_id: req.user.id,
      session_type,
      role,
      topic,
      difficulty: difficulty || 'medium',
      total_questions: aiQuestions.length,
      status: 'active'
    });

    // Questions save karo
    const questions = await Question.insertMany(
      aiQuestions.map((q, index) => ({
        session_id: session._id,
        question_text: q.question_text,
        question_type: q.question_type,
        difficulty: q.difficulty || difficulty,
        type: q.type || 'text',
        options: q.options || [],
        correct_option: q.correct_option,
        tags: q.tags || [],
        order_index: index + 1
      }))
    );
    console.log('Questions saved to DB for user:', req.user.email, 'Session ID:', session._id);
    res.status(201).json({
      message: 'Session started',
      session_id: session._id,
      questions: questions.map(q => ({
        id: q._id,
        question_text: q.question_text,
        question_type: q.question_type,
        type: q.type,                // ← add karo
        options: q.options,
        order_index: q.order_index
      }))
    });

  } catch (err) {
    console.error('Error starting session:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Submit Answer + Evaluate
exports.submitAnswer = async (req, res) => {
  try {
    const { question_id, session_id, answer_text } = req.body;
    console.log('Submitting answer for user:', req.user.email, 'Question ID:', question_id);
    const question = await Question.findById(question_id);
    if (!question) return res.status(404).json({ message: 'Question not found' });


    // AI se evaluate karo
    let evaluation;

    // MCQ check
    if (question.type === 'mcq') {
  const selectedIndex = parseInt(answer_text);
  const isCorrect = selectedIndex === question.correct_option;
  const selectedOptionText = question.options[selectedIndex] || 'No answer selected';
  const correctOptionText = question.options[question.correct_option];

  evaluation = {
    score: isCorrect ? 10 : 0,
    strong_points: isCorrect ? ['✅ Correct answer!'] : [],
    missing_points: isCorrect ? [] : ['❌ Wrong answer selected'],
    better_answer: null,
    is_mcq: true,
    is_correct: isCorrect,
    your_option: selectedOptionText,
    correct_option_text: correctOptionText
  };
} else {
      // AI evaluation for text answers
      evaluation = await evaluateAnswer({
        question: question.question_text,
        answer: answer_text
      });

      // Answer save karo
      const answer = await Answer.create({
        question_id,
        session_id,
        user_id: req.user.id,
        answer_text,
        score: evaluation.score,
        strong_points: evaluation.strong_points,
        missing_points: evaluation.missing_points,
        better_answer: evaluation.better_answer
      });
      console.log('Answer evaluated and saved for user:', req.user.email, 'Question ID:', question_id, 'Score:', evaluation.score);
      const goal = await UserGoal.findOne({ user_id: req.user.id });
      if (goal) {
        if (!isToday(goal.last_reset)) {
          goal.today_count = 1;
          goal.last_reset = new Date();
        } else {
          goal.today_count += 1;
        }
        goal.last_practiced = new Date();
        await goal.save();
      }
    }

    res.json({
      message: 'Answer evaluated',
      evaluation: {
        score: evaluation.score,
        strong_points: evaluation.strong_points,
        missing_points: evaluation.missing_points,
        better_answer: evaluation.better_answer
      }
    });

  } catch (err) {
    console.error('Error submitting answer:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Complete Session + Final Result
exports.getResult = async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('Fetching results for user:', req.user.email, 'Session ID:', sessionId);
    const answers = await Answer.find({ session_id: sessionId })
      .populate('question_id', 'question_text question_type');

    if (!answers.length) {
      console.log('No answers found for session:', sessionId);
      return res.status(404).json({ message: 'No answers found for this session' });
    }

    // Average score calculate karo
    const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
    const avgScore = (totalScore / answers.length).toFixed(1);

    // Session update karo
    await InterviewSession.findByIdAndUpdate(sessionId, {
      total_score: avgScore,
      status: 'completed',
      completed_at: Date.now()
    });

    console.log('Session completed for user:', req.user.email, 'Session ID:', sessionId, 'Average Score:', avgScore);
    res.json({
      session_id: sessionId,
      total_questions: answers.length,
      average_score: avgScore,
      answers: answers.map(a => ({
        question: a.question_id.question_text,
        question_type: a.question_id.question_type,
        your_answer: a.answer_text,
        score: a.score,
        strong_points: a.strong_points,
        missing_points: a.missing_points,
        better_answer: a.better_answer
      }))
    });

  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// History
exports.getHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      user_id: req.user.id,
      status: 'completed'
    }).sort({ created_at: -1 });
    console.log('Fetching history for user:', req.user.email, 'Sessions found:', sessions.length);
    res.json(sessions);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};