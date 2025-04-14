// src/skills/TrainingPlanAgent.ts

type LearningResource = {
    topic: string;
    certifications: { title: string; url: string }[];
    youtube_videos: { title: string; url: string }[];
    github_projects: { name: string; url: string }[];
  };
  
  type DailyPlan = {
    day: string;
    topic: string;
    certification?: string;
    youtube_video?: string;
    github_project?: string;
  };
  
  type WeeklyPlan = {
    week: string;
    days: DailyPlan[];
  };
  
  export function generateWeeklyStudyPlan(
    resources: LearningResource[],
    daysPerWeek: number = 5
  ): WeeklyPlan[] {
    const dailyPlans: DailyPlan[] = [];
    let dayCounter = 1;
  
    for (const resource of resources) {
      const topic = resource.topic;
  
      const cert = resource.certifications[0]?.url;
      const video = resource.youtube_videos[0]?.url;
      const github = resource.github_projects[0]?.url;
  
      if (cert) {
        dailyPlans.push({
          day: `Day ${dayCounter++}`,
          topic,
          certification: cert
        });
      }
  
      if (video) {
        dailyPlans.push({
          day: `Day ${dayCounter++}`,
          topic,
          youtube_video: video
        });
      }
  
      if (github) {
        dailyPlans.push({
          day: `Day ${dayCounter++}`,
          topic,
          github_project: github
        });
      }
    }
  
    // Group into weekly chunks
    const weeklyPlans: WeeklyPlan[] = [];
    for (let i = 0; i < dailyPlans.length; i += daysPerWeek) {
      weeklyPlans.push({
        week: `Week ${weeklyPlans.length + 1}`,
        days: dailyPlans.slice(i, i + daysPerWeek)
      });
    }
  
    return weeklyPlans;
  }