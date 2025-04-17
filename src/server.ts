import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";
import path from "path";

declare module "express-serve-static-core" {
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

app.post(
  "/analyze",
  upload.fields([{ name: "resume" }, { name: "jobdesc" }]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const resumeFile = req.files?.resume?.[0];
      const jobDescFile = req.files?.jobdesc?.[0];

      if (!resumeFile || !jobDescFile) {
        res.status(400).json({ error: "Both files are required." });
        return;
      }

      const resumeText = await extractTextFromPDF(resumeFile.path);
      const jobDescription = fs.readFileSync(jobDescFile.path, "utf8");

      const parsed = await parseResume(resumeText);
      const gap = await findMissingSkills(
        parsed.skills || [],
        parsed["tools and technologies"] || parsed.tools_and_technologies || [],
        jobDescription
      );

      const learningResources = await recommendResourcesFromGaps({
        missing_skills: gap.missing_skills,
        missing_tools_and_technologies: gap.missing_tools_and_technologies,
      });
      const weeklyPlan = generateWeeklyStudyPlan(learningResources);

      fs.writeFileSync("learning-resources.json", JSON.stringify(learningResources, null, 2));
      fs.writeFileSync("weekly-study-plan.json", JSON.stringify(weeklyPlan, null, 2));

      const doc = new PDFDocument({ margin: 50 });
      const pdfPath = path.join(__dirname, "..", "SkillSyncAI_Study_Plan.pdf");
      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      doc.fontSize(20).text("SkillSyncAI Learning Resources", { underline: true });

      learningResources.forEach((resource, index) => {
        doc.moveDown().fontSize(14).text(`\n${index + 1}. Topic: ${resource.topic}`);

        resource.certifications?.forEach((cert: { title: string; url: string }) => {
          doc.text(`Certification: ${cert.title}`, { continued: true })
             .fillColor('blue').text(` (${cert.url})`, {
               link: cert.url,
               underline: true
             }).fillColor('black');
        });

        resource.youtube_videos?.forEach((vid: { title: string; url: string }) => {
          doc.text(`YouTube: ${vid.title}`, { continued: true })
             .fillColor('blue').text(` (${vid.url})`, {
               link: vid.url,
               underline: true
             }).fillColor('black');
        });

        resource.github_projects?.forEach((repo: { name: string; url: string }) => {
          doc.text(`GitHub: ${repo.name}`, { continued: true })
             .fillColor('blue').text(` (${repo.url})`, {
               link: repo.url,
               underline: true
             }).fillColor('black');
        });
      });

      doc.addPage().fontSize(20).text("Weekly Study Plan", { underline: true });

      weeklyPlan.forEach((week) => {
        doc.moveDown().fontSize(16).text(`Week ${week.week}`, { underline: true });

        week.days.forEach((day) => {
          doc.moveDown().fontSize(14).text(`${day.day} - ${day.topic}`);

          if (day.certification) {
            doc.text("Certification:", { continued: true })
               .fillColor("blue")
               .text(` ${day.certification}`, { link: day.certification, underline: true })
               .fillColor("black");
          }

          if (day.youtube_video) {
            doc.text("YouTube Video:", { continued: true })
               .fillColor("blue")
               .text(` ${day.youtube_video}`, { link: day.youtube_video, underline: true })
               .fillColor("black");
          }

          if (day.github_project) {
            doc.text("GitHub Project:", { continued: true })
               .fillColor("blue")
               .text(` ${day.github_project}`, { link: day.github_project, underline: true })
               .fillColor("black");
          }
        });
      });

      doc.end();

      writeStream.on("finish", () => {
        res.json({
          message: "✅ PDF generated successfully",
          pdfDownload: "http://localhost:3001/download",
        });
      });
    } catch (error) {
      console.error("❌ Backend Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Serve the PDF download
app.get("/download", (req, res) => {
  const filePath = path.join(__dirname, "..", "SkillSyncAI_Study_Plan.pdf");
  res.download(filePath, "SkillSyncAI_Study_Plan.pdf");
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});