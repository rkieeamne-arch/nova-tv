import cloudscraper from 'cloudscraper';
async function test() {
  try {
    const responseHtml = await cloudscraper.get({
      url: 'https://r.cimalight.co/search.php?keywords=' + encodeURIComponent('batman'),
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 3000,
    });
    console.log("RESPONSE:", responseHtml.substring(0, 500));
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
