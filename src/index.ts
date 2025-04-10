import { parseResume } from "./skills/ResumeSkill";
import { extractTextFromPDF } from "./utils/pdfReader";
import fs from "fs";
import path from "path";

async function main() {
  const resumePath = path.join(__dirname, "../resume.pdf"); // or resume.txt
  const extension = path.extname(resumePath);
  let resumeText = "";

  if (extension === ".pdf") {
    resumeText = await extractTextFromPDF(resumePath);
  } else {
    resumeText = fs.readFileSync(resumePath, "utf8");
  }

  const result = await parseResume(resumeText);
  console.log("🧠 Parsed Resume Output:");
  console.log(result);
}

main().catch(console.error);