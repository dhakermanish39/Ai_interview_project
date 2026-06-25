const UserGoal = require('../models/UserGoal');

const isToday = (date) => {
  const today = new Date();
  const d = new Date(date);
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date);
  return d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
};

// Get goal
exports.getGoal = async (req, res) => {
  try {
    let goal = await UserGoal.findOne({ user_id: req.user.id });
    if (!goal) {
      goal = await UserGoal.create({ user_id: req.user.id });
    }

    // Reset today_count if not today
    if (goal.last_reset && !isToday(goal.last_reset)) {
      // Check streak
      if (!isYesterday(goal.last_reset)) {
        goal.streak = 0; // streak break
      }
      goal.today_count = 0;
      goal.last_reset = new Date();
      await goal.save();
    }

    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Set daily goal
exports.setGoal = async (req, res) => {
  try {
    const { daily_goal } = req.body;
    let goal = await UserGoal.findOneAndUpdate(
      { user_id: req.user.id },
      { daily_goal },
      { new: true, upsert: true }
    );
    res.json({ message: 'Goal updated!', goal });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Increment today count (answer submit hone pe call karo)
exports.incrementCount = async (req, res) => {
  try {
    let goal = await UserGoal.findOne({ user_id: req.user.id });
    if (!goal) goal = await UserGoal.create({ user_id: req.user.id });

    goal.today_count += 1;
    goal.last_practiced = new Date();

    // Streak update
    if (goal.last_reset && isYesterday(goal.last_reset)) {
      goal.streak += 1;
    } else if (!goal.last_reset || !isToday(goal.last_reset)) {
      goal.streak = 1;
    }

    if (!isToday(goal.last_reset)) {
      goal.today_count = 1;
      goal.last_reset = new Date();
    }

    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};