import { openai } from "../config/openai";

export async function getCertificationsForTopics(topics: string[]) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "For each topic, suggest 2 online certifications or courses. Include name and URL. Return JSON like [{ topic, certifications: [{ title, url }] }]."
        },
        {
          role: "user",
          content: `Topics: ${topics.join(", ")}`
        }
      ],
      temperature: 0.5,
      max_tokens: 2000
    });
  
    const content = completion.choices[0].message.content || "";
  
    // Remove any markdown/code block formatting, if present
    const cleanedContent = content.replace(/```json|```/g, "").trim();
  
    try {
      return JSON.parse(cleanedContent);
    } catch (error) {
      console.error("❌ Failed to parse GPT cert output:", content);
      return [];
    }
  }