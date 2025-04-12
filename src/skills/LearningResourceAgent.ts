import { searchYouTube } from "../utils/youtubesearch";
import { searchGitHubProjects } from "../utils/githubSearch";
import { getCertificationsForTopics } from "../utils/generateCertifications";

type SkillGapInput = {
  missing_skills: string[];
  missing_tools_and_technologies: string[];
};

export async function recommendResourcesFromGaps(gapData: SkillGapInput) {
  const topics = [
    ...(gapData.missing_skills || []),
    ...(gapData.missing_tools_and_technologies || [])
  ];

  const certResults = await getCertificationsForTopics(topics);
  const recommendations = [];

  for (const topic of topics) {
    const [videos, projects] = await Promise.all([
      searchYouTube(topic),
      searchGitHubProjects(topic)
    ]);

    const certEntry = certResults.find((entry: any) =>
      entry.topic.toLowerCase().includes(topic.toLowerCase())
    );

    recommendations.push({
      topic,
      certifications: certEntry?.certifications || [],
      youtube_videos: videos,
      github_projects: projects
    });
  }

  return recommendations;
}