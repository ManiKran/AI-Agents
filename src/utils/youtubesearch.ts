import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  console.error("❌ YOUTUBE_API_KEY is missing");
  process.exit(1);
}

export async function searchYouTube(query: string, maxResults = 2) {
  try {
    const { data } = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        key: YOUTUBE_API_KEY,
        q: `${query} tutorial`,
        part: "snippet",
        type: "video",
        maxResults,
      }
    });

    return data.items.map((item: any) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } catch (err: any) {
    console.error("❌ YouTube API Error:", err.response?.data || err.message);
    return [];
  }
}