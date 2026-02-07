const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function run() {
    // Trying gemini-pro as fallback
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log("Trying failing model: gemini-pro");

    try {
        const result = await model.generateContent("Hello?");
        const response = await result.response;
        const text = response.text();
        console.log("Response:", text);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

run();
