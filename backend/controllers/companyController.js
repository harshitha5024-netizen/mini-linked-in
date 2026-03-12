/**
 * Company Controller
 * Handles company profiles, follows, and listings
 */
const Company = require('../models/Company');
const User = require('../models/User');

/**
 * Get all companies
 * GET /api/companies
 */
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

/**
 * Create a new company
 * POST /api/companies
 */
const createCompany = async (req, res) => {
  try {
    const { name, industry, website, location, description } = req.body;
    
    const existing = await Company.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: 'Company already exists' });
    }

    const company = new Company({
      name,
      industry,
      website,
      location,
      description
    });

    await company.save();
    res.status(201).json(company);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
};

/**
 * Toggle follow company
 * POST /api/companies/:id/follow
 */
const toggleFollowCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const userId = req.user._id;
    const isFollowing = company.followers.includes(userId);

    if (isFollowing) {
      company.followers = company.followers.filter(id => id.toString() !== userId.toString());
    } else {
      company.followers.push(userId);
    }

    await company.save();
    res.json({ message: isFollowing ? 'Unfollowed' : 'Followed', isFollowing: !isFollowing });
  } catch (error) {
    console.error('Follow company error:', error);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
};

module.exports = {
  getAllCompanies,
  createCompany,
  toggleFollowCompany
};
