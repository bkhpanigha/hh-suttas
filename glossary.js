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

// "yoniso manasikāra" becomes "yoniso-manasikara", so glossary.html#yoniso-manasikara links to that entry
function termId(term) {
  return term
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// The entries are added after the page loads, so the browser can't jump to the #entry by itself.
// A link written with diacritics (#yoniso-manasikāra) finds the entry too.
function scrollToLinkedEntry() {
  var hash;
  try {
    hash = decodeURIComponent(window.location.hash.slice(1));
  } catch (error) {
    return;
  }
  if (!hash) return;
  var entry = document.getElementById(hash) || document.getElementById(termId(hash));
  if (entry) entry.scrollIntoView();
}

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
            output += '<div class="glossary-item" id="' + termId(term) + '">';
            output += '<h2 style="font-style: italic;">' + term + '</h2>';
            output += '<div class="definition">' + definitionHtml + '</div>';
            output += '</div>';
          }
  
        // Insert the HTML into the glossaryArea div
        glossaryDiv.innerHTML = output;
        scrollToLinkedEntry();
      })
      .catch(error => {
        console.error('Error loading glossary:', error);
        document.getElementById('glossaryArea').innerText = 'Failed to load glossary.';
      });
  }

window.addEventListener('hashchange', scrollToLinkedEntry);

try{
    loadGlossary();
} catch (error) {
    console.error('[ERROR] Something went wrong:', error);
}
finally
{
    preventFlashing();
}
