export function addNavbar() {
    const navbar = document.createElement('div');
    navbar.id = 'suttanav';
    navbar.innerHTML = document.title;
    document.body.appendChild(navbar);
  
    let lastScrollTop = 0;
    let isVisible = false;
    let scrollTimer = null;
    
    window.addEventListener('scroll', () => {
        if (scrollTimer !== null) {
            clearTimeout(scrollTimer);
        }

        const currentScrollTop = window.scrollY || document.documentElement.scrollTop;
        
        // Show navbar when scrolling up beyond threshold
        if (currentScrollTop < lastScrollTop && currentScrollTop > 170) {
            if (!isVisible) {
                navbar.style.top = window.innerWidth < 1000 ? '47px' : '0px';
                isVisible = true;
            }
        } 
        // Hide navbar when at top or scrolling down
        else if (currentScrollTop <= 170 || currentScrollTop > lastScrollTop) {
            if (isVisible) {
                navbar.style.top = '-50px';
                isVisible = false;
            }
        }
        
        lastScrollTop = currentScrollTop;
        
        // Reset scroll state after scrolling stops
        scrollTimer = setTimeout(() => {
            scrollTimer = null;
        }, 150);
    }, { passive: true });
}
