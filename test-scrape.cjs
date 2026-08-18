const cloudscraper = require('cloudscraper');
cloudscraper.get('https://r.cimalight.co/watch.php?vid=e982af3ff')
  .then(html => {
    const cheerio = require('cheerio');
    const $w = cheerio.load(html);
    console.log("description div text:", $w('.description').text());
    console.log("p rtl text:", $w('.description p[style*="direction: rtl"]').text());
    console.log("first p text:", $w('.description p').first().text());
  })
  .catch(console.error);
