// 1. Load our secret API key from the .env file
require('dotenv').config();

// 2. Import the Google AI library
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 3. Configure the AI client with our key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// This is the main function that will run our test
async function runAITest() {
  console.log("Starting AI test... Please wait.");

  try {
    // 4. Define our hardcoded prompt right here in the code
    const userPrompt = "a modern and clean website for a yoga studio";

    const systemPrompt = `
      You are an expert design system generator. Based on the user's prompt, create a design system.
      Your response MUST be in a valid JSON format. Do not include any text, code block formatting, or markdown outside of the JSON object itself.
      The JSON object should have the following structure:
      {
        "fonts": { "heading": { "fontName": "Name of a Google Font", "fontWeight": 700 }, "body": { "fontName": "Name of a Google Font", "fontWeight": 400 } },
        "colors": { "primary": "#HEXCODE", "secondary": "#HEXCODE", "accent": "#HEXCODE", "neutral": "#HEXCODE", "text": "#HEXCODE" }
      }
      User Prompt: "${userPrompt}"
    `;

    // 5. Get the AI model and make the API call
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const jsonText = response.text();

    console.log("\n--- Raw Text Received from AI ---");
    console.log(jsonText);

    // 6. Try to parse the text into a real JSON object
    const designSystem = JSON.parse(jsonText);

    console.log("\n--- ✅ SUCCESS! Parsed JSON Object ---");
    console.log(designSystem);

  } catch (error) {
    console.error("\n--- ❌ ERROR! The test failed ---");
    console.error(error);
  }
}

// This line automatically runs our main function
runAITest();
