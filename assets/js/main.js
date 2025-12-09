document.addEventListener("DOMContentLoaded", () => {
    
    // 1. SCROLL ANIMATION (Das hattest du schon)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });
    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));


    // 2. LIGHTBOX GALERIE LOGIK (Das ist NEU)
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    
    // Alle Bilder aus der Galerie holen
    // Wichtig: Wir suchen nur Bilder, die die Klasse "gallery-img" haben!
    const galleryImages = Array.from(document.querySelectorAll('.gallery-img'));
    
    let currentIndex = 0; // Merken, welches Bild gerade offen ist

    // Funktion: Öffne Lightbox mit bestimmtem Bild
    function openLightbox(index) {
        currentIndex = index;
        lightbox.style.display = "block";
        lightboxImg.src = galleryImages[currentIndex].src;
        lightboxImg.alt = galleryImages[currentIndex].alt;
    }

    // Funktion: Nächstes Bild
    function showNext() {
        currentIndex++;
        if (currentIndex >= galleryImages.length) {
            currentIndex = 0; // Wenn am Ende, fang von vorne an
        }
        lightboxImg.src = galleryImages[currentIndex].src;
    }

    // Funktion: Vorheriges Bild
    function showPrev() {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = galleryImages.length - 1; // Wenn am Anfang, geh zum letzten
        }
        lightboxImg.src = galleryImages[currentIndex].src;
    }

    // Funktion: Schließen
    function closeLightbox() {
        lightbox.style.display = "none";
    }

    // EVENT LISTENER (Klicks abfangen)
    
    // Klick auf ein Galerie-Bild
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', () => {
            openLightbox(index);
        });
        // Zeiger ändern damit man weiß, dass es klickbar ist
        img.style.cursor = "pointer";
    });

    // Klick auf Schließen
    closeBtn.addEventListener('click', closeLightbox);

    // Klick auf Pfeile
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Klick neben das Bild (zum Schließen)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Tastensteuerung (Pfeiltasten & ESC)
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === "block") {
            if (e.key === "ArrowLeft") showPrev();
            if (e.key === "ArrowRight") showNext();
            if (e.key === "Escape") closeLightbox();
        }
    });
        // === NEU: HAMBURGER MENÜ LOGIK ===
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            // Menü rein/raus schieben
            navLinks.classList.toggle('active');
            // Hamburger zu X animieren
            hamburger.classList.toggle('toggle');
        });

        // Menü schließen, wenn man einen Link klickt
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('toggle');
            });
        });
    }

    // === NEU: PFEIL FLASH EFFECT (Fix für Mobile) ===
    // Wir nutzen nicht mehr CSS :hover für Mobile, sondern JS
    const arrows = document.querySelectorAll('.lightbox-arrow');
    
    arrows.forEach(arrow => {
        arrow.addEventListener('click', function() {
            // Klasse hinzufügen (macht blau)
            this.classList.add('flash-active');
            
            // Nach 200ms Klasse entfernen (macht wieder weiß)
            setTimeout(() => {
                this.classList.remove('flash-active');
            }, 200);
        });
    });
    
});
