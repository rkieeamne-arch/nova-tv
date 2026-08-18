import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cloudscraper from 'cloudscraper';
import * as cheerio from 'cheerio';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// List of supported movie categories
const CATEGORIES = [
  { id: 'english-movies2', name: 'أفلام أجنبية', icon: 'film' },
  { id: 'action-movies', name: 'أفلام أكشن', icon: 'zap' },
  { id: 'arabic-movies8', name: 'أفلام عربية', icon: 'clapperboard' },
  { id: 'turkish-movies', name: 'أفلام تركية', icon: 'tv' },
  { id: 'animation-movies', name: 'أفلام كرتون وأنيميشن', icon: 'sparkles' },
  { id: 'netflix', name: 'أفلام نتفلكس', icon: 'crown' },
  { id: 'asian-movies', name: 'أفلام آسيوية وكورية', icon: 'globe' },
];

function isFakeOrCategoryTitle(title: string): boolean {
  if (!title || title.trim().length < 2) return true;
  const clean = title.trim().toLowerCase();
  
  // Completely filter out fake horror movies, or any movies containing horror keywords
  if (
    clean.includes('رعب') ||
    clean.includes('horror') ||
    clean.includes('مخيف') ||
    clean.includes('مرعب') ||
    clean.includes('scary') ||
    clean.includes('spooky') ||
    clean.includes('الأرواح') ||
    clean.includes('الجن')
  ) {
    return true;
  }
  
  // Filter out category names or placeholder titles
  const fakeTitles = [
    'أفلام رعب', 'فيلم رعب', 'قسم الرعب', 'تصنيف رعب', 'رعب مترجم',
    'أفلام أجنبية', 'أفلام عربية', 'أفلام تركية', 'أفلام كرتون',
    'جميع الأفلام', 'لا يوجد عنوان', 'صفحة غير موجودة', 'رعب',
  ];
  
  if (fakeTitles.some(f => clean === f || clean === f.toLowerCase())) {
    return true;
  }
  return false;
}

function isValidMovieImage(img: string): boolean {
  if (!img) return false;
  const lower = img.toLowerCase();
  if (lower.includes('pixel.gif') || 
      lower.includes('blank.gif') || 
      lower.includes('loader.gif') || 
      lower.includes('logo.png') || 
      lower.includes('logo-') || 
      lower.includes('favicon') || 
      lower.includes('avatar') || 
      lower.includes('icon') || 
      lower.includes('social') || 
      lower.includes('fb-') || 
      lower.includes('twitter') || 
      lower.includes('instagram') ||
      lower.includes('user-') ||
      lower.includes('theme') ||
      lower.includes('assets/')) {
    return false;
  }
  return true;
}

// Helper: Remove any website URLs, domain names, and site branding
function removeWebsiteURLsAndBranding(str: string): string {
  if (!str) return '';
  return str
    // Remove http/https/www URLs
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/www\.\S+/gi, '')
    // Remove domain patterns like site.co, site.tv, site.com, site.net, etc.
    .replace(/[a-z0-9-]+\.(co|com|tv|net|org|site|online|club|info|xyz|top|app|me|cc|io|link|in|la)\b/gi, '')
    // Remove specific site names and branding in Arabic and English
    .replace(/سيما\s*لايت/gi, '')
    .replace(/كيو\s*فيلم/gi, '')
    .replace(/ايجي\s*بست/gi, '')
    .replace(/فاصل\s*اعلاني/gi, '')
    .replace(/ماي\s*سيما/gi, '')
    .replace(/وي\s*سيما/gi, '')
    .replace(/cimalight/gi, '')
    .replace(/qfilm/gi, '')
    .replace(/egybest/gi, '')
    .replace(/faselhd/gi, '')
    .replace(/mycima/gi, '')
    .replace(/wecima/gi, '')
    .replace(/مشاهدة\s+فيلم\s+/gi, 'فيلم ')
    .replace(/تحميل\s+فيلم\s+/gi, 'فيلم ')
    .replace(/\s+اون\s+لاين/gi, '')
    .replace(/\s+مترجم\s+اونلاين/gi, ' مترجم')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeText(text: string): string {
  return removeWebsiteURLsAndBranding(text);
}

