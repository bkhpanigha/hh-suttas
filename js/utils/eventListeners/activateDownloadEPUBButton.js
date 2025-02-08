export default function activateDownloadEPUBButton()
{
    const downloadEpub = () => {
        const link = document.createElement('a');
        link.href = 'python/generated/suttas_epub/Sutta_Translations.epub';  // Path to EPUB file
        link.download = 'Sutta_Translations.epub';    // Downloaded file name
        link.click();
    }

    document.getElementById('downloadEpubButton')?.addEventListener('click', downloadEpub);
    document.getElementById('downloadEpubButtonMobile')?.addEventListener('click', downloadEpub);
}