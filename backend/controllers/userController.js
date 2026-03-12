/**
 * User Controller
 * Handles user creation, retrieval, and profile updates
 */
const User = require('../models/User');

/**
 * Create a new user profile after Firebase signup
 * POST /api/users
 */
const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const firebaseUID = req.firebaseUser.uid;

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUID });
    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    // Create new user in MongoDB
    const newUser = new User({
      firebaseUID,
      name: name || email.split('@')[0],
      email,
      profileImage: '',
      headline: '',
      bio: '',
      skills: [],
      location: '',
      experience: '',
      education: ''
    });

    const savedUser = await newUser.save();
    console.log(`✅ New user created: ${savedUser.name}`);
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('connections', 'name profileImage headline');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * Get current authenticated user's profile
 * GET /api/users/me
 */
const getCurrentUser = async (req, res) => {
  try {
    let user = await User.findOne({ firebaseUID: req.firebaseUser.uid })
      .populate('connections', 'name profileImage headline');

    // Lazy initialization: If user is authenticated via Firebase but doesn't exist in MongoDB
    // (Common during dev when DB is reset/in-memory), create a profile automatically.
    if (!user) {
      console.log(`📡 User ${req.firebaseUser.email} authenticated but profile missing. Creating lazy profile...`);
      user = new User({
        firebaseUID: req.firebaseUser.uid,
        name: req.firebaseUser.name || req.firebaseUser.email.split('@')[0],
        email: req.firebaseUser.email,
        profileImage: req.firebaseUser.picture || '',
        headline: 'New Member',
        bio: '',
        skills: [],
        location: '',
        experience: '',
        education: ''
      });
      await user.save();
      console.log(`✅ Lazy profile created for: ${user.name}`);
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

/**
 * Update user profile
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure user can only edit their own profile
    if (user.firebaseUID !== req.firebaseUser.uid) {
      return res.status(403).json({ error: 'You can only edit your own profile' });
    }

    // Fields that can be updated
    const allowedUpdates = ['name', 'headline', 'bio', 'skills', 'location', 'experience', 'education', 'profileImage', 'currentCompany', 'industry'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle profile image upload if file is present
    if (req.file) {
      updates.profileImage = "/uploads/" + req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Get all users (for skill match suggestions)
 * GET /api/users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name profileImage headline skills location')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Get skill-based connection suggestions for a user
 * GET /api/users/:id/suggestions
 */
/**
 * Skill-based connection suggestions for a user
 * GET /api/users/:id/suggestions
 */
const getSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.skills.length === 0) {
      return res.json([]);
    }

    // Find users who share at least one skill, exclude self and current connections
    const suggestions = await User.find({
      _id: { $ne: user._id, $nin: user.connections },
      skills: { $in: user.skills }
    }, 'name profileImage headline skills location')
      .limit(10);

    // Calculate match score
    const scoredSuggestions = suggestions.map(s => {
      const matchingSkills = s.skills.filter(skill => 
        user.skills.map(us => us.toLowerCase()).includes(skill.toLowerCase())
      );
      return {
        ...s.toObject(),
        matchingSkills,
        matchScore: matchingSkills.length
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json(scoredSuggestions);
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

/**
 * Connect with another user
 * POST /api/users/:id/connect
 */
const connectUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ error: 'You cannot connect with yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = req.user;
    const isAlreadyConnected = currentUser.connections.includes(targetUserId);

    if (isAlreadyConnected) {
      // Unconnect (Friend removal)
      currentUser.connections = currentUser.connections.filter(id => id.toString() !== targetUserId);
      targetUser.connections = targetUser.connections.filter(id => id.toString() !== currentUserId.toString());
      await currentUser.save();
      await targetUser.save();
      return res.json({ message: 'Disconnected', isConnected: false });
    } else {
      // Connect (Friend addition)
      currentUser.connections.push(targetUserId);
      targetUser.connections.push(currentUserId);
      await currentUser.save();
      await targetUser.save();

      // Notification
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: targetUserId,
        message: `${currentUser.name} connected with you!`,
        type: 'connection',
        relatedUser: currentUserId
      });

      return res.json({ message: 'Connected', isConnected: true });
    }
  } catch (error) {
    console.error('Connect user error:', error);
    res.status(500).json({ error: 'Failed to toggle connection' });
  }
};

/**
 * Get connections for current user
 * GET /api/users/me/connections
 */
const getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('connections', 'name profileImage headline skills location');
    
    res.json(user.connections);
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
};

module.exports = {
  createUser,
  getUser,
  getCurrentUser,
  updateUser,
  getAllUsers,
  getSuggestions,
  connectUser,
  getConnections
};
