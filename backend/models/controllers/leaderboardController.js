const InterviewSession = require('../models/InterviewSession');
const User = require('../models/User');

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await InterviewSession.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$user_id',
          avg_score: { $avg: '$total_score' },
          total_sessions: { $sum: 1 },
          best_score: { $max: '$total_score' }
        }
      },
      { $sort: { avg_score: -1 } },
      { $limit: 10 }
    ]);

    // User names fetch karo
    const userIds = leaderboard.map(l => l._id);
    const users = await User.find({ _id: { $in: userIds } }).select('name target_role');
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const result = leaderboard.map((l, index) => ({
      rank: index + 1,
      name: userMap[l._id.toString()]?.name || 'Anonymous',
      target_role: userMap[l._id.toString()]?.target_role || '',
      avg_score: parseFloat(l.avg_score.toFixed(1)),
      total_sessions: l.total_sessions,
      best_score: parseFloat(l.best_score.toFixed(1)),
      is_me: l._id.toString() === req.user.id
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};