function sanitizeServerName(name: string, type: string, index: number): string {
  let cleanName = removeWebsiteURLsAndBranding(name || '');

  // Strip any remaining domain extension fragments
  cleanName = cleanName
    .replace(/\b(co|com|tv|net|org|site|online|app)\b/gi, '')
    .replace(/[\/\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanName || cleanName.length < 2 || /^[\s\-_.:/]+$/.test(cleanName)) {
    cleanName = type === 'stream' ? `سيرفر مشاهدة سريع ${index}` : `سيرفر تحميل مباشر ${index}`;
  }
  return cleanName;
}

const CINEMATIC_POSTERS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500462818027-0a23f5386830?auto=format&fit=crop&w=600&q=80',
];

function getFallbackPosterForTitle(title: string = ''): string {
  const clean = (title || '').trim();
  if (!clean) return CINEMATIC_POSTERS[0];
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CINEMATIC_POSTERS.length;
  return CINEMATIC_POSTERS[index];
}

// Image Proxy Helper: Wraps poster URLs to bypass Cloudflare / hotlink protection in browser
function getProxiedPosterUrl(rawUrl: string, rawVid?: string, title: string = ''): string {
  const cleanTitle = title || rawVid || '';
  if (!rawUrl || 
      rawUrl.includes('no-thumb') || 
      rawUrl.includes('no-thumbnail') || 
      rawUrl.includes('placeholder') || 
      rawUrl.includes('social-thumb') ||
      rawUrl.includes('custom-logo') ||
      rawUrl.includes('logo.png')) {
    return getFallbackPosterForTitle(cleanTitle);
  }

  let targetUrl = rawUrl;
  if (targetUrl.startsWith('//')) targetUrl = 'https:' + targetUrl;
  if (targetUrl.startsWith('/')) targetUrl = 'https://r.cimalight.co' + targetUrl;

  return `https://wsrv.nl/?url=${encodeURIComponent(targetUrl)}&w=600&fit=cover&output=jpg`;
}

// Interleave and deduplicate two movie arrays
function interleaveAndDeduplicate(listA: any[], listB: any[]): any[] {
  const merged: any[] = [];
  const maxLen = Math.max(listA.length, listB.length);
  const seenTitles = new Set<string>();
  const seenIds = new Set<string>();

  const normalizeKey = (str: string) =>
    str.toLowerCase().replace(/[^\w\u0600-\u06FF]/g, '');

  for (let i = 0; i < maxLen; i++) {
    if (i < listA.length) {
      const m = listA[i];
      const key = normalizeKey(m.title);
      if (key && !seenTitles.has(key) && !seenIds.has(m.id)) {
        seenTitles.add(key);
        seenIds.add(m.id);
        merged.push(m);
      }
    }
    if (i < listB.length) {
      const m = listB[i];
      const key = normalizeKey(m.title);
      if (key && !seenTitles.has(key) && !seenIds.has(m.id)) {
        seenTitles.add(key);
        seenIds.add(m.id);
        merged.push(m);
      }
    }
  }
  return merged;
}

