document.addEventListener("DOMContentLoaded", () => {

    /* 1. HAMBURGER MENÜ */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('toggle');
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('toggle');
            });
        });
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('toggle');
            }
        });
    }

    /* 2. SCROLL ANIMATION */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('show');
        });
    });
    document.querySelectorAll('.hidden').forEach((el) => observer.observe(el));

    /* 3. LIGHTBOX GALERIE (SCROLL FIX & KEYBOARD) */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const galleryImages = Array.from(document.querySelectorAll('.gallery-img'));
    let currentIndex = 0;

    if (lightbox) {
        function updateLightbox() {
            const img = galleryImages[currentIndex];
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            if (lightboxCaption) lightboxCaption.textContent = img.alt;
        }

        function openLightbox(index) {
            currentIndex = index;
            lightbox.style.display = "flex"; 
            document.body.classList.add("no-scroll"); // STOPPT SCROLLEN
            updateLightbox();
        }

        function closeLightbox() {
            lightbox.style.display = "none";
            document.body.classList.remove("no-scroll"); // ERLAUBT SCROLLEN
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % galleryImages.length;
            updateLightbox();
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            updateLightbox();
        }

        // Klicks
        galleryImages.forEach((img, index) => {
            img.addEventListener('click', () => openLightbox(index));
        });

        document.querySelector('.close-btn')?.addEventListener('click', closeLightbox);
        document.querySelector('.next')?.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
        document.querySelector('.prev')?.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // Tasten
        document.addEventListener('keydown', (e) => {
            if (lightbox.style.display === "flex") {
                if (e.key === "ArrowRight") showNext();
                if (e.key === "ArrowLeft") showPrev();
                if (e.key === "Escape") closeLightbox();
            }
        });
    }

    /* 4. SUCHE & COPY */
    const searchInput = document.getElementById('wikiSearch');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('tbody tr, .item-card').forEach(el => {
                el.style.display = el.innerText.toLowerCase().includes(term) ? '' : 'none';
            });
        });
    }

    if (!document.getElementById('copy-toast')) {
        const toast = document.createElement('div');
        toast.id = 'copy-toast';
        toast.innerText = '✅ Copied to clipboard!';
        document.body.appendChild(toast);
    }
    const toastElement = document.getElementById('copy-toast');

    document.querySelectorAll('code').forEach(code => {
        code.title = "Click to copy";
        code.addEventListener('click', () => {
            navigator.clipboard.writeText(code.innerText).then(() => {
                toastElement.classList.add('show');
                setTimeout(() => toastElement.classList.remove('show'), 2000);
            });
        });
    });
});
