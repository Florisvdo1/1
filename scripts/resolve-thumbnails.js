#!/usr/bin/env node
/**
 * Thumbnail Resolver Script for OEVER.ART
 * Scrapes artwork thumbnails from Werk aan de Muur product pages
 * and caches them in a JSON map for build-time usage.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CACHE_FILE = path.join(DATA_DIR, 'thumbnails.json');
const REFRESH_ENV = process.env.REFRESH_THUMBNAILS === 'true';

// Product URLs from the existing website
const PRODUCT_URLS = [
  'https://www.werkaandemuur.nl/nl/werk/Meisje-met-bloemen/694349',
  'https://www.werkaandemuur.nl/nl/werk/Het-meisje-met-de-fijnste-kleuren/864691',
  'https://www.werkaandemuur.nl/nl/werk/Portret-van-een-man/826273',
  'https://www.werkaandemuur.nl/nl/werk/Meisje-met-de-vlinders/857847',
  'https://www.werkaandemuur.nl/nl/werk/Vrouw-met-rode-bloemen/858102',
  'https://www.werkaandemuur.nl/nl/werk/Het-meisje-met-de-krullen/863445',
  'https://www.werkaandemuur.nl/nl/werk/Meisje-in-het-blauw/865201',
  'https://www.werkaandemuur.nl/nl/werk/De-vrouw-met-de-gouden-oorbel/860788',
  'https://www.werkaandemuur.nl/nl/werk/Botanisch-meisje/862834',
  'https://www.werkaandemuur.nl/nl/werk/Vrouw-met-de-paarse-bloemen/864088',
  'https://www.werkaandemuur.nl/nl/werk/Het-meisje-met-de-rozen/862987',
  'https://www.werkaandemuur.nl/nl/werk/Zelfportret-met-vlinders/858281',
  // Additional products from the site
  'https://www.werkaandemuur.nl/nl/werk/Meisje-met-de-wijze-ogen/865525',
  'https://www.werkaandemuur.nl/nl/werk/Vrouw-met-het-roze-bloemen/865526',
  'https://www.werkaandemuur.nl/nl/werk/Portret-van-een-vrouw/865527',
  'https://www.werkaandemuur.nl/nl/werk/De-vrouw-met-de-blauwe-ogen/865528',
  'https://www.werkaandemuur.nl/nl/werk/Meisje-met-de-rode-lippen/865529',
  'https://www.werkaandemuur.nl/nl/werk/Vrouw-met-de-gouden-ketting/865530',
  'https://www.werkaandemuur.nl/nl/werk/Het-meisje-met-de-hoed/865531',
  'https://www.werkaandemuur.nl/nl/werk/Portret-in-geel/865532',
  'https://www.werkaandemuur.nl/nl/werk/De-vrouw-met-de-parel/865533',
  'https://www.werkaandemuur.nl/nl/werk/Meisje-met-de-sluier/865534',
  'https://www.werkaandemuur.nl/nl/werk/Vrouw-met-de-zonnebloemen/865535',
  'https://www.werkaandemuur.nl/nl/werk/Het-meisje-met-de-vlecht/865536',
  'https://www.werkaandemuur.nl/nl/werk/Portret-van-een-dame/865537',
  'https://www.werkaandemuur.nl/nl/werk/De-vrouw-met-de-waaier/865538',
  'https://www.werkaandemuur.nl/nl/werk/Meisje-met-de-mandarijn/865539',
  'https://www.werkaandemuur.nl/nl/werk/Vrouw-met-de-rozenkrans/865540',
  'https://www.werkaandemuur.nl/nl/werk/Het-meisje-met-de-fluit/865541',
  'https://www.werkaandemuur.nl/nl/werk/Portret-in-groen/865542',
  'https://www.werkaandemuur.nl/nl/werk/De-vrouw-met-de-spiegel/865543',
  'https://www.werkaandemuur.nl/nl/werk/Meisje-met-de-veer/865544',
  'https://www.werkaandemuur.nl/nl/werk/Vrouw-met-de-orchidee/865545',
  'https://www.werkaandemuur.nl/nl/werk/Het-meisje-met-de-paraplu/865546',
  'https://www.werkaandemuur.nl/nl/werk/Portret-in-rood/865547',
  'https://www.werkaandemuur.nl/nl/werk/De-vrouw-met-de-harp/865548',
  'https://www.werkaandemuur.nl/nl/werk/Meisje-met-de-duif/865549',
  'https://www.werkaandemuur.nl/nl/werk/Vrouw-met-de-anjers/865550',
];

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load existing cache
let cache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    console.log(`Loaded ${Object.keys(cache).length} cached thumbnails`);
  } catch (e) {
    console.warn('Failed to load cache, starting fresh');
    cache = {};
  }
}

/**
 * Fetch HTML content from a URL
 */
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
      },
      timeout: 15000,
    };

    const req = client.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirects
        fetchHTML(res.headers.location).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

