const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function run() {
    try {
        console.log("Listing models...");
        // Note: listModels might not be directly on genAI in all versions, 
        // but let's try to find how to list them or just try another known one.
        // Actually, the error message suggested "Call ListModels to see the list of available models".

        // In @google/generative-ai, there isn't a direct listModels on genAI.
        // It's usually through the Google AI File Manager or similar, or just knowing the names.

        console.log("Trying gemini-1.5-flash (no version suffix)...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello?");
        const response = await result.response;
        console.log("Gemini 1.5 Flash Response:", response.text());
    } catch (error) {
        console.error("Gemini 1.5 Flash Error:", error.message);
    }

    try {
        console.log("\nTrying gemini-1.5-pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const resultPro = await modelPro.generateContent("Hello?");
        const responsePro = await resultPro.response;
        console.log("Gemini 1.5 Pro Response:", responsePro.text());
    } catch (error) {
        console.error("Gemini 1.5 Pro Error:", error.message);
    }
}

run();


