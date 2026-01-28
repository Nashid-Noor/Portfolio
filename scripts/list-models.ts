
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    if (!process.env.GOOGLE_API_KEY) {
        console.log("No API Key found");
        return;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Testing gemini-1.5-flash...");
        const result = await model.generateContent("Hello");
        console.log("Success!", result.response.text());
    } catch (e) {
        console.log("Failed gemini-1.5-flash", e.message);
    }
}

main();
