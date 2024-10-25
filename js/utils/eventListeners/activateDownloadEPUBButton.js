

export default function activateDownloadEPUBButton()
{
    document.getElementById('downloadEpubButton').addEventListener('click', function() 
    {
        const link = document.createElement('a');
        link.href = '/suttas_epub/Sutta_Translations.epub';  // Path to EPUB file
        link.download = 'Sutta_Translations.epub';    // Downloaded file name
        link.click();
    });
}