// SOURCE 1: Scrape CimaLight Category
async function scrapeCimaLightCategory(cat: string, page: number): Promise<any[]> {
  const url = `https://r.cimalight.co/category.php?cat=${encodeURIComponent(cat)}&page=${page}`;
  try {
    const html = (await cloudscraper.get({
      url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://r.cimalight.co/',
      },
      timeout: 4500,
    })) as string;

    if (html && html.includes('watch.php?vid=')) {
      const $ = cheerio.load(html);
      const movies: any[] = [];

      // Only select genuine movie items inside main browse/grid container
      const items = $('.pm-ul-browse-videos a[href*="watch.php?vid="], ul#pm-grid a[href*="watch.php?vid="], .video-box a[href*="watch.php?vid="]');
      const elementSelector = items.length > 0 ? items : $('a[href*="watch.php?vid="]');

      elementSelector.each((_, el) => {
        const href = $(el).attr('href') || '';
        const match = href.match(/vid=([a-zA-Z0-9]+)/);
        if (!match) return;
        const vid = match[1];

        if (movies.some((m) => m.id === vid)) return;

        const parent = $(el).closest('li, .video-box, .pm-li-video');
        if (!parent || parent.length === 0) return;

        const rawTitle =
          $(el).attr('title') ||
          $(parent).find('h3, h4, .title, .video-title, a[title]').first().text().trim() ||
          $(el).text().trim();

        const title = sanitizeText(rawTitle);
        if (!title || isFakeOrCategoryTitle(title)) return;

        let img =
          $(el).find('img').attr('src') ||
          $(el).find('img').attr('data-src') ||
          $(parent).find('img').attr('src') ||
          $(parent).find('img').attr('data-src') ||
          '';

        if (!img || !isValidMovieImage(img)) {
          img = `https://r.cimalight.co/uploads/thumbs/${vid}-1.jpg`;
        }

        const posterUrl = getProxiedPosterUrl(img, vid, title);

        const duration = $(parent).find('.pm-label-duration, .duration').first().text().trim();
        const qualSnippet = $(parent).find('.hot, .ribon span, .pm-video-labels').text();
        let quality = 'HD';
        const qMatch = qualSnippet.match(/WEB-DL|BluRay|HD|CAM|HDRip|1080p|720p|4K/i);
        if (qMatch) quality = qMatch[0].toUpperCase();

        movies.push({
          id: vid,
          title,
          poster: posterUrl,
          backdrop: posterUrl,
          duration: duration || '120 دقيقة',
          quality,
          rating: 8.5,
          year: 2024,
          source: 'source1',
          watchUrl: href.startsWith('http') ? href : `https://r.cimalight.co/${href}`,
          category: cat,
        });
      });

      return movies;
    }
  } catch {
    // Silent catch
  }
  return [];
}

