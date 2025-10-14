// code.ts

// Show the UI when the plugin is run
figma.showUI(__html__, { width: 320, height: 240 });

// IMPORTANT: Replace with your actual API keys
const GEMINI_API_KEY = GOOGLE_GEMINI_API_KEY;

// Listen for messages from the UI (e.g., when the button is clicked)
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-design') {
    const userPrompt = msg.prompt;

    if (!userPrompt) {
      figma.notify("Please enter a description.", { error: true });
      return;
    }

    figma.notify("🧠 AI Agent is thinking...");

    // This is the key function call
    const designSystem = await getDesignSuggestions(userPrompt);

    if (designSystem) {
      // If we get a good response, apply the styles
      await applyStyles(designSystem);
      figma.notify("✨ Design system created!");
    } else {
      figma.notify("Sorry, the AI couldn't generate suggestions.", { error: true });
    }
  }
};

/**
 * Calls the Google Gemini API to get design suggestions.
 * @param prompt The user's description of their project.
 * @returns A structured JSON object with design suggestions.
 */
async function getDesignSuggestions(prompt: string) {
  // This is the endpoint for the Gemini Pro model
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  // We engineer the prompt to ask Gemini for a JSON object.
  // This makes the response predictable and easy for our code to use.
  const structuredPrompt = `
    Based on the following project description, generate a basic design system.
    Description: "${prompt}"

    Provide your response as a single, valid JSON object only, with no other text or markdown formatting. The JSON object should have this exact structure:
    {
      "themeName": "A creative name for the theme",
      "colors": {
        "primary": "#XXXXXX",
        "secondary": "#XXXXXX",
        "accent": "#XXXXXX",
        "neutral": "#XXXXXX",
        "background": "#FFFFFF"
      },
      "typography": {
        "headingFont": "Name of a Google Font for headings",
        "bodyFont": "Name of a Google Font for body text"
      },
      "spacing": {
        "baseUnit": 8
      }
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: structuredPrompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    // The response from Gemini is inside a deeply nested structure. We extract the text part.
    const jsonString = data.candidates[0].content.parts[0].text;
    
    // Convert the JSON string into a usable JavaScript object
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}

/**
 * Uses the Figma Plugin API to create styles based on the AI's suggestions.
 */
async function applyStyles(designSystem) {
    // This part of the code would contain the logic to create color and text styles
    // as shown in the previous complete example.
    console.log("Applying styles for:", designSystem.themeName);

    // Helper function to convert HEX to RGB for Figma
    function hexToRgb(hex: string) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
    }

    // Create Color Styles
    for (const [name, hex] of Object.entries(designSystem.colors)) {
        const paintStyle = figma.createPaintStyle();
        paintStyle.name = `Theme/${name}`;
        const { r, g, b } = hexToRgb(hex as string);
        paintStyle.paints = [{ type: 'SOLID', color: { r, g, b } }];
    }

    // Create Text Styles
    const headingFont = { family: designSystem.typography.headingFont, style: 'Bold' };
    const bodyFont = { family: designSystem.typography.bodyFont, style: 'Regular' };
    
    await figma.loadFontAsync(headingFont).catch(err => console.log("Couldn't load heading font"));
    await figma.loadFontAsync(bodyFont).catch(err => console.log("Couldn't load body font"));

    const h1Style = figma.createTextStyle();
    h1Style.name = "Headings/H1";
    h1Style.fontName = headingFont;
    h1Style.fontSize = 32;

    const bodyStyle = figma.createTextStyle();
    bodyStyle.name = "Text/Body";
    bodyStyle.fontName = bodyFont;
    bodyStyle.fontSize = 16;
}