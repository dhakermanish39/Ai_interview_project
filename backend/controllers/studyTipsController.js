const InterviewSession = require('../models/InterviewSession');
const Answer = require('../models/Answer');
const { generateStudyTips } = require('../services/groq');

exports.getStudyTips = async (req, res) => {
  try {
    // Last 5 sessions ke answers fetch karo
    const sessions = await InterviewSession.find({
      user_id: req.user.id,
      status: 'completed'
    }).sort({ created_at: -1 }).limit(5);

    if (sessions.length === 0) {
      return res.json({
        tips: [],
        message: 'Complete at least one session to get personalized tips!'
      });
    }

    const sessionIds = sessions.map(s => s._id);
    const answers = await Answer.find({
      session_id: { $in: sessionIds }
    }).populate('question_id', 'question_type');

    // Weak areas find karo
    const typeScores = {};
    answers.forEach(a => {
      const type = a.question_id?.question_type || 'technical';
      if (!typeScores[type]) typeScores[type] = { total: 0, count: 0 };
      typeScores[type].total += a.score;
      typeScores[type].count += 1;
    });

    const weakAreas = Object.entries(typeScores)
      .map(([type, data]) => ({
        type,
        avg: (data.total / data.count).toFixed(1)
      }))
      .filter(a => a.avg < 7)
      .sort((a, b) => a.avg - b.avg);

    // Missing points collect karo
    const missingPoints = answers
      .flatMap(a => a.missing_points || [])
      .slice(0, 10);

    // AI se tips generate karo
    const tips = await generateStudyTips({ weakAreas, missingPoints });

    res.json({ tips, weakAreas });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};