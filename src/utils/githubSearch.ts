import axios from "axios";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function searchGitHubProjects(query: string, maxResults = 2) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+in:name,description&sort=stars&order=desc&per_page=${maxResults}`;

  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json"
    }
  });

  return data.items.map((repo: any) => ({
    name: repo.full_name,
    url: repo.html_url
  }));
}