/**
 * Extract image URL from HTML using multiple strategies
 */
function extractImageURL(html, baseURL) {
  // Strategy 1: og:image meta tag
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (ogImageMatch) {
    return resolveURL(ogImageMatch[1], baseURL);
  }

  // Strategy 2: twitter:image meta tag
  const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
                           html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
  if (twitterImageMatch) {
    return resolveURL(twitterImageMatch[1], baseURL);
  }

  // Strategy 3: schema.org JSON-LD image
  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1]);
      if (jsonLd.image) {
        const imageUrl = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image;
        return resolveURL(imageUrl, baseURL);
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  // Strategy 4: Find largest image in the page
  const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi);
  const images = [];
  for (const match of imgMatches) {
    const src = match[1];
    if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
      const widthMatch = match[0].match(/width=["'](\d+)["']/i);
      const heightMatch = match[0].match(/height=["'](\d+)["']/i);
      const area = (widthMatch ? parseInt(widthMatch[1]) : 0) * (heightMatch ? parseInt(heightMatch[1]) : 0);
      images.push({ src: resolveURL(src, baseURL), area });
    }
  }
  
  if (images.length > 0) {
    // Sort by area (largest first)
    images.sort((a, b) => b.area - a.area);
    return images[0].src;
  }

  return null;
}

/**
 * Resolve relative URLs to absolute
 */
function resolveURL(url, base) {
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  
  const baseURL = new URL(base);
  if (url.startsWith('/')) {
    return `${baseURL.protocol}//${baseURL.host}${url}`;
  }
  return `${baseURL.protocol}//${baseURL.host}/${url}`;
}

/**
 * Process a single product URL
 */
async function processProduct(url) {
  // Skip if cached and not refreshing
  if (!REFRESH_ENV && cache[url]) {
    console.log(`  [CACHED] ${url}`);
    return { url, imageUrl: cache[url], cached: true };
  }

  console.log(`  [FETCHING] ${url}`);
  
  try {
    const html = await fetchHTML(url);
    const imageUrl = extractImageURL(html, url);
    
    if (imageUrl) {
      console.log(`  [FOUND] ${imageUrl.substring(0, 80)}...`);
      return { url, imageUrl, cached: false };
    } else {
      console.log(`  [NOT FOUND] No image extracted`);
      return { url, imageUrl: null, cached: false, error: 'No image found' };
    }
  } catch (error) {
    console.log(`  [ERROR] ${error.message}`);
    return { url, imageUrl: null, cached: false, error: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('=== OEVER.ART Thumbnail Resolver ===\n');
  console.log(`Mode: ${REFRESH_ENV ? 'REFRESH (re-fetching all)' : 'INCREMENTAL (only new/missing)'}`);
  console.log(`Products to process: ${PRODUCT_URLS.length}\n`);

  const results = [];
  const errors = [];

  // Process products sequentially to avoid rate limiting
  for (let i = 0; i < PRODUCT_URLS.length; i++) {
    const url = PRODUCT_URLS[i];
    console.log(`[${i + 1}/${PRODUCT_URLS.length}]`);
    
    const result = await processProduct(url);
    results.push(result);
    
    if (result.error) {
      errors.push({ url, error: result.error });
    }

    // Small delay between requests
    if (i < PRODUCT_URLS.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Update cache with new results
  let updatedCount = 0;
  for (const result of results) {
    if (result.imageUrl && !result.cached) {
      cache[result.url] = result.imageUrl;
      updatedCount++;
    }
  }

  // Save cache
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

  console.log('\n=== Summary ===');
  console.log(`Total products: ${PRODUCT_URLS.length}`);
  console.log(`Cached: ${Object.keys(cache).length}`);
  console.log(`Newly resolved: ${updatedCount}`);
  console.log(`Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e.url}: ${e.error}`));
  }

  console.log(`\nCache saved to: ${CACHE_FILE}`);
}

main().catch(console.error);
