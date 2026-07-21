// F// Fetches jobs from HotNigerianJobs via Parse.bot, filtered by keyword

async function searchJobs(keyword) {
  const url = `https://api.parse.bot/scraper/${process.env.PARSE_SCRAPER_ID}/search_jobs?query=${encodeURIComponent(keyword)}`;

  const response = await fetch(url, {
    headers: { 'X-API-Key': process.env.PARSE_API_KEY }
  });

  const data = await response.json();
  const allJobs = data.data.jobs;

  const filtered = allJobs.filter(job =>
    job.title.toLowerCase().includes(keyword.toLowerCase())
  );

  return filtered;
}

module.exports = { searchJobs };
