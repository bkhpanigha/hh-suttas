const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');

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
    const linkExists = await sutta.$eval('ul', (ul, expectedLink, expectedText) => {
      const li = [...ul.querySelectorAll('li')].find(li =>
        li.querySelector('a') &&
        li.querySelector('a').getAttribute('href') === expectedLink &&
        li.querySelector('a').textContent.includes(expectedText)
      );
      return !!li;
    }, expectedLink, expectedText);

    if (!linkExists) throw new Error(`No <li> found with the specific <a> tag content`);
  }

  async function testSuttaPage() {
    await page.goto(`http://localhost:${port}/?q=mn1`);
    await page.waitForSelector('#mn1', { timeout: 1000 });

    // Test for element with ID 'mn1'
    const mn1Element = await page.$('#mn1');
    if (!mn1Element) throw new Error('Element with ID "mn1" not found');

    // Test if the mn1 element contains <p> tags
    const pTagsExist = await mn1Element.$$eval('p', pTags => pTags.length > 0);
    if (!pTagsExist) throw new Error('<p> tags under #mn1 not found');

    // Test for comments
    const commentsExist = await mn1Element.$$eval('.comment-text', comments =>
      comments.every(comment => comment.style.display === 'none')
    );
    if (!commentsExist) throw new Error('Comments with class "comment-text" not found or not hidden');
  }

  // Run tests
  try {
    await testHomePage();
    await testSuttaPage();
    console.log("All tests passed successfully.");
  } catch (error) {
    console.error("Test failed: ", error);
  } finally {
    await browser.close();
    server.close(); // Close the server when done
  }
})();