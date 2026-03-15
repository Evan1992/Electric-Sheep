const DOUBAN_API_URL = 'http://127.0.0.1:8000/crawl';

/**
 * Fetches a cover image for the given name from the local DoubanScraper service.
 * Returns a Buffer of the image bytes, or null if not found / on error.
 */
async function fetchCover(name) {
    const crawlRes = await fetch(DOUBAN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });

    const { images } = await crawlRes.json();
    const first = images?.[0];
    if (!first?.url) return null;

    console.log('[Douban] Fetching image from:', first.url, 'referer:', first.referer);
    const imgRes = await fetch(first.url, {
        headers: {
            'Referer': first.referer || 'https://www.douban.com/',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    console.log('[Douban] Image fetch status:', imgRes.status);
    return Buffer.from(await imgRes.arrayBuffer());
}

module.exports = { fetchCover };
