import getDocumentAreas from "../getDocumentAreas.js";

export default function activateGeneralActionButtons()
{
    const { supportButton, feedbackButton, hillsideHermitageButton } = getDocumentAreas();

    supportButton?.addEventListener('click', () => window.open('https://www.hillsidehermitage.org/support-us/', '_blank'));
    feedbackButton?.addEventListener('click', () => window.open('https://docs.google.com/forms/d/1Ng8Csf9xYJ7UaYUyl3sGEyZ3aa2FJE_0GRS6zI6oIBM/edit', '_blank'));
    hillsideHermitageButton?.addEventListener('click', () => window.open('https://hillsidehermitage.org', '_blank'));
}