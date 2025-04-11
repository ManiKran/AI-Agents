import fs from "fs";
import path from "path";
import { parseResume } from "./skills/ResumeSkill";
import { findMissingSkills } from "./skills/MissingSkillAgent";
import { extractTextFromPDF } from "./utils/pdfReader";

async function loadResumeText(filePath: string): Promise<string> {
  const ext = path.extname(filePath);
  return ext === ".pdf" ? await extractTextFromPDF(filePath) : fs.readFileSync(filePath, "utf8");
}

async function main() {
  // ✅ 1. Paths to input files
  const resumePath = path.join(__dirname, "../resume.pdf"); // or .txt
  const jobDescPath = path.join(__dirname, "../job-description.txt");

  // ✅ 2. Load contents
  const resumeText = await loadResumeText(resumePath);
  const jobDescription = fs.readFileSync(jobDescPath, "utf8");

  // ✅ 3. Parse resume
  const parsed = await parseResume(resumeText);
  //console.log("🧠 Resume Parsed:", parsed);

  // ✅ 4. Compare with job description
  const gap = await findMissingSkills(
    parsed.skills,
    parsed["tools and technologies"] || parsed.tools_and_technologies || [],
    jobDescription
  );

  console.log("🔍 Missing Skills & Tools:", gap);
}

main();