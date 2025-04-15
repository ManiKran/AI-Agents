import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";

declare module 'express-serve-static-core' {
  interface Request {
    files?: {
      resume?: Express.Multer.File[];
      jobdesc?: Express.Multer.File[];
    };
  }
}

import { extractTextFromPDF } from "./utils/pdfReader";
import { parseResume } from "./skills/ResumeSkill";
import { findMissingSkills } from "./skills/MissingSkillAgent";
import { recommendResourcesFromGaps } from "./skills/LearningResourceAgent";
import { generateWeeklyStudyPlan } from "./skills/TrainingPlanAgent";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/analyze", upload.fields([{ name: "resume" }, { name: "jobdesc" }]), async (req: Request, res: Response) => {
  try {
    const resumeFile = req.files?.resume?.[0];
    const jobDescFile = req.files?.jobdesc?.[0];

    if (!resumeFile || !jobDescFile) {
      res.status(400).json({ error: "Both resume and job description are required." });
      return;
    }

    console.log("🎯 Resume file path:", resumeFile.path);
    console.log("🎯 Job description file path:", jobDescFile.path);

    const resumeText = await extractTextFromPDF(resumeFile.path);
    const jobDescription = fs.readFileSync(jobDescFile.path, "utf8");

    const parsed = await parseResume(resumeText);
    const gap = await findMissingSkills(
      parsed.skills || [],
      parsed["tools and technologies"] || parsed.tools_and_technologies || [],
      jobDescription
    );

    const learningResources = await recommendResourcesFromGaps(gap);
    const weeklyPlan = generateWeeklyStudyPlan(learningResources);

    res.json({ learningResources, weeklyPlan });
  } catch (error) {
    console.error("❌ Backend Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});