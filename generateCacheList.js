const fs = require('fs');
const path = require('path');

// Function to recursively traverse a directory and collect file paths

function collectFiles(directory) {
  let filesToCache = [];

  fs.readdirSync(directory).forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    if (!file.includes('.git') && file != 'CNAME' && file != "an" && file != "dn" && file != "sn" && file != "kn") {
      if (stats.isDirectory()) {
        // Recursively collect files from subdirectories
        filesToCache = filesToCache.concat(collectFiles(filePath));
      } else {
        // Add file to the list if it's not a directory
        filesToCache.push(filePath);
      }
    }
  });
  return filesToCache;
}


// Define the directory to traverse (root directory of your project)
const rootDirectory = './';

// Collect all files in the root directory
const allFiles = collectFiles(rootDirectory);

// Write the filesToCache array to a JavaScript file
const outputFile = 'filesToCache.js';
const outputContent = `const filesToCache = ${JSON.stringify(allFiles, null, 2)};\n\nexport { filesToCache };`;

fs.writeFileSync(outputFile, outputContent);

console.log(`File '${outputFile}' generated successfully.`);