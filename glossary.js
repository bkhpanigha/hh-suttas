import { preventFlashing } from './js/utils/navigation/preventFlashing.js';

showdown.extension('palign', function() {
  return [{
    type: 'listener',
    listeners: {
      'blockGamut.before': function (event, text, converter, options, globals) {
        text = text.replace(/^-:-([\s\S]+?)-:-$/gm, function (wm, txt) {
          return '<div style="text-align: center;">' + converter.makeHtml(txt) + '</div>';
        });
        return text;
      }
    }
  }];
});

function loadGlossary() {
    fetch('glossary.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        var converter = new showdown.Converter({
		  extensions: ['palign']
		});
        var glossaryDiv = document.getElementById('glossaryArea');
        var glossary = data.glossary;
        var output = '';
  
          var terms = Object.keys(glossary);
    
          // Iterate over the sorted terms
          for (var i = 0; i < terms.length; i++) {
            var term = terms[i];
            var definitionMarkdown = glossary[term];
            var definitionHtml = converter.makeHtml(definitionMarkdown);
    
            // Build the HTML output
            output += '<div class="glossary-item">';
            output += '<h2 style="font-style: italic;">' + term + '</h2>';
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

try{
    loadGlossary();
} catch (error) {
    console.error('[ERROR] Something went wrong:', error);
}
finally
{
    preventFlashing();
}
