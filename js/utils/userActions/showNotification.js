export function showNotification(message, duration = 5000) {
    let notificationBox = document.querySelector('.notification-box');
    if (!notificationBox) {
      notificationBox = document.createElement('div');
      notificationBox.classList.add('notification-box');
      document.body.appendChild(notificationBox);
    }
  
    notificationBox.innerHTML = message;
  
    // Show the notification with fade-in effect
    notificationBox.style.display = 'block';
    setTimeout(() => notificationBox.style.opacity = 1, 10); // Slight delay to ensure the element is visible before starting the transition
  
    // Hide the notification with fade-out effect after 'duration' milliseconds
    setTimeout(() => {
      notificationBox.style.opacity = 0;
      // Wait for the fade-out transition to finish before hiding the element
      setTimeout(() => {
        notificationBox.style.display = 'none';
      }, 500); // This duration should match the transition duration in the CSS
    }, duration);
  }
  
