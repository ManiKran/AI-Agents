import { openai } from "../config/openai";

export async function findMissingSkills(
  resumeSkills: string[],
  toolsAndTech: string[],
  jobDescription: string
) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o", // Or your chosen model
    messages: [
      {
        role: "system",
        content: "You are a career coach that compares resume skills with job descriptions."
      },
      {
        role: "user",
        content: `
Compare this candidate's skills and tools with the job description and return a JSON object with:

- missing_skills: (array of strings which should not include soft skills)
- missing_tools_and_technologies: (array of strings)

Candidate Skills:
${resumeSkills.join(", ")}

Tools & Technologies:
${toolsAndTech.join(", ")}

Job Description:
${jobDescription}
        `
      }
    ]
  });

  const content = completion.choices[0].message.content || "";
  const cleaned = content.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("❌ JSON Parse Failed:", content);
    return {};
  }
}