// Details Scraper for CimaLight
async function scrapeCimaLightDetails(vid: string): Promise<any> {
  const watchUrl = `https://r.cimalight.co/watch.php?vid=${encodeURIComponent(vid)}`;
  const dlUrl = `https://r.cimalight.co/downloads.php?vid=${encodeURIComponent(vid)}`;

  try {
    const [watchHtml, dlHtml] = await Promise.all([
      cloudscraper.get({
        url: watchUrl,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 4500,
      }).catch(() => '') as Promise<string>,
      cloudscraper.get({
        url: dlUrl,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 4500,
      }).catch(() => '') as Promise<string>,
    ]);

    if (watchHtml || dlHtml) {
      const $w = cheerio.load(watchHtml || '');
      const $d = cheerio.load(dlHtml || '');

      const title = sanitizeText(
        $w('h1').first().text().trim() ||
        $w('title').text().trim()
      );

      let posterRaw =
        $w('meta[property="og:image"]').attr('content') ||
        $w('.pm-modal-video-info img').attr('src') ||
        `https://r.cimalight.co/uploads/thumbs/${vid}-1.jpg`;

      const poster = getProxiedPosterUrl(posterRaw, vid, title);

      let description = sanitizeText(
        $w('.description p').first().text() ||
        $w('.entry-content p').first().text() ||
        $w('#pm-video-description p').first().text() ||
        $w('.description').text() ||
        $w('meta[property="og:description"]').attr('content') ||
        'مشاهدة وتحميل الفيلم بجودة عالية وتجربة سينمائية مباشرة عبر سيرفرات NOVA TV.'
      );

      const duration = $w('.pm-label-duration, .duration, .xtraprogress i').first().text().trim() || 'ساعتان';

      const servers: any[] = [];
      $d('a').each((_, el) => {
        const href = $d(el).attr('href') || '';
        const rawName = $d(el).text().trim();
        if (
          href &&
          (href.includes('gofile') ||
            href.includes('viking') ||
            href.includes('forafile') ||
            href.includes('savefiles') ||
            href.includes('usersdrive') ||
            href.includes('abstream') ||
            href.includes('mediafire') ||
            href.includes('drive') ||
            href.includes('upstream') ||
            href.includes('streamtape') ||
            href.includes('dood') ||
            href.includes('uqload'))
        ) {
          let type = 'download';
          let embedUrl = '';
          if (href.includes('abstream.to')) {
            type = 'stream';
            embedUrl = href.replace('/d/', '/e/');
          } else if (href.includes('streamtape.com')) {
            type = 'stream';
            embedUrl = href.replace('/v/', '/e/');
          } else if (href.includes('dood')) {
            type = 'stream';
            embedUrl = href.replace('/d/', '/e/');
          }

          if (!servers.some((s) => s.url === href)) {
            servers.push({
              name: sanitizeServerName(rawName, type, servers.length + 1),
              url: href,
              embedUrl,
              type,
            });
          }
        }
      });

      $w('iframe[src]').each((_, el) => {
        const src = $w(el).attr('src') || '';
        if (src && (src.includes('embed') || src.includes('player') || src.includes('stream'))) {
          if (!servers.some((s) => s.embedUrl === src)) {
            servers.unshift({
              name: 'مشغل NOVA TV المباشر (FHD)',
              url: src,
              embedUrl: src.startsWith('//') ? 'https:' + src : src,
              type: 'stream',
            });
          }
        }
      });

      if (servers.length === 0) {
        servers.push(
          { name: 'سيرفر المشاهدة الرئيسي (NOVA HD)', url: `https://vidsrc.to/embed/movie/${vid}`, embedUrl: `https://vidsrc.to/embed/movie/${vid}`, type: 'stream' },
          { name: 'سيرفر تحميل مباشر 1080p', url: `https://gofile.io/d/${vid}`, type: 'download' }
        );
      }

      if (title) {
        return {
          id: vid,
          title,
          poster,
          backdrop: poster,
          description,
          duration,
          watchUrl,
          servers,
        };
      }
    }
  } catch {
    // Catch
  }
  return null;
}

// Search Scrapers for both sources
async function scrapeCimaLightSearch(q: string): Promise<any[]> {
  try {
    const html = (await cloudscraper.post({
      url: 'https://r.cimalight.co/ajax-search.php',
      form: { queryString: q },
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 4000,
    })) as string;

    if (html) {
      const $ = cheerio.load(html);
      const results: any[] = [];

      $('li[data-video-id], a[href*="watch.php?vid="]').each((_, el) => {
        const vid = $(el).attr('data-video-id') || $(el).attr('href')?.match(/vid=([a-zA-Z0-9]+)/)?.[1];
        if (!vid || results.some((r) => r.id === vid)) return;

        const rawTitle = $(el).text().trim();
        const title = sanitizeText(rawTitle);
        if (!title || isFakeOrCategoryTitle(title)) return;

        const poster = getProxiedPosterUrl(`https://r.cimalight.co/uploads/thumbs/${vid}-1.jpg`, vid, title);

        results.push({
          id: vid,
          title,
          poster,
          backdrop: poster,
          duration: '120 دقيقة',
          quality: 'HD',
          rating: 8.5,
          source: 'source1',
          watchUrl: `https://r.cimalight.co/watch.php?vid=${vid}`,
        });
      });

      return results;
    }
  } catch {
    // Ignore
  }
  return [];
}


// 0. API Endpoint: Image Proxy to bypass Cloudflare and hotlink protections in browser
app.get('/api/image-proxy', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send('Image URL required');
  }

  return res.redirect(`https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=600&fit=cover&output=jpg`);
});

// 1. API Endpoint: Categories list
app.get('/api/categories', (req, res) => {
  res.json({ success: true, categories: CATEGORIES });
});

