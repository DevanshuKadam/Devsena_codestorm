import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv"

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const AImodel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


const genAI2 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_2);

const conversationmodel = genAI2.getGenerativeModel({ model: "gemini-2.0-flash" });

export {AImodel, conversationmodel}