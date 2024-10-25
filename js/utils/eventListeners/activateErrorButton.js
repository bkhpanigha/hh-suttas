

export default function activateErrorButton()
{
    const errorButton = document.getElementById('reportButton');
    errorButton.addEventListener('click', () => 
    {
        window.open('https://docs.google.com/forms/d/1Ng8Csf9xYJ7UaYUyl3sGEyZ3aa2FJE_0GRS6zI6oIBM/edit', '_blank');
    });
}