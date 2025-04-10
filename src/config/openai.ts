// src/config/openai.ts

import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

export const openai = new OpenAI({
  apiKey: process.env.GITHUB_TOKEN, // GitHub PAT with models:read scope
  baseURL: "https://models.inference.ai.azure.com", // GitHub Models API
});