/**
 * AI Controller
 * Handles AI-powered bio and caption enhancement using Groq API
 */
const Groq = require('groq-sdk');
require('dotenv').config();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Enhance a professional bio using AI
 * POST /api/ai/enhance-bio
 */
const enhanceBio = async (req, res) => {
  try {
    const { bio } = req.body;

    if (!bio || bio.trim().length === 0) {
      return res.status(400).json({ error: 'Bio text is required' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional LinkedIn profile writer. Your job is to improve professional bios to sound polished, professional, and engaging. Keep the same meaning and facts but make it sound more impressive and well-written. Return ONLY the improved bio text, no explanations or quotes.'
        },
        {
          role: 'user',
          content: `Improve this professional bio and make it sound polished and professional for LinkedIn:\n\n${bio}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
    });

    const enhancedBio = completion.choices[0]?.message?.content?.trim();

    if (!enhancedBio) {
      return res.status(500).json({ error: 'AI did not return a response' });
    }

    res.json({ original: bio, enhanced: enhancedBio });
  } catch (error) {
    console.error('Enhance bio error:', error.message);
    
    // Check for authentication or invalid key errors
    if (error.status === 401 || error.message.toLowerCase().includes('api key')) {
      console.warn('⚠️ Using Demo Mode for Bio enhancement (No valid Groq API Key found)');
      return res.json({ 
        original: bio, 
        enhanced: `🚀 [DEVMOCK] ${bio}\n\nPassionate about driving innovation and building meaningful connections. I help teams scale through strategic problem-solving and modern technology. Let's connect!`,
        isMock: true
      });
    }
    
    res.status(500).json({ error: 'Failed to enhance bio. Please check your Groq API key.' });
  }
};

/**
 * Enhance a post caption using AI
 * POST /api/ai/enhance-caption
 */
const enhanceCaption = async (req, res) => {
  try {
    const { caption } = req.body;

    if (!caption || caption.trim().length === 0) {
      return res.status(400).json({ error: 'Caption text is required' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a LinkedIn content expert. Your job is to improve LinkedIn post captions to sound more professional, engaging, and impactful. Add appropriate emojis sparingly, improve structure, and make it more compelling. Keep the core message the same. Return ONLY the improved caption text, no explanations or quotes.'
        },
        {
          role: 'user',
          content: `Improve this LinkedIn post caption to sound more professional and engaging:\n\n${caption}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
    });

    const enhancedCaption = completion.choices[0]?.message?.content?.trim();

    if (!enhancedCaption) {
      return res.status(500).json({ error: 'AI did not return a response' });
    }

    res.json({ original: caption, enhanced: enhancedCaption });
  } catch (error) {
    console.error('Enhance caption error:', error.message);
    
    // Check for authentication or invalid key errors
    if (error.status === 401 || error.message.toLowerCase().includes('api key')) {
      console.warn('⚠️ Using Demo Mode for AI enhancement (No valid Groq API Key found)');
      return res.json({ 
        original: caption, 
        enhanced: `✨ [DEVMOCK] Enhanced: ${caption} \n\nLooking forward to connecting with more professionals in this space! #Growth #Networking #Professional`,
        isMock: true
      });
    }
    
    res.status(500).json({ error: 'Failed to enhance caption. Please check your Groq API key.' });
  }
};

module.exports = {
  enhanceBio,
  enhanceCaption
};
