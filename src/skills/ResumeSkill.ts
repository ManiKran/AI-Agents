import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// Use GitHub token and endpoint for GitHub Models
const openai = new OpenAI({
  apiKey: process.env.GITHUB_TOKEN,
  baseURL: "https://models.inference.ai.azure.com", // GitHub model inference endpoint
});

export async function parseResume(resumeText: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o", // GitHub-supported model
    temperature: 0.7,
    max_tokens: 1000,
    messages: [
      {
        role: "system",
        content: "You are a helpful AI resume parser.",
      },
      {
        role: "user",
        content: `
Parse the following resume and return a JSON object with these keys:
- skills (array of strings)
- tools and technologies (array of strings)

Resume:
${resumeText}
        `,
      },
    ],
  });

  let content = completion.choices[0].message.content || "";

// Remove markdown-style code block if present
if (content.startsWith("```")) {
  content = content.replace(/```json|```/g, "").trim();
}

  try {
    return JSON.parse(content || "{}");
  } catch (e) {
    console.error("❌ Failed to parse JSON from LLM output:", content);
    return {};
  }
}