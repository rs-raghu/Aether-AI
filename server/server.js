// Load environment variables from the .env file
require('dotenv').config();

// Import necessary libraries
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Express app
const app = express();
const port = 3000;

// Use middleware
app.use(cors());
app.use(express.json());

// =================================================================
// >> DEBUGGING MIDDLEWARE <<
// This code will run for EVERY request that hits the server.
app.use((req, res, next) => {
  console.log(`Request received for URL: ${req.method} ${req.path}`);
  next();
});
// =================================================================

// Our main route for generating design styles
app.post('/generate-styles', async (req, res) => {
  // This message will ONLY appear if we successfully reach this route.
  console.log('--- ✅ SUCCESS: /generate-styles route was hit! ---');

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const systemPrompt = `
      You are an expert design system generator. Based on the user's prompt, create a design system.
      Your response MUST be in a valid JSON format. Do not include any text, code block formatting, or markdown outside of the JSON object itself.
      The JSON object should have the following structure:
      {
        "fonts": { "heading": { "fontName": "Google Font", "fontWeight": 700 }, "body": { "fontName": "Google Font", "fontWeight": 400 } },
        "colors": { "primary": "#HEXCODE", "secondary": "#HEXCODE", "accent": "#HEXCODE", "neutral": "#HEXCODE", "text": "#HEXCODE" }
      }
      User Prompt: "${prompt}"
    `;

    console.log('Sending prompt to Google Gemini...');
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const jsonText = response.text();
    console.log('Received response from Gemini!');

    const designSystem = JSON.parse(jsonText);
    res.json(designSystem);

  } catch (error) {
    console.error('Error in /generate-styles route:', error);
    res.status(500).json({ error: 'Failed to generate design system' });
  }
});

// A test route
app.get('/', (req, res) => {
  res.send('Hello from the Aether AI server!');
});

// --- START THE SERVER ---
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});