/**
 * Authentication Middleware
 * Verifies Firebase ID tokens from the Authorization header
 * Attaches the Firebase user and MongoDB user to the request object
 */
const admin = require('../../config/firebase');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (firebaseError) {
      console.error('Firebase token verification failed:', firebaseError.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach Firebase user info to request
    req.firebaseUser = decodedToken;

    // Find the corresponding MongoDB user
    let user = await User.findOne({ firebaseUID: decodedToken.uid });
    
    // Lazy creation: If authenticated with Firebase but no MongoDB profile exists
    // (Common during dev when DB is reset/in-memory), create profile on-the-fly.
    if (!user) {
      console.log(`📡 New user ${decodedToken.email} detected via Auth Middleware. Creating lazy profile...`);
      user = new User({
        firebaseUID: decodedToken.uid,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        email: decodedToken.email,
        profileImage: decodedToken.picture || '',
        headline: 'New Member',
      });
      await user.save();
      console.log(`✅ Lazy profile created for: ${user.name}`);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
