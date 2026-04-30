import * as cheerio from 'cheerio';
import { JOB_DESCRIPTION_MAX_CHARS, SCRAPE_TIMEOUT_MS } from '@/lib/constants';

export async function scrapeJobUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $('script, style, nav, header, footer, aside, [role="navigation"]').remove();

    const selectors = [
      '[class*="job-description"]',
      '[class*="jobDescription"]',
      '[id*="job-description"]',
      '[id*="jobDescription"]',
      '[class*="description"]',
      'article',
      'main',
      '.content',
      '#content',
      'body',
    ];

    let text = '';
    for (const selector of selectors) {
      const el = $(selector).first();
      if (el.length) {
        text = el.text();
        if (text.trim().length > 200) break;
      }
    }

    text = text
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, JOB_DESCRIPTION_MAX_CHARS);

    if (text.length < 100) {
      throw new Error('Insufficient content extracted');
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}
