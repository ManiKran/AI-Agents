import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { extractTextFromPDF } from "./utils/pdfReader";
import { parseResume } from "./skills/ResumeSkill";
import { findMissingSkills } from "./skills/MissingSkillAgent";
import { recommendResourcesFromGaps } from "./skills/LearningResourceAgent";
import { generateWeeklyStudyPlan } from "./skills/TrainingPlanAgent";

dotenv.config();

async function loadResumeText(filePath: string): Promise<string> {
  const ext = path.extname(filePath);
  return ext === ".pdf"
    ? await extractTextFromPDF(filePath)
    : fs.readFileSync(filePath, "utf8");
}

async function main() {
  const resumePath = path.join(__dirname, "../resume.pdf");
  const jobDescPath = path.join(__dirname, "../job-description.txt");

  const resumeText = await loadResumeText(resumePath);
  const jobDescription = fs.readFileSync(jobDescPath, "utf8");

  const parsed = await parseResume(resumeText);
  const gap = await findMissingSkills(
    parsed.skills || [],
    parsed["tools and technologies"] || parsed.tools_and_technologies || [],
    jobDescription
  );

  const learningResources = await recommendResourcesFromGaps(gap);
  fs.writeFileSync("learning-resources.json", JSON.stringify(learningResources, null, 2));
  console.log("📚 Recommended learning resources saved to learning-resources.json");

  const weeklyPlan = generateWeeklyStudyPlan(learningResources);
  fs.writeFileSync("weekly-study-plan.json", JSON.stringify(weeklyPlan, null, 2));
  console.log("🗓️ Weekly study plan saved to weekly-study-plan.json");
}

main().catch((err) => {
  console.error("❌ Agent Error:", err);
});