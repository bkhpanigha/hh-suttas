// Store the timeout ID for standard notifications
let standardNotificationTimeoutId = null;
let progressNotificationTimeoutId = null; // Timeout for hiding progress bar after completion/error

export function showNotification(message, duration = 5000, progress = null) {
    // Clear any existing standard notification timeout
    if (standardNotificationTimeoutId) {
        clearTimeout(standardNotificationTimeoutId);
        standardNotificationTimeoutId = null;
    }
     // Clear any pending progress hide timeout
    if (progressNotificationTimeoutId) {
        clearTimeout(progressNotificationTimeoutId);
        progressNotificationTimeoutId = null;
    }

    let progressNotificationBox = document.getElementById('progress-notification');
    let standardNotificationBox = document.getElementById('standard-notification');

    // --- Handle Progress Notification ---
    if (typeof progress === 'number' && progress >= 0 && progress <= 100) {
        // If a standard notification is visible, hide it immediately
        if (standardNotificationBox) {
            standardNotificationBox.style.opacity = 0;
            setTimeout(() => standardNotificationBox.remove(), 500); // Remove after fade out
        }

        if (!progressNotificationBox) {
            progressNotificationBox = document.createElement('div');
            progressNotificationBox.classList.add('notification-box'); // Use same styling
            progressNotificationBox.id = 'progress-notification';
            progressNotificationBox.style.zIndex = 99999;
            progressNotificationBox.innerHTML = `
                <p>${message}</p>
                <progress value="${progress}" max="100" style="width: 100%; margin-top: 5px;"></progress>
            `;
            document.body.appendChild(progressNotificationBox);
            // Fade in
            progressNotificationBox.style.display = 'block';
            setTimeout(() => progressNotificationBox.style.opacity = 1, 10);
        } else {
            // Update existing progress notification
            progressNotificationBox.querySelector('p').innerHTML = message;
            progressNotificationBox.querySelector('progress').value = progress;
            // Ensure it's visible if it was fading out
            progressNotificationBox.style.display = 'block';
            progressNotificationBox.style.opacity = 1;
        }
    }
    // --- Handle Standard Notification ---
    else {
        // If a progress notification exists, start fading it out
        if (progressNotificationBox) {
            progressNotificationBox.style.opacity = 0;
             // Set a timeout to remove it after the fade-out animation (500ms)
            progressNotificationTimeoutId = setTimeout(() => {
                progressNotificationBox?.remove(); // Use optional chaining in case it was already removed
                progressNotificationTimeoutId = null;
            }, 500);
        }

        // Create or get standard notification box
        if (!standardNotificationBox) {
            standardNotificationBox = document.createElement('div');
            standardNotificationBox.classList.add('notification-box');
            standardNotificationBox.id = 'standard-notification';
            standardNotificationBox.style.zIndex = 99998; // Slightly lower than progress
            document.body.appendChild(standardNotificationBox);
        }

        standardNotificationBox.innerHTML = message;

        // Show with fade-in
        standardNotificationBox.style.display = 'block';
        setTimeout(() => standardNotificationBox.style.opacity = 1, 10);

        // Set timeout to hide standard notification
        standardNotificationTimeoutId = setTimeout(() => {
            if (standardNotificationBox) { // Check if it still exists
                 standardNotificationBox.style.opacity = 0;
                 // Remove after fade-out
                 setTimeout(() => {
                    standardNotificationBox?.remove(); // Use optional chaining
                 }, 500);
            }
            standardNotificationTimeoutId = null;
        }, duration);
    }
}
  
