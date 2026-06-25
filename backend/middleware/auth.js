const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
console.log('Authenticating request for user:', req.user?.email || 'Unknown', 'Token present:', !!token);
  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ message: 'No token, access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Token verified successfully for user:', req.user.email);
    next();
  } catch (err) {
    console.log('Invalid token provided:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};