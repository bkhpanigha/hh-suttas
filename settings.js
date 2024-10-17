function addSettingsPanel(location = 'settings-button', panelLocation = 'top') {
    // Get the settings button based on the argument (default is 'settings-button')
    const settingsButton = document.getElementById(location);
    
    // Depending on the panel location, position the settings panel accordingly
    const settingsPanel = document.getElementById('settings-panel');
    
    // Position the settings panel based on the panelLocation argument
    if (panelLocation === 'navbar') {
        // If it's in the navbar, append it to the navbar
        const navbar = document.getElementById('suttanav');
        navbar.appendChild(settingsPanel);
    } else {
        // Default is at the top of the page (keep the panel where it is in the DOM)
        document.body.appendChild(settingsPanel);
    }

    // Add click event listener to the settings button
    settingsButton.addEventListener('click', () => {
        settingsPanel.classList.toggle('visible');
    });

    // Get the increase and decrease text size buttons
    const increaseTextSizeButton = document.getElementById('increase-text-size');
    const decreaseTextSizeButton = document.getElementById('decrease-text-size');

    // Function to change text size
    const changeTextSize = (increment) => {
        const body = document.body;
        const currentSize = parseFloat(window.getComputedStyle(body, null).getPropertyValue('font-size'));
        body.style.fontSize = (currentSize + increment) + 'px';
    };

    // Add event listeners to the buttons
    increaseTextSizeButton.addEventListener('click', () => changeTextSize(1));
    decreaseTextSizeButton.addEventListener('click', () => changeTextSize(-1));
}

export { addSettingsPanel};
