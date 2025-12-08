// assets/js/main.js

document.addEventListener("DOMContentLoaded", () => {
    
    // Scroll Animation (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));

    // Kleiner Parallax Effekt für den Hintergrund
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        document.querySelector('.bg-bubbles').style.transform = `translateY(${scrolled * 0.5}px)`;
    });
});
