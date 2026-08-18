const cloudscraper = require('cloudscraper');
cloudscraper.get('https://r.cimalight.co/watch.php?vid=c2c153303')
  .then(html => console.log(html.substring(0, 2000)))
  .catch(console.error);
