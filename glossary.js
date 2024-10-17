var converter = new showdown.Converter();

function loadGlossary() {
    fetch('glossary.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        var converter = new showdown.Converter();
        var glossaryDiv = document.getElementById('glossaryArea');
        var glossary = data.glossary;
        var output = '';
  
        // Get the glossary terms and sort them alphabetically
          var terms = Object.keys(glossary).sort();
    
          // Iterate over the sorted terms
          for (var i = 0; i < terms.length; i++) {
            var term = terms[i];
            var definitionMarkdown = glossary[term];
            var definitionHtml = converter.makeHtml(definitionMarkdown);
    
            // Build the HTML output
            output += '<div class="glossary-item">';
            output += '<h2>' + term + '</h2>';
            output += '<div class="definition">' + definitionHtml + '</div>';
            output += '</div>';
          }
  
        // Insert the HTML into the glossaryArea div
        glossaryDiv.innerHTML = output;
      })
      .catch(error => {
        console.error('Error loading glossary:', error);
        document.getElementById('glossaryArea').innerText = 'Failed to load glossary.';
      });
  }

  loadGlossary();