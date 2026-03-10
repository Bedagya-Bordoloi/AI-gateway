// check-models.js
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log("❌ Error: Could not find GEMINI_API_KEY in .env file.");
    return;
  }

  console.log("🔄 Asking Google for available models...");

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.error("❌ Google API Error:", data.error.message);
      return;
    }

    console.log("\n✅ === YOUR AVAILABLE MODELS ===");
    
    // Filter to only show models that can generate text/chat
    const textModels = data.models.filter(m => 
      m.supportedGenerationMethods.includes("generateContent")
    );

    textModels.forEach(model => {
      // The API returns names like 'models/gemini-pro', so we clean it up
      const cleanName = model.name.replace('models/', '');
      console.log(`- ${cleanName}`);
    });
    
    console.log("===============================\n");
    console.log("👉 Copy one of the names above and paste it into router.ts");

  } catch (error) {
    console.error("Failed to connect:", error);
  }
}

listModels();