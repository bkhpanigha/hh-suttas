// loadHeader.js

// Check if the browser supports the Fetch API
    // Fetch the content of header.html
fetch('/header.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        // Insert the fetched content into the placeholder
        document.getElementById('header-placeholder').innerHTML = data;
    })
    .catch(error => {
        console.error('Error fetching header:', error);
    });