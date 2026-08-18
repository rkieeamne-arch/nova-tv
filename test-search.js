import cloudscraper from 'cloudscraper';
async function test() {
  try {
    const responseHtml = await cloudscraper.post({
      url: 'https://r.cimalight.co/ajax-search.php',
      form: { queryString: 'batman' },
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 3000,
    });
    console.log("RESPONSE:", responseHtml);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
