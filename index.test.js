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

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Helper functions for different tests
  async function testHomePage() {
    await page.goto(`http://localhost:${port}/`);

    // Test for element with ID 'sutta'
    const sutta = await page.$('#sutta');
    if (!sutta) throw new Error('Element with ID "sutta" not found');

    // Test if the element contains a <ul>
    const ulExists = await sutta.$('ul');
    if (!ulExists) throw new Error('<ul> element under #sutta not found');

    // Test for specific <li> content
    const expectedLink = '/?q=mn1';
    const expectedText = 'MN1: The Explanation of the Root';
    const linkExists = await sutta.$eval(
      'ul',
      (ul, expectedLink, expectedText) => {
        const li = [...ul.querySelectorAll('li')].find(
          (li) =>
            li.querySelector('a') &&
            li.querySelector('a').getAttribute('href') === expectedLink &&
            li.querySelector('a').textContent.includes(expectedText)
        );
        return !!li;
      },
      expectedLink,
      expectedText
    );

    if (!linkExists) throw new Error(`No <li> found with the specific <a> tag content`);
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

  async function testCitationSearch(inputCitation) {
    await page.goto(`http://localhost:${port}/`);

    // Enter text into the input field with ID 'citation'
    const inputSelector = '#citation';
    await page.type(inputSelector, inputCitation);

    try {
      await page.waitForSelector(`a[href="/?q=${inputCitation}"]`, { timeout: 1000 });
      const link = await page.$(`a[href="/?q=${inputCitation}"]`);
      if (link) {
        await link.click();
      } else {
        console.log('Link not found');
      }
    } catch (error) {
      throw new Error(`No <a> tag found with href="/?q=${inputCitation}"`);
    }
  }

  async function testPaliTitleSearch(inputTitle, ExpectedCitation) {
    await page.goto(`http://localhost:${port}/`);

    // Enter text into the input field with ID 'citation'
    const inputSelector = '#citation';
    await page.type(inputSelector, inputTitle);

    try {
      await page.waitForSelector(`a[href="/?q=${ExpectedCitation}"]`, { timeout: 1000 });
      const link = await page.$(`a[href="/?q=${ExpectedCitation}"]`);
      if (link) {
        await link.click();
      } else {
        console.log('Link not found');
      }
    } catch (error) {
      throw new Error(`No <a> tag found with href="/?q=${ExpectedCitation}"`);
    }
  }
  async function testAllCacheFilesReachable(jsonFilePath) {
    const fileList = JSON.parse(fs.readFileSync(jsonFilePath));
    const checkPromises = fileList.map(async (filePath) => {
      const page = await browser.newPage();
      const fullUrl = `http://localhost:${port}/${filePath}`;

      try {
        const response = await page.goto(fullUrl, {
          waitUntil: 'networkidle2',
          method: 'HEAD',
          timeout: 10000, // set timeout to 10 seconds
        });

        if (response.status() === 404) {
          throw new Error(`File at ${filePath} is not reachable, status code: ${response.status()}`);
        }
      } catch (error) {
        if (error.message.includes('net::ERR_ABORTED')) {
          console.warn(`Warning: ${error.message} for ${filePath}`);
        } else if (error.message.includes('Navigation timeout')) {
          console.warn(`Warning: Navigation timeout for ${filePath}`);
        } else {
          throw error;
        }
      } finally {
        await page.close();
      }
    });

    await Promise.all(checkPromises);
  }
  async function testBookmarkLabelCreation() {
    await page.goto(`http://localhost:${port}/bookmarks.html`);

    const newLabel = 'testLabel';
    await page.type('#newLabelInput', newLabel);
    await page.click('#createLabelButton');

    // Wait for the new label to appear in the bookmarks
    await page.waitForFunction(
      (label) => {
        const bookmarks = document.querySelector('#bookmarks');
        if (!bookmarks) return false;
        const summaryTags = bookmarks.querySelectorAll('summary.bookmark-text');
        return [...summaryTags].some((summary) => summary.textContent.includes(label));
      },
      {},
      newLabel
    );

    const labelExists = await page.evaluate((label) => {
      const bookmarks = document.querySelector('#bookmarks');
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
        similes: ['mn20:4.5-mn20:4.6'],
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

      for (const details of detailsElements) {
        const summaryText = await details.$eval('summary.bookmark-text', (el) => el.textContent);
        if (summaryText.includes('similes (1)')) {
          const similesText = await details.$eval('.bookmark-container p', (el) => el.textContent);
          if (
            !similesText.includes('Suppose there was a woman or man who was young, youthful, and fond of adornments.')
          ) {
            throw new Error('Similes text not found or incorrect');
          }

          const similesLink = await details.$eval('.bookmark-container a', (el) => el.href);
          if (!similesLink.includes('/?q=mn20#mn20:4.5-mn20:4.6')) {
            throw new Error('Similes link not found or incorrect');
          }

          const similesCheckbox = await details.$eval('#checkbox-similes', (el) => el.checked);
          if (!similesCheckbox) {
            throw new Error('Similes checkbox not found or not checked');
          }
        }
      }
    });
  }

  // Run tests
  try {
    await testHomePage();
    await testSuttaPage();
    await testCitationSearch('snp4.2');
    await testCitationSearch('mn10');
    await testPaliTitleSearch('sabba', 'mn2');
    await testAllCacheFilesReachable('../../python/generated/files_to_cache.json');
    await testBookmarkLabelCreation();
    await testBookmarkJsonUpload();

    console.log('All tests passed successfully.');
  } catch (error) {
    console.error('Test failed: ', error);
  } finally {
    await browser.close();
    server.close(); // Close the server when done
  }
})();