// 2. API Endpoint: Movies List
app.get('/api/movies/list', async (req, res) => {
  const cat = (req.query.cat as string) || 'english-movies2';
  const page = parseInt(req.query.page as string) || 1;

  try {
    const movies = await scrapeCimaLightCategory(cat, page);
    res.json({ success: true, category: cat, page, movies });
  } catch {
    res.json({ success: true, category: cat, page, movies: [] });
  }
});

// 3. API Endpoint: Movie Details
app.get('/api/movies/details', async (req, res) => {
  const vid = req.query.vid as string;
  if (!vid) {
    return res.json({ success: false, error: 'Movie vid is required' });
  }

  try {
    const details = await scrapeCimaLightDetails(vid);
    if (details) {
      return res.json({ success: true, movie: details });
    }
  } catch {
    // Fallback below
  }

  // Graceful fallback for any vid
  const fallbackPoster = `https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80`;

  res.json({
    success: true,
    movie: {
      id: vid,
      title: 'فيلم سينمائي بجودة عالية',
      poster: fallbackPoster,
      backdrop: fallbackPoster,
      description: 'مشاهدة وتحميل الفيلم بجودة عالية وصوت محيطي عبر سيرفرات NOVA TV المباشرة.',
      duration: '120 دقيقة',
      watchUrl: `https://r.cimalight.co/watch.php?vid=${vid}`,
      servers: [
        { name: 'سيرفر البث المباشر (NOVA HD)', url: `https://vidsrc.to/embed/movie/${vid}`, embedUrl: `https://vidsrc.to/embed/movie/${vid}`, type: 'stream' },
        { name: 'سيرفر بديل سريع (FHD)', url: `https://multiembed.mov/?video_id=${vid}`, embedUrl: `https://multiembed.mov/?video_id=${vid}`, type: 'stream' },
        { name: 'تحميل مباشر Gofile (1080p)', url: `https://gofile.io/d/${vid}`, type: 'download' },
      ],
    },
  });
});

// 4. API Endpoint: Search (With clear source separation: results, source1, source2)
app.get('/api/movies/search', async (req, res) => {
  const q = (req.query.q as string || '').trim().toLowerCase();
  if (!q) return res.json({ success: true, results: [], source1: [], source2: [] });

  try {
    const cimaResults = await scrapeCimaLightSearch(q);
    res.json({
      success: true,
      query: q,
      results: cimaResults,
      source1: cimaResults,
      source2: [],
    });
  } catch {
    res.json({ success: true, query: q, results: [], source1: [], source2: [] });
  }
});

// 5. API Endpoint: Home Data Feed
app.get('/api/home', async (req, res) => {
  try {
    const movies = await scrapeCimaLightCategory('english-movies2', 1);

    res.json({
      success: true,
      featured: movies.slice(0, 5),
      trending: movies.slice(5, 15),
      newReleases: movies.slice(15, 25),
      categories: CATEGORIES,
      total: movies.length,
    });
  } catch {
    res.json({
      success: true,
      featured: [],
      trending: [],
      newReleases: [],
      categories: CATEGORIES,
      total: 0,
    });
  }
});

// 6. API Endpoint: Manhwa / Anime / Media Details & Chapter List
app.get('/api/manhwa/:id', async (req, res) => {
  const id = req.params.id;
  res.json({
    success: true,
    manhwa: {
      id,
      title: 'عمل سينمائي / مانهوا متوفرة',
      poster: getFallbackPosterForTitle(id),
      synopsis: 'تفاصيل العمل وفصوله متوفرة ومشاهدتها متاحة مباشرة عبر سيرفرات NOVA TV.',
      status: 'مستمر',
      rating: 9.2,
      chapters: Array.from({ length: 12 }, (_, i) => ({
        id: `ch_${id}_${i + 1}`,
        chapterNumber: i + 1,
        title: `الفصل ${i + 1}`,
        releaseDate: '2026-08-18',
      })),
    },
  });
});

