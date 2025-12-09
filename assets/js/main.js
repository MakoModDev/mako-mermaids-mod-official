document.addEventListener("DOMContentLoaded", () => {
    
    /* =========================================
       1. HAMBURGER MENÜ (WICHTIG FÜR MOBILE!)
       ========================================= */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            // Verhindert, dass der Klick woanders hin durchgeht
            e.stopPropagation();
            
            // Menü rein/raus schieben
            navLinks.classList.toggle('active');
            // Hamburger zu X animieren
            hamburger.classList.toggle('toggle');
            
            // Debugging (Falls es immer noch nicht geht, entfernt das // davor)
            // alert("Menü geklickt!"); 
        });

        // Menü schließen, wenn man einen Link klickt
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('toggle');
            });
        });

        // Menü schließen, wenn man daneben klickt
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('toggle');
            }
        });
    } else {
        console.error("Hamburger oder NavLinks nicht gefunden!");
    }

    /* =========================================
       2. SCROLL ANIMATION (Einblenden)
       ========================================= */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });
    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));


    /* =========================================
       3. LIGHTBOX GALERIE
       ========================================= */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const galleryImages = Array.from(document.querySelectorAll('.gallery-img'));
    
    let currentIndex = 0;

    if (lightbox) {
        function openLightbox(index) {
            currentIndex = index;
            lightbox.style.display = "block";
            lightboxImg.src = galleryImages[currentIndex].src;
            lightboxImg.alt = galleryImages[currentIndex].alt;
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % galleryImages.length;
            lightboxImg.src = galleryImages[currentIndex].src;
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            lightboxImg.src = galleryImages[currentIndex].src;
        }

        galleryImages.forEach((img, index) => {
            img.addEventListener('click', () => openLightbox(index));
            img.style.cursor = "pointer";
        });

        closeBtn.addEventListener('click', () => lightbox.style.display = "none");
        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
        
        // Klick neben das Bild schließt es
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.style.display = "none";
        });
    }

    /* =========================================
       4. CLICK SOUNDS & BUBBLES
       ========================================= */
    // Click Sound (nur wenn Datei existiert)
    const clickSound = new Audio('assets/files/click.mp3');
    clickSound.volume = 0.2;

    document.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {}); // Fehler ignorieren
    });

    // Bubbles (Nur auf PC, Handy ignorieren wir via CSS)
    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 768 && Math.random() < 0.1) { 
            createBubble(e.pageX, e.pageY);
        }
    });

    function createBubble(x, y) {
        const bubble = document.createElement('div');
        bubble.classList.add('mouse-bubble');
        const size = Math.random() * 15 + 5;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${x}px`;
        bubble.style.top = `${y}px`;
        document.body.appendChild(bubble);
        setTimeout(() => bubble.remove(), 1000);
    }
});
