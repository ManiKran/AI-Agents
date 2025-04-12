import dotenv from "dotenv";
import fs from "fs";
import { recommendResourcesFromGaps } from "./skills/LearningResourceAgent";
import { findMissingSkills } from "./skills/MissingSkillAgent";
import { parseResume } from "./skills/ResumeSkill";
import { extractTextFromPDF } from "./utils/pdfReader";
import path from "path";

dotenv.config();

async function loadResumeText(filePath: string): Promise<string> {
  const ext = path.extname(filePath);
  return ext === ".pdf" ? await extractTextFromPDF(filePath) : fs.readFileSync(filePath, "utf8");
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

  console.log("📚 Recommended Learning Resources:");
  console.dir(learningResources, { depth: null });

  fs.writeFileSync("learning-resources.json", JSON.stringify(learningResources, null, 2));
}

main();