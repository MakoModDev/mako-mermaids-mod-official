document.addEventListener("DOMContentLoaded", () => {
    
    /* =========================================
       1. HAMBURGER MENÜ
       ========================================= */
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

    /* =========================================
       2. SCROLL ANIMATION
       ========================================= */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });
    document.querySelectorAll('.hidden').forEach((el) => observer.observe(el));

    /* =========================================
       3. LIGHTBOX GALERIE
       ========================================= */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const galleryImages = Array.from(document.querySelectorAll('.gallery-img'));
    let currentIndex = 0;

    if (lightbox) {
        function openLightbox(index) {
            currentIndex = index;
            lightbox.style.display = "block";
            lightboxImg.src = galleryImages[currentIndex].src;
            lightboxImg.alt = galleryImages[currentIndex].alt;
        }

        const closeBtn = document.querySelector('.close-btn');
        const nextBtn = document.querySelector('.next');
        const prevBtn = document.querySelector('.prev');

        galleryImages.forEach((img, index) => {
            img.addEventListener('click', () => openLightbox(index));
        });

        if(closeBtn) closeBtn.addEventListener('click', () => lightbox.style.display = "none");
        
        if(nextBtn) nextBtn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            currentIndex = (currentIndex + 1) % galleryImages.length;
            lightboxImg.src = galleryImages[currentIndex].src;
        });
        
        if(prevBtn) prevBtn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            lightboxImg.src = galleryImages[currentIndex].src;
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.style.display = "none";
        });
    }

    /* =========================================
       4. SOUNDS & BUBBLES
       ========================================= */
    const clickSound = new Audio('assets/files/click.mp3');
    clickSound.volume = 0.2;
    document.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    });

    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 768 && Math.random() < 0.1) { 
            const bubble = document.createElement('div');
            bubble.classList.add('mouse-bubble');
            const size = Math.random() * 15 + 5;
            bubble.style.width = `${size}px`; bubble.style.height = `${size}px`;
            bubble.style.left = `${e.pageX}px`; bubble.style.top = `${e.pageY}px`;
            document.body.appendChild(bubble);
            setTimeout(() => bubble.remove(), 1000);
        }
    });

    /* =========================================
       5. WIKI SEARCH & COPY
       ========================================= */
    // SUCHE
    const searchInput = document.getElementById('wikiSearch');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('tbody tr').forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
            });
            document.querySelectorAll('.item-card').forEach(item => {
                item.style.display = item.innerText.toLowerCase().includes(term) ? '' : 'none';
            });
        });
    }

    // COPY TO CLIPBOARD
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
