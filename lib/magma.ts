// lib/magma.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Volcano, VolcanoLevel } from './types';
import { getFallbackVolcanoes } from './volcanoes-static';

const MAGMA_URL = 'https://magma.esdm.go.id/v1/gunung-api/tingkat-aktivitas';

/**
 * Normalizes a volcano name to ensure accurate string matching.
 * E.g., "Gunung Merapi" -> "merapi"
 * E.g., "Kie Besi (Makian)" -> "kiebesi"
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^gunung\s+/, '') // Remove "gunung" prefix
    .replace(/^g\.\s+/, '')     // Remove "g." prefix
    .replace(/\s*\(.*\)\s*/g, '') // Remove parentheses and contents
    .replace(/[^a-z0-9]/g, '') // Keep only alphanumeric characters
    .trim();
}

interface ScrapedVolcano {
  name: string;
  level: VolcanoLevel;
  reportUrl: string;
}

/**
 * Scrapes the MAGMA ESDM website to get the latest activity levels of Indonesian volcanoes.
 * If scraping fails or the response is empty/intercepted, it falls back to static database.
 */
export async function fetchMagmaVolcanoes(): Promise<Volcano[]> {
  const staticVolcanoes = getFallbackVolcanoes();
  const scrapedVolcanoes: ScrapedVolcano[] = [];

  // Setup request configuration with a browser-like User-Agent to prevent bot-blocking
  const config = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
    timeout: 15000, // 15 seconds timeout
  };

  try {
    console.log(`[MAGMA Scraper] Fetching data from: ${MAGMA_URL}`);
    const response = await axios.get<string>(MAGMA_URL, config);

    if (!response.data || typeof response.data !== 'string' || response.data.trim() === '') {
      throw new Error('Empty response received from MAGMA ESDM.');
    }

    const html = response.data;
    const $ = cheerio.load(html);

    // Verify if this is the correct page and not a CAPTCHA or gateway block page
    const hasDaftar = html.includes('Daftar Tingkat Aktivitas') || html.includes('Tingkat Aktivitas');
    const tableExists = $('table.table').length > 0;

    if (!hasDaftar || !tableExists) {
      throw new Error('Response is malformed or intercepted. CAPTCHA/Gateway block suspected.');
    }

    let currentLevel: VolcanoLevel = VolcanoLevel.NORMAL;

    $('table.table tbody tr').each((_, element) => {
      const tds = $(element).find('td');
      if (tds.length === 0) return;

      // Check if this row establishes a new alert level
      const firstCellText = $(tds[0]).text().trim();

      if (firstCellText.includes('Level IV') || firstCellText.includes('Awas')) {
        currentLevel = VolcanoLevel.AWAS;
      } else if (firstCellText.includes('Level III') || firstCellText.includes('Siaga')) {
        currentLevel = VolcanoLevel.SIAGA;
      } else if (firstCellText.includes('Level II') || firstCellText.includes('Waspada')) {
        currentLevel = VolcanoLevel.WASPADA;
      } else if (firstCellText.includes('Level I') || firstCellText.includes('Normal')) {
        currentLevel = VolcanoLevel.NORMAL;
      }

      // If the row contains only 1 column, it represents a volcano item under the current level
      if (tds.length === 1) {
        const cell = $(tds[0]);
        const fullText = cell.text().trim(); // E.g., "Awu - Sulawesi Utara Lihat laporan"
        const link = cell.find('a').attr('href');

        // Extract the name part by splitting by "-" or " - "
        const parts = fullText.split(' - ');
        if (parts.length > 0) {
          const name = parts[0].trim();
          scrapedVolcanoes.push({
            name,
            level: currentLevel,
            reportUrl: link ? (link.startsWith('http') ? link : `https://magma.esdm.go.id${link}`) : 'https://magma.esdm.go.id/v1/gunung-api/laporan',
          });
        }
      }
    });

    console.log(`[MAGMA Scraper] Successfully scraped ${scrapedVolcanoes.length} volcanoes.`);

    // If the scraped list is empty, we probably failed to parse or got intercepted
    if (scrapedVolcanoes.length === 0) {
      throw new Error('No volcanoes could be parsed from the page. Gateway interception likely.');
    }

    // Merge scraped data with our complete static list
    const mergedVolcanoes: Volcano[] = staticVolcanoes.map((staticVolc) => {
      // Normalize the static volcano's name
      const normalizedStatic = normalizeName(staticVolc.name);

      // Find if this volcano was scraped
      const scraped = scrapedVolcanoes.find(
        (sv) => normalizeName(sv.name) === normalizedStatic
      );

      if (scraped) {
        return {
          ...staticVolc,
          level: scraped.level,
          reportUrl: scraped.reportUrl,
          lastReport: new Date().toISOString(), // Update timestamp to now
        };
      }

      // If not scraped, default it to normal (Level 1) or keep static default
      return {
        ...staticVolc,
        level: VolcanoLevel.NORMAL,
        lastReport: new Date().toISOString(),
      };
    });

    return mergedVolcanoes;

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[MAGMA Scraper] Error occurred: ${errorMessage}. Falling back to static data.`);

    // Graceful fallback to static data
    return staticVolcanoes.map((v) => ({
      ...v,
      lastReport: new Date().toISOString(), // Set timestamp to show it was refreshed using fallback
    }));
  }
}
