const InterviewSession = require('../models/InterviewSession');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Resume = require('../models/Resume');
const { generateQuestions, evaluateAnswer } = require('../services/groq');

const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  const d = new Date(date);
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

// Start Session
exports.startSession = async (req, res) => {
  try {
    const { session_type, role, topic, difficulty, count, include_mcq } = req.body;

    let skills = [];
    if (session_type === 'resume') {
      const resume = await Resume.findOne({ user_id: req.user.id });
      if (!resume) return res.status(400).json({ message: 'Please upload resume first' });
      skills = resume.skills;
    }

    const aiQuestions = await generateQuestions({
      role: role || 'Software Developer',
      skills,
      difficulty: difficulty || 'medium',
      session_type,
      count: count || 10,
      include_mcq: include_mcq || false
    });

    const session = await InterviewSession.create({
      user_id: req.user.id,
      session_type,
      role,
      topic,
      difficulty: difficulty || 'medium',
      total_questions: aiQuestions.length,
      status: 'active'
    });

    const questions = await Question.insertMany(
      aiQuestions.map((q, index) => ({
        session_id: session._id,
        question_text: q.question_text,
        question_type: q.question_type || 'technical',
        difficulty: q.difficulty || difficulty,
        type: q.type || 'text',
        options: q.options || [],
        correct_option: q.correct_option !== undefined ? q.correct_option : null,
        tags: q.tags || [],
        order_index: index + 1
      }))
    );

    res.status(201).json({
      message: 'Session started',
      session_id: session._id,
      questions: questions.map(q => ({
        id: q._id,
        question_text: q.question_text,
        question_type: q.question_type,
        type: q.type,
        options: q.options,
        correct_option: q.correct_option,
        tags: q.tags,
        order_index: q.order_index
      }))
    });

  } catch (err) {
    console.error('Start session error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Submit Answer
exports.submitAnswer = async (req, res) => {
  try {
    const { question_id, session_id, answer_text } = req.body;

    console.log('Submitting answer for user:', req.user.email, 'Question ID:', question_id);

    if (!question_id || !session_id || answer_text === undefined) {
      return res.status(400).json({ message: 'question_id, session_id and answer_text are required' });
    }

    const question = await Question.findById(question_id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    let evaluation;

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
      const aiEval = await evaluateAnswer({
        question: question.question_text,
        answer: answer_text
      });
      evaluation = {
        ...aiEval,
        is_mcq: false,
        is_correct: null,
        your_option: '',
        correct_option_text: ''
      };
    }

    // Answer save karo
    const answer = await Answer.create({
      question_id,
      session_id,
      user_id: req.user.id,
      answer_text,
      score: evaluation.score,
      strong_points: evaluation.strong_points || [],
      missing_points: evaluation.missing_points || [],
      better_answer: evaluation.better_answer || null,
      is_mcq: evaluation.is_mcq,
      is_correct: evaluation.is_correct,
      your_option: evaluation.your_option,
      correct_option_text: evaluation.correct_option_text
    });

    console.log('Answer saved:', answer._id);

    res.json({
      message: 'Answer evaluated',
      evaluation: {
        score: evaluation.score,
        strong_points: evaluation.strong_points,
        missing_points: evaluation.missing_points,
        better_answer: evaluation.better_answer,
        is_mcq: evaluation.is_mcq,
        is_correct: evaluation.is_correct,
        your_option: evaluation.your_option,
        correct_option_text: evaluation.correct_option_text
      }
    });

  } catch (err) {
    console.error('Submit answer error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get Result
exports.getResult = async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('Fetching results for user:', req.user.email, 'Session ID:', sessionId);

    const answers = await Answer.find({ session_id: sessionId })
      .populate('question_id', 'question_text question_type type options correct_option');

    if (!answers.length) {
      console.log('No answers found for session:', sessionId);
      return res.status(404).json({ message: 'No answers found for this session' });
    }

    const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
    const avgScore = (totalScore / answers.length).toFixed(1);

    await InterviewSession.findByIdAndUpdate(sessionId, {
      total_score: avgScore,
      status: 'completed',
      completed_at: Date.now()
    });

    res.json({
      session_id: sessionId,
      total_questions: answers.length,
      average_score: avgScore,
      answers: answers.map(a => ({
        question: a.question_id?.question_text,
        question_type: a.question_id?.question_type,
        your_answer: a.answer_text,
        score: a.score,
        strong_points: a.strong_points,
        missing_points: a.missing_points,
        better_answer: a.better_answer,
        is_mcq: a.is_mcq,
        is_correct: a.is_correct,
        your_option: a.your_option,
        correct_option_text: a.correct_option_text
      }))
    });

  } catch (err) {
    console.error('Get result error:', err);
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

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};