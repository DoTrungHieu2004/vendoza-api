const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Fetch user from database to ensure they still exist and are active
    const user = await User.findById(decoded.id).select('-password_hash');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach full user object (without password)
    next();
  } catch (error) {
    next(error); // Pass to error handler
  }
};

module.exports = authMiddleware;
