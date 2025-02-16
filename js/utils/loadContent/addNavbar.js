import { isHashScrolling } from './../navigation/scrollToHash.js';

export function addNavbar() {
    const navbar = document.createElement('div');
    navbar.id = 'suttanav';
    navbar.innerHTML = document.title;
    document.body.appendChild(navbar);

    let lastScrollTop = 0;
    let isVisible = false;
    let scrollTimer = null;

    window.addEventListener('scroll', () => {
        if (isHashScrolling) return; // Ignore navbar visibility updates during hash-based scrolling

        if (scrollTimer !== null) {
            clearTimeout(scrollTimer);
        }

        const currentScrollTop = window.scrollY || document.documentElement.scrollTop;

        if (currentScrollTop < lastScrollTop && currentScrollTop > 170) {
            if (!isVisible) {
                navbar.style.top = window.innerWidth < 1000 ? '47px' : '0px';
                isVisible = true;
            }
        } else if (currentScrollTop <= 170 || currentScrollTop > lastScrollTop) {
            if (isVisible) {
                navbar.style.top = '-50px';
                isVisible = false;
            }
        }

        lastScrollTop = currentScrollTop;

        scrollTimer = setTimeout(() => {
            scrollTimer = null;
        }, 150);
    }, { passive: true });
}
