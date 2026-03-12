/**
 * Post Controller
 * Handles post creation, feed retrieval, likes, and comments
 * Includes skill detection for Skill Match Notifications
 */
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Common tech skills list for detection
const KNOWN_SKILLS = [
  'javascript', 'python', 'java', 'typescript', 'react', 'angular', 'vue',
  'node.js', 'nodejs', 'express', 'django', 'flask', 'spring', 'ruby',
  'rails', 'php', 'laravel', 'go', 'golang', 'rust', 'swift', 'kotlin',
  'html', 'css', 'sass', 'tailwind', 'bootstrap', 'jquery',
  'mongodb', 'mysql', 'postgresql', 'redis', 'firebase', 'supabase',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
  'git', 'github', 'gitlab', 'ci/cd', 'devops', 'linux',
  'machine learning', 'deep learning', 'ai', 'artificial intelligence',
  'data science', 'data analysis', 'tensorflow', 'pytorch',
  'figma', 'photoshop', 'ui/ux', 'design', 'graphic design',
  'agile', 'scrum', 'project management', 'product management',
  'blockchain', 'web3', 'solidity', 'ethereum',
  'flutter', 'react native', 'mobile development', 'ios', 'android',
  'cybersecurity', 'networking', 'cloud computing',
  'sql', 'nosql', 'graphql', 'rest api', 'api',
  'c++', 'c#', '.net', 'unity', 'unreal engine',
  'next.js', 'nuxt.js', 'svelte', 'remix', 'astro',
  'vercel', 'netlify', 'heroku', 'digital ocean',
  'testing', 'jest', 'cypress', 'selenium',
  'microservices', 'serverless', 'websockets',
  'natural language processing', 'nlp', 'computer vision',
  'power bi', 'tableau', 'excel', 'r programming'
];

/**
 * Detect skills mentioned in a text
 * @param {string} text - Text to analyze
 * @returns {string[]} - Array of detected skills
 */
function detectSkills(text) {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const detected = KNOWN_SKILLS.filter(skill => {
    // Use word boundary-like matching to avoid partial matches
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lowerText);
  });
  return [...new Set(detected)]; // Remove duplicates
}

/**
 * Generate skill match notifications
 * @param {Object} post - The newly created post
 * @param {Object} author - The post author
 * @param {string[]} detectedSkills - Skills detected in the post
 */
async function generateSkillMatchNotifications(post, author, detectedSkills) {
  try {
    if (detectedSkills.length === 0) return;

    // Find users who have matching skills (exclude the author)
    const matchingUsers = await User.find({
      _id: { $ne: author._id },
      skills: { $in: detectedSkills.map(s => new RegExp(`^${s}$`, 'i')) }
    });

    // Create notifications for matching users
    const notifications = matchingUsers.map(matchUser => {
      const sharedSkills = matchUser.skills.filter(skill =>
        detectedSkills.some(ds => ds.toLowerCase() === skill.toLowerCase())
      );

      return {
        userId: matchUser._id,
        message: `You and ${author.name} both share skills in ${sharedSkills.join(', ')}. Consider connecting since you have similar interests!`,
        type: 'skill_match',
        relatedUser: author._id,
        relatedPost: post._id
      };
    });

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`📢 Created ${notifications.length} skill match notifications`);
    }
  } catch (error) {
    console.error('Skill match notification error:', error);
  }
}

/**
 * Create a new post
 * POST /api/posts
 */
const createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const author = req.user;

    if (!author) {
      return res.status(404).json({ error: 'User profile not found. Please create your profile first.' });
    }

    if (!caption || caption.trim().length === 0) {
      return res.status(400).json({ error: 'Caption is required' });
    }

    // Detect skills in the caption
    const skillsDetected = detectSkills(caption);

    // Create the post
    const newPost = new Post({
      authorId: author._id,
      caption: caption.trim(),
      imageUrl: req.file ? req.file.path : '',
      skillsDetected,
      likes: [],
      comments: []
    });

    const savedPost = await newPost.save();

    // Generate skill match notifications asynchronously
    generateSkillMatchNotifications(savedPost, author, skillsDetected);

    // Populate author info for response
    const populatedPost = await Post.findById(savedPost._id)
      .populate('authorId', 'name profileImage headline');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

/**
 * Get all posts (feed)
 * GET /api/posts
 */
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('authorId', 'name profileImage headline')
      .populate('comments.userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

/**
 * Like or unlike a post
 * POST /api/posts/:id/like
 */
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.findIndex(id => id.toString() === userId.toString());

    if (likeIndex > -1) {
      // Unlike: remove user from likes array
      post.likes.splice(likeIndex, 1);
    } else {
      // Like: add user to likes array
      post.likes.push(userId);

      // Create notification for post author (if not self-like)
      if (post.authorId.toString() !== userId.toString()) {
        await Notification.create({
          userId: post.authorId,
          message: `${req.user.name} liked your post`,
          type: 'like',
          relatedUser: userId,
          relatedPost: post._id
        });
      }
    }

    await post.save();

    res.json({
      likes: post.likes,
      likesCount: post.likes.length,
      isLiked: likeIndex === -1 // true if just liked, false if just unliked
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

/**
 * Add a comment to a post
 * POST /api/posts/:id/comment
 */
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = {
      userId: req.user._id,
      text: text.trim()
    };

    post.comments.push(comment);
    await post.save();

    // Create notification for post author (if not self-comment)
    if (post.authorId.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: post.authorId,
        message: `${req.user.name} commented on your post: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
        type: 'comment',
        relatedUser: req.user._id,
        relatedPost: post._id
      });
    }

    // Return the populated post
    const updatedPost = await Post.findById(post._id)
      .populate('authorId', 'name profileImage headline')
      .populate('comments.userId', 'name profileImage');

    res.json(updatedPost);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

module.exports = {
  createPost,
  getPosts,
  toggleLike,
  addComment
};
