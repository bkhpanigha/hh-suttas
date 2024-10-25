
//appears to be incomplete
export async function handleFetchSuttaTranslations()
{
    fetch('/suttas_epub/Sutta_Translations.epub')
    .then(response => 
    {
        if (response.ok) 
        {
            const lastModified = response.headers.get('Last-Modified');
            if (lastModified) 
            {
                const date = new Date(lastModified);
                // Format date
                let lastModifiedDate = date.toLocaleDateString('en-EN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
                });
            } else {
                console.error("Header 'Last-Modified' is missing or invalid.");
            }
        } else {
        console.error('Error when trying to get file :', response.statusText);
        }
    })
  .catch(error => {
    console.error('Error :', error);
  });
}