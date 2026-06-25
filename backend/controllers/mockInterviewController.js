const { mockInterviewChat } = require('../services/groq');

exports.chat = async (req, res) => {
  try {
    const { messages, role } = req.body;

    // First message — start interview
    const formattedMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Add role context if first message
    if (messages.length === 0) {
      formattedMessages.push({
        role: 'user',
        content: `Start the interview. I am applying for ${role || 'Software Developer'} position.`
      });
    }

    const response = await mockInterviewChat(formattedMessages);

    res.json({
      message: response.message,
      type: response.type,
      score: response.score
    });

  } catch (err) {
    console.error('Mock interview error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};