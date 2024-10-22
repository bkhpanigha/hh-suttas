export function addNavbar() 
{
    // Add the navbar to the page
    const navbar = document.createElement('div');
    navbar.id = 'suttanav'; // Added ID
    navbar.innerHTML = document.title;
    document.body.appendChild(navbar);
  
    let lastScrollTop = 0; // variable to store the last scroll position
    const scrollThreshold = 10;
    let isScrolling = false;
    let scrollTimeout;
  
    window.addEventListener('scroll', () => {
      if (!isScrolling) {
        isScrolling = true;
        requestAnimationFrame(() => {
          let currentScrollTop = window.scrollY || document.documentElement.scrollTop;
  
          // Detect sudden jump
          if (Math.abs(currentScrollTop - lastScrollTop) > 100) {
            // If the jump is large, do not show the navbar
            navbar.style.top = '-50px';
          } else if (Math.abs(currentScrollTop - lastScrollTop) > scrollThreshold) {
            // Only apply the scroll behavior if it's a regular scroll (not a sudden jump)
            navbar.style.top = currentScrollTop < 170 || currentScrollTop > lastScrollTop ? '-50px' : '0';
          }
  
          lastScrollTop = currentScrollTop;
          isScrolling = false;
        });
      }
  
      // Clear any previous timeout
      clearTimeout(scrollTimeout);
  
      // Set a timeout to handle the case when the user stops scrolling
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 100);
    });
  }