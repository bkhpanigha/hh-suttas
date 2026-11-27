const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Retry logic
const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

(async () => {
  // Set up an Express server
  const app = express();
  const port = 3000;
  app.use(express.static('.')); // Serve files from a directory
  const server = app.listen(port);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  // Helper functions for different tests
  async function testHomePage() {
    await page.goto(`http://localhost:${port}/`);
    await page.waitForSelector('#sutta a[href="/?q=mn1"]');

    // Test for element with ID 'sutta'
    const sutta = await page.$('#sutta');
    if (!sutta) throw new Error('Element with ID "sutta" not found');

    // Test for the MN 1 card
    const text = await page.$eval('#sutta a[href="/?q=mn1"] .sutta-title', (el) => el.textContent);
    if (!text.startsWith('MN 1 ')) throw new Error(`Unexpected MN 1 card title: ${text}`);
  }

  async function testSuttaPage() {
    await page.goto(`http://localhost:${port}/?q=mn1`);
    await page.waitForSelector('#mn1', { timeout: 1000 });

    // Test for element with ID 'mn1'
    const mn1Element = await page.$('#mn1');
    if (!mn1Element) throw new Error('Element with ID "mn1" not found');

    // Test if the mn1 element contains <p> tags
    const pTagsExist = await mn1Element.$$eval('p', (pTags) => pTags.length > 0);
    if (!pTagsExist) throw new Error('<p> tags under #mn1 not found');

    // Test for comments
    const commentsExist = await mn1Element.$$eval('.comment-text', (comments) =>
      comments.every((comment) => comment.style.display === 'none')
    );
    if (!commentsExist) throw new Error('Comments with class "comment-text" not found or not hidden');
  }

  async function testFilter(query, expectedCitation) {
    await page.goto(`http://localhost:${port}/`);
    await page.waitForSelector('#sutta a[href="/?q=mn1"]'); // the filter is wired once the library is shown
    await page.type('#filter-bar', query);
    await page.waitForSelector(`#sutta li.sutta-card a[href="/?q=${expectedCitation}"]`, { timeout: 3000 });
  }

  async function testAllCacheFilesReachable(jsonFilePath) {
    // The server is static, so a file is reachable exactly when it exists
    const missing = JSON.parse(fs.readFileSync(jsonFilePath)).filter((f) => !fs.existsSync(f));
    if (missing.length) throw new Error(`Missing cache files: ${missing.join(', ')}`);
  }
  async function testBookmarkLabelCreation() {
    await page.goto(`http://localhost:${port}/bookmarks.html`);

    const newLabel = 'testLabel';
    await page.type('#newLabelInput', newLabel);
    await page.click('#createLabelButton');

    // Wait for the new label to appear in the bookmarks
    await page.waitForFunction(
      (label) => {
        const bookmarks = document.querySelector('#bookmarksList');
        if (!bookmarks) return false;
        const summaryTags = bookmarks.querySelectorAll('summary.bookmark-text');
        return [...summaryTags].some((summary) => summary.textContent.includes(label));
      },
      {},
      newLabel
    );

    const labelExists = await page.evaluate((label) => {
      const bookmarks = document.querySelector('#bookmarksList');
      if (!bookmarks) return false;
      const summaryTags = bookmarks.querySelectorAll('summary.bookmark-text');
      return [...summaryTags].some((summary) => summary.textContent.includes(label));
    }, newLabel);

    if (!labelExists) {
      throw new Error(`Label "${newLabel}" was not found in the bookmarks`);
    }
  }

  async function testBookmarkJsonUpload() {
    await page.goto(`http://localhost:${port}/bookmarks.html`);

    const jsonContent = {
      bookmarks: {
        unlabeled: ['mn9:11.4'],
        similes: ['mn20:4.5_mn20:4.6'],
      },
      updatedAt: '2024-06-25T19:47:10.162Z',
      detailsState: {
        unlabeled: true,
        similes: true,
      },
    };
    // Create a temporary JSON file
    const filePath = path.join(__dirname, 'tempBookmarks.json');
    fs.writeFileSync(filePath, JSON.stringify(jsonContent));

    // Upload the JSON file
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('#uploadButton'), // Click the upload button to trigger the file chooser
    ]);
    await fileChooser.accept([filePath]);

    await retry(async () => {
      // Check for relevant features in the HTML
      const detailsElements = await page.$$('details');

      let found = false;
      for (const details of detailsElements) {
        const summaryText = await details.$eval('summary.bookmark-text', (el) => el.textContent);
        if (summaryText.includes('similes (1)')) {
          found = true;
          const similesText = await details.$eval('.bookmark-container p', (el) => el.textContent);
          if (
            !similesText.includes('Suppose there was a woman or man who was young, youthful, and fond of adornments.')
          ) {
            throw new Error('Similes text not found or incorrect');
          }

          const similesLink = await details.$eval('.bookmark-container a', (el) => el.href);
          if (!similesLink.includes('/?q=mn20#mn20:4.5_mn20:4.6')) {
            throw new Error('Similes link not found or incorrect');
          }

          const similesCheckbox = await details.$eval('#checkbox-similes', (el) => el.checked);
          if (!similesCheckbox) {
            throw new Error('Similes checkbox not found or not checked');
          }
        }
      }
      if (!found) throw new Error('Uploaded "similes" label not found');
    });
  }

  // Run tests
  try {
    await testHomePage();
    await testSuttaPage();
    await testFilter('snp4.2', 'snp4.2');
    await testFilter('mn10', 'mn10');
    await testFilter('sabba', 'mn2');
    await testAllCacheFilesReachable('python/generated/files_to_cache.json');
    await testBookmarkLabelCreation();
    await testBookmarkJsonUpload();

    console.log('All tests passed successfully.');
  } catch (error) {
    console.error('Test failed: ', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close(); // Close the server when done
  }
})();
