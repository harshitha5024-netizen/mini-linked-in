/**
 * Job Controller
 * Handles job postings and retrieval
 */
const Job = require('../models/Job');
const User = require('../models/User');

/**
 * Create a new job posting
 * POST /api/jobs
 */
const createJob = async (req, res) => {
  try {
    const { title, companyName, location, description, requirements, salary, jobType } = req.body;
    
    if (!title || !companyName || !location || !description) {
      return res.status(400).json({ error: 'Title, company name, location, and description are required' });
    }

    const newJob = new Job({
      posterId: req.user._id,
      title,
      companyName,
      location,
      description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split(',').map(r => r.trim()) : []),
      salary,
      jobType
    });

    const savedJob = await newJob.save();
    console.log(`✅ New job posted: ${title} at ${companyName}`);
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to post job' });
  }
};

/**
 * Get all job postings
 * GET /api/jobs
 */
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('posterId', 'name profileImage headline')
      .sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

/**
 * Get a specific job by ID
 * GET /api/jobs/:id
 */
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('posterId', 'name profileImage headline');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById
};
