const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://localhost:8137';
const OUT = process.env.OUT || __dirname;

(async () => {
  const browser = await chromium.launch();

  // --- Poster: the full schedule table from the real page, cleaned up. ---
  const poster = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
    deviceScaleFactor: 2,
  });
  await poster.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  await poster.waitForSelector('#karaoke-rows td.venue a');
  await poster.evaluate(() => {
    // Drop interactive controls and warnings.
    ['#data-warnings', '#search', '#no-results'].forEach((sel) => {
      document.querySelector(sel)?.remove();
    });
    // Drop the notice and footer links, but keep the "last updated" line.
    document.querySelectorAll('.container > p').forEach((p) => {
      if (p.id !== 'last-updated') p.remove();
    });
    // Un-clip the table so every row is captured.
    const scroll = document.querySelector('.table-scroll');
    if (scroll) {
      scroll.style.maxHeight = 'none';
      scroll.style.overflow = 'visible';
    }
    document.body.style.background = '#fff';
  });
  await poster.locator('.container').screenshot({ path: path.join(OUT, 'poster.png') });

  // --- Cover: fixed Facebook-cover banner (1640x624 @2x). ---
  const cover = await browser.newPage({
    viewport: { width: 820, height: 312 },
    deviceScaleFactor: 2,
  });
  await cover.goto(`${BASE}/image/cover.html`, { waitUntil: 'networkidle' });
  await cover.waitForSelector('.cover.ready');
  await cover.screenshot({ path: path.join(OUT, 'cover.png') });

  await browser.close();
  console.log('Wrote poster.png and cover.png');
})();
