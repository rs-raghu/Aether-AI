// Load environment variables from the .env file
require('dotenv').config();

// Import necessary libraries
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

// Initialize Express app
const app = express();
const port = 3000; // The port our server will run on

// Use middleware
app.use(cors()); // Allow requests from our Figma plugin
app.use(express.json()); // Allow the server to understand JSON data

// Set up the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- API ROUTES WILL GO HERE ---
// This is a test route to make sure our server is working
app.get('/', (req, res) => {
  res.send('Hello from the Aether AI server!');
});


// --- START THE SERVER ---
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
