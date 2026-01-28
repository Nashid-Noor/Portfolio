
import { chat } from "../lib/chat-client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
    console.log("🧪 Testing Gemini Integration...");
    console.log("🔑 API Key present:", !!process.env.GOOGLE_API_KEY);
    console.log("🤖 Model:", process.env.GEMINI_MODEL || "default");

    const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello! Who are you?" }
    ];

    try {
        // @ts-ignore
        const response = await chat(messages);
        console.log("\n✅ Response Received:");
        console.log(response.content);
    } catch (error) {
        console.error("\n❌ Error:");
        console.error(error);
    }
}

main();