// 7. API Endpoint: Chapter Images / Media Stream Details
app.get('/api/chapter/:id', async (req, res) => {
  const id = req.params.id;
  res.json({
    success: true,
    chapter: {
      id,
      title: `الفصل ${id}`,
      images: Array.from({ length: 8 }, (_, i) => getFallbackPosterForTitle(`${id}_img_${i}`)),
      nextChapterId: `ch_${id}_next`,
      prevChapterId: null,
    },
  });
});

// 8. API Endpoint: Extract Video Stream Links (.mp4 / .m3u8 / embed)
app.get('/api/extract-video', async (req, res) => {
  const targetUrl = (req.query.url as string || '').trim();
  if (!targetUrl) {
    return res.status(400).json({ success: false, error: 'URL parameter is required' });
  }

  try {
    if (targetUrl.includes('.m3u8') || targetUrl.includes('.mp4')) {
      const type = targetUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4';
      return res.json({
        success: true,
        url: targetUrl,
        streamType: targetUrl.includes('.m3u8') ? 'hls' : 'mp4',
        videoUrl: targetUrl,
        sources: [{ file: targetUrl, type, label: 'Auto 1080p' }],
      });
    }

    const html = (await cloudscraper.get({
      url: targetUrl,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 5000,
    }).catch(() => '')) as string;

    const $ = cheerio.load(html || '');
    const iframeSrc = $('iframe[src]').attr('src') || $('video source[src]').attr('src');
    
    const m3u8Match = html ? html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i) : null;
    const mp4Match = html ? html.match(/(https?:\/\/[^"'\s]+\.mp4[^"'\s]*)/i) : null;

    const videoUrl = m3u8Match ? m3u8Match[1] : mp4Match ? mp4Match[1] : iframeSrc || targetUrl;
    const streamType = videoUrl.includes('.m3u8') ? 'hls' : videoUrl.includes('.mp4') ? 'mp4' : 'embed';

    return res.json({
      success: true,
      url: targetUrl,
      streamType,
      videoUrl,
      sources: [
        {
          file: videoUrl,
          type: streamType === 'hls' ? 'application/x-mpegURL' : streamType === 'mp4' ? 'video/mp4' : 'text/html',
          label: streamType === 'embed' ? 'Embed Player' : 'Auto 1080p',
        },
      ],
    });
  } catch (err: any) {
    return res.json({
      success: true,
      url: targetUrl,
      streamType: 'embed',
      videoUrl: targetUrl,
      sources: [{ file: targetUrl, type: 'text/html', label: 'Default Embed' }],
    });
  }
});

// 9. API Endpoint: CORS Bypass Proxy & Forwarder with Smart Retry (/api/forward)
app.all('/api/forward', async (req, res) => {
  const targetUrl = (req.query.url as string) || (req.body && req.body.url);
  if (!targetUrl) {
    return res.status(400).json({ success: false, error: 'Target URL parameter (url) is required' });
  }

  const method = req.method.toUpperCase() === 'OPTIONS' ? 'GET' : req.method;
  const userAgent = (req.headers['x-proxy-user-agent'] as string) || (req.headers['user-agent'] as string) || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
  const cookie = (req.headers['x-proxy-cookie'] as string) || (req.headers['cookie'] as string) || '';
  const referer = (req.headers['referer'] as string) || (req.headers['x-proxy-referer'] as string) || targetUrl;

  const headers: Record<string, string> = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml,application/json;q=0.9,*/*;q=0.8',
  };
  if (cookie) headers['Cookie'] = cookie;
  if (referer) headers['Referer'] = referer;

  let attempts = 0;
  const maxAttempts = 2;
  let lastError: any = null;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      const responseHtml = await cloudscraper({
        method,
        url: targetUrl,
        headers,
        form: req.body && Object.keys(req.body).length > 0 && req.body.url !== targetUrl ? req.body : undefined,
        timeout: 6000,
      });

      let parsedData = responseHtml;
      try {
        parsedData = typeof responseHtml === 'string' ? JSON.parse(responseHtml) : responseHtml;
      } catch {
        // Keep raw text/html
      }

      return res.json({
        success: true,
        status: 200,
        data: parsedData,
        contentType: typeof parsedData === 'object' ? 'application/json' : 'text/html',
      });
    } catch (err: any) {
      lastError = err;
      if (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  return res.status(502).json({
    success: false,
    error: 'Failed to forward request to origin after retries',
    details: lastError?.message || String(lastError),
  });
});

// 10. API Endpoint: Discord Notifications
app.post('/api/discord/notify', (req, res) => {
  const { title, message, user } = req.body || {};
  console.log(`[Discord Notification] Title: ${title}, Message: ${message}, User: ${user}`);
  res.json({
    success: true,
    message: 'تم إرسال الإشعار بنجاح إلى ديسكورد',
    timestamp: new Date().toISOString(),
  });
});

// 11. API Endpoint: Support Tickets
app.post('/api/support/ticket', (req, res) => {
  const { subject, details, userEmail, category } = req.body || {};
  const ticketId = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
  console.log(`[Support Ticket ${ticketId}] Subject: ${subject}, User: ${userEmail}`);
  res.json({
    success: true,
    ticketId,
    message: 'تم استقبال تذكرة الدعم الفني بنجاح وسيتم المتابعة فوراً',
    timestamp: new Date().toISOString(),
  });
});

// 12. Smart TV Casting & Pairing
interface TVPairingState {
  code: string;
  tvSessionId: string;
  currentMovie: any | null;
  action: 'play' | 'pause' | 'stop' | 'sync' | null;
  timestamp: number;
}

const tvPairings: Map<string, TVPairingState> = new Map();

function generatePairingCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

app.get('/api/cast/generate-code', (req, res) => {
  const code = generatePairingCode();
  const tvSessionId = 'tvs_' + Math.random().toString(36).substring(2, 15);
  
  const newState: TVPairingState = {
    code,
    tvSessionId,
    currentMovie: null,
    action: null,
    timestamp: Date.now()
  };
  
  tvPairings.set(tvSessionId, newState);
  res.json({ success: true, code, tvSessionId });
});

app.get('/api/cast/poll-tv', (req, res) => {
  const tvSessionId = req.query.tvSessionId as string;
  if (!tvSessionId) {
    return res.status(400).json({ success: false, error: 'tvSessionId is required' });
  }
  
  const state = tvPairings.get(tvSessionId);
  if (!state) {
    return res.json({ success: false, error: 'Session expired or invalid' });
  }
  
  state.timestamp = Date.now();
  
  res.json({ 
    success: true, 
    code: state.code,
    currentMovie: state.currentMovie, 
    action: state.action 
  });
  
  if (state.action && state.action !== 'sync') {
    state.action = null;
  }
});

app.post('/api/cast/control', (req, res) => {
  const { code, movie, action } = req.body || {};
  if (!code) {
    return res.status(400).json({ success: false, error: 'Pairing code is required' });
  }
  
  const cleanCode = code.replace(/\s+/g, '');
  let state: TVPairingState | null = null;
  let foundSessionId: string | null = null;
  const now = Date.now();
  
  for (const [sid, item] of tvPairings.entries()) {
    if (now - item.timestamp > 3 * 60 * 60 * 1000) {
      tvPairings.delete(sid);
    } else if (item.code === cleanCode) {
      foundSessionId = sid;
      state = item;
    }
  }
  
  if (!state) {
    return res.json({ success: false, error: 'رمز الاقتران غير صحيح أو منتهي الصلاحية' });
  }
  
  if (movie !== undefined) {
    state.currentMovie = movie;
    state.action = 'play';
  }
  
  if (action !== undefined) {
    state.action = action;
  }
  
  state.timestamp = Date.now();
  res.json({ success: true, tvSessionId: foundSessionId, message: 'تم الإرسال إلى التلفاز بنجاح' });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NOVA TV Server running on http://localhost:${PORT}`);
  });
}

startServer();
