const isMobile = window.matchMedia("(max-width: 768px)").matches || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

const multicolorBg = document.getElementById('multicolorBg');
const floatingGallery = document.getElementById('floatingGallery');
const dynamicHeader = document.getElementById('dynamicHeader');

// --- MINI APPROFONDIMENTO SU NGF ---
const ngfTrigger = document.getElementById('ngfTrigger');
const ngfBackdrop = document.getElementById('ngfBackdrop');
const ngfClose = document.getElementById('ngfClose');

function openNgfModal() {
    ngfBackdrop.hidden = false;
    ngfTrigger.setAttribute('aria-expanded', 'true');
}

function closeNgfModal() {
    ngfBackdrop.hidden = true;
    ngfTrigger.setAttribute('aria-expanded', 'false');
}

if (ngfTrigger && ngfBackdrop && ngfClose) {
    ngfTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ngfBackdrop.hidden) {
            openNgfModal();
        } else {
            closeNgfModal();
        }
    });

    ngfTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openNgfModal();
        }
    });

    ngfClose.addEventListener('click', closeNgfModal);

    ngfBackdrop.addEventListener('click', (e) => {
        if (e.target === ngfBackdrop) {
            closeNgfModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !ngfBackdrop.hidden) {
            closeNgfModal();
        }
    });
}

// Stato normalizzato del cursore (0..1) e interpolazione fluida
let targetMouseX = 0.5;
let targetMouseY = 0.5;
let smoothMouseX = 0.5;
let smoothMouseY = 0.5;
let autoHue = 220;
let hasMovedMouse = false;

if (!isMobile) {
    document.addEventListener('mousemove', (e) => {
        hasMovedMouse = true;
        targetMouseX = e.clientX / window.innerWidth;
        targetMouseY = e.clientY / window.innerHeight;

        const cx = targetMouseX - 0.5;
        const cy = targetMouseY - 0.5;
        dynamicHeader.style.transform = `translate(${cx * -30}px, ${cy * -30}px) rotateX(${cy * 5}deg) rotateY(${cx * -5}deg)`;
    });
}

// --- SFONDO MULTICOLORE CON ALONE CURSORE DI DIAMETRO RIDOTTO ---
function updateMulticolorBackground() {
    if (!isMobile && hasMovedMouse) {
        smoothMouseX += (targetMouseX - smoothMouseX) * 0.12;
        smoothMouseY += (targetMouseY - smoothMouseY) * 0.12;

        const hue1 = Math.round(smoothMouseX * 360);
        const hue2 = Math.round((hue1 + 80 + smoothMouseY * 100) % 360);
        const hue3 = Math.round((hue1 + 200) % 360);
        const pxX = Math.round(smoothMouseX * window.innerWidth);
        const pxY = Math.round(smoothMouseY * window.innerHeight);

        multicolorBg.style.background = `
            radial-gradient(circle 85px at ${pxX}px ${pxY}px, hsla(${hue1}, 95%, 54%, 0.85) 0%, hsla(${hue2}, 85%, 38%, 0.35) 55%, transparent 100%),
            linear-gradient(${Math.round(smoothMouseX * 180 + 90)}deg, hsl(${hue3}, 75%, 14%), hsl(${hue1}, 70%, 18%), hsl(${hue2}, 75%, 15%))
        `;
    } else {
        autoHue = (autoHue + 0.25) % 360;
        const hue2 = (autoHue + 110) % 360;
        const hue3 = (autoHue + 220) % 360;

        multicolorBg.style.background = `
            radial-gradient(circle 95px at 30% 35%, hsla(${autoHue}, 85%, 42%, 0.75) 0%, transparent 100%),
            linear-gradient(135deg, hsl(${hue3}, 70%, 13%), hsl(${autoHue}, 65%, 17%), hsl(${hue2}, 70%, 14%))
        `;
    }
}

// --- IMMAGINI FLUTTUANTI RANDOM NEL FORMATO ORIGINALE (SOVRAPPOSIZIONE SOLO AI BORDI/ANGOLI) ---
const rawImageSources = [
    'image.jpg',
    '1.png', '2.png', '3.png', '4.png', '5.png',
    '6.png', '7.png', '8.png', '9.png', '10.png', '11.png', '12.png', '13.png', '14.png', '15.png'
];

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

const floatingItems = [];

// Calcola l'area di intersezione tra i nuclei interni (86%) di due immagini
function coreOverlapArea(xA, yA, wA, hA, xB, yB, wB, hB) {
    const padA_x = wA * 0.07;
    const padA_y = hA * 0.07;
    const padB_x = wB * 0.07;
    const padB_y = hB * 0.07;

    const left = Math.max(xA + padA_x, xB + padB_x);
    const right = Math.min(xA + wA - padA_x, xB + wB - padB_x);
    const top = Math.max(yA + padA_y, yB + padB_y);
    const bottom = Math.min(yA + hA - padA_y, yB + hB - padB_y);

    if (right <= left || bottom <= top) return 0;
    return (right - left) * (bottom - top);
}

// Trova una posizione casuale libera evitando sovrapposizioni centrali con le altre immagini
function findClearRandomPosition(item) {
    const maxX = Math.max(20, window.innerWidth - item.width);
    const maxY = Math.max(20, window.innerHeight - item.height);
    let bestX = Math.random() * maxX;
    let bestY = Math.random() * maxY;
    let bestOverlap = Infinity;

    for (let attempt = 0; attempt < 40; attempt++) {
        const candX = Math.random() * maxX;
        const candY = Math.random() * maxY;
        let totalOverlap = 0;

        for (let j = 0; j < floatingItems.length; j++) {
            const other = floatingItems[j];
            if (other === item || !other.loaded) continue;
            totalOverlap += coreOverlapArea(
                candX, candY, item.width, item.height,
                other.x, other.y, other.width, other.height
            );
        }

        if (totalOverlap === 0) {
            item.x = candX;
            item.y = candY;
            return;
        }
        if (totalOverlap < bestOverlap) {
            bestOverlap = totalOverlap;
            bestX = candX;
            bestY = candY;
        }
    }

    item.x = bestX;
    item.y = bestY;
}

// Sceglie una coordinata di rientro lungo un bordo evitando immagini già presenti lì
function pickBestEntryCoord(item, fixedAxis, fixedValue, spanMax) {
    let bestCoord = Math.random() * spanMax;
    let bestOverlap = Infinity;

    for (let attempt = 0; attempt < 15; attempt++) {
        const cand = Math.random() * spanMax;
        const candX = fixedAxis === 'x' ? fixedValue : cand;
        const candY = fixedAxis === 'y' ? fixedValue : cand;
        let totalOverlap = 0;

        for (let j = 0; j < floatingItems.length; j++) {
            const other = floatingItems[j];
            if (other === item || !other.loaded) continue;
            totalOverlap += coreOverlapArea(
                candX, candY, item.width, item.height,
                other.x, other.y, other.width, other.height
            );
        }

        if (totalOverlap === 0) return cand;
        if (totalOverlap < bestOverlap) {
            bestOverlap = totalOverlap;
            bestCoord = cand;
        }
    }
    return bestCoord;
}

function createFloatingImages() {
    floatingGallery.innerHTML = '';
    floatingItems.length = 0;

    const randomizedSources = shuffleArray(rawImageSources);
    const now = performance.now();

    randomizedSources.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.className = 'floating-img';

        const depth = 0.35 + Math.random() * 0.65;
        const maxSide = isMobile
            ? Math.round(115 + depth * 75)
            : Math.round(175 + depth * 155);

        img.style.maxWidth = `${maxSide}px`;
        img.style.maxHeight = `${maxSide}px`;
        img.style.width = 'auto';
        img.style.height = 'auto';
        img.style.zIndex = Math.round(depth * 10);

        const targetOpacity = (0.48 + depth * 0.34).toFixed(2);

        const item = {
            el: img,
            x: 0,
            y: 0,
            width: maxSide,
            height: maxSide,
            maxSide: maxSide,
            vx: (Math.random() - 0.5) * (0.38 + depth * 0.45),
            vy: (Math.random() - 0.5) * (0.38 + depth * 0.45),
            depth: depth,
            angle: (Math.random() - 0.5) * 14,
            waveOffset: Math.random() * Math.PI * 2,
            waveSpeed: 0.008 + Math.random() * 0.012,
            targetOpacity: targetOpacity,
            appearAt: now + (index === 0 ? 150 : Math.random() * 3800),
            appeared: false,
            loaded: false
        };

        const handleLoaded = () => {
            if (item.loaded) return;
            item.loaded = true;
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                const scale = Math.min(1, item.maxSide / Math.max(img.naturalWidth, img.naturalHeight));
                item.width = img.naturalWidth * scale;
                item.height = img.naturalHeight * scale;
            }
            findClearRandomPosition(item);
        };

        img.onload = handleLoaded;

        let fallbackStep = 0;
        img.onerror = () => {
            const base = src.replace(/\.[^.]+$/, '');
            const fallbacks = [base + '.PNG', base + '.jpg', base + '.JPG', base + '.jpeg'];
            if (fallbackStep < fallbacks.length) {
                img.src = fallbacks[fallbackStep++];
            } else {
                img.style.display = 'none';
            }
        };

        floatingGallery.appendChild(img);
        floatingItems.push(item);

        if (img.complete && img.naturalWidth > 0) {
            handleLoaded();
        }
    });
}

let frameCount = 0;

function resolveImageCollisions(cx, cy) {
    // 3 passaggi morbidi per impedire che due immagini si sovrappongano al centro,
    // consentendo al massimo un leggero sfioramento degli angoli/bordi esterni
    for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < floatingItems.length; i++) {
            const a = floatingItems[i];
            if (!a.loaded) continue;

            const pAx = isMobile ? 0 : cx * 90 * a.depth;
            const pAy = isMobile ? 0 : cy * 90 * a.depth;
            const cAx = a.x + pAx + a.width * 0.5;
            const cAy = a.y + pAy + a.height * 0.5;
            const hwA = a.width * 0.43;
            const hhA = a.height * 0.43;

            for (let j = i + 1; j < floatingItems.length; j++) {
                const b = floatingItems[j];
                if (!b.loaded) continue;

                const pBx = isMobile ? 0 : cx * 90 * b.depth;
                const pBy = isMobile ? 0 : cy * 90 * b.depth;
                const cBx = b.x + pBx + b.width * 0.5;
                const cBy = b.y + pBy + b.height * 0.5;
                const hwB = b.width * 0.43;
                const hhB = b.height * 0.43;

                const dx = cBx - cAx;
                const dy = cBy - cAy;
                const overlapX = (hwA + hwB) - Math.abs(dx);
                const overlapY = (hhA + hhB) - Math.abs(dy);

                if (overlapX > 0 && overlapY > 0) {
                    if (overlapX < overlapY) {
                        const signX = dx === 0 ? ((i + j) % 2 === 0 ? 1 : -1) : (dx > 0 ? 1 : -1);
                        const push = overlapX * 0.38;
                        a.x -= signX * push;
                        b.x += signX * push;
                        a.vx = Math.max(-0.75, Math.min(0.75, a.vx - signX * 0.015));
                        b.vx = Math.max(-0.75, Math.min(0.75, b.vx + signX * 0.015));
                    } else {
                        const signY = dy === 0 ? ((i + j) % 2 === 0 ? 1 : -1) : (dy > 0 ? 1 : -1);
                        const push = overlapY * 0.38;
                        a.y -= signY * push;
                        b.y += signY * push;
                        a.vy = Math.max(-0.75, Math.min(0.75, a.vy - signY * 0.015));
                        b.vy = Math.max(-0.75, Math.min(0.75, b.vy + signY * 0.015));
                    }
                }
            }
        }
    }
}

function animateFloatingImages(now) {
    frameCount++;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = smoothMouseX - 0.5;
    const cy = smoothMouseY - 0.5;

    for (let i = 0; i < floatingItems.length; i++) {
        const item = floatingItems[i];
        if (!item.loaded) continue;

        if (!item.appeared && now >= item.appearAt) {
            item.appeared = true;
            item.el.style.opacity = item.targetOpacity;
        }

        item.x += item.vx + Math.cos(frameCount * item.waveSpeed + item.waveOffset) * 0.24;
        item.y += item.vy + Math.sin(frameCount * item.waveSpeed + item.waveOffset) * 0.24;

        if (item.x < -item.width - 30) {
            item.x = w + 20;
            item.y = pickBestEntryCoord(item, 'x', item.x, Math.max(40, h - item.height));
        } else if (item.x > w + 30) {
            item.x = -item.width - 20;
            item.y = pickBestEntryCoord(item, 'x', item.x, Math.max(40, h - item.height));
        }

        if (item.y < -item.height - 30) {
            item.y = h + 20;
            item.x = pickBestEntryCoord(item, 'y', item.y, Math.max(40, w - item.width));
        } else if (item.y > h + 30) {
            item.y = -item.height - 20;
            item.x = pickBestEntryCoord(item, 'y', item.y, Math.max(40, w - item.width));
        }
    }

    resolveImageCollisions(cx, cy);

    for (let i = 0; i < floatingItems.length; i++) {
        const item = floatingItems[i];
        if (!item.loaded) continue;

        const parallaxX = isMobile ? 0 : cx * 90 * item.depth;
        const parallaxY = isMobile ? 0 : cy * 90 * item.depth;
        const dynamicRot = item.angle + Math.sin(frameCount * item.waveSpeed + item.waveOffset) * 3.5;

        item.el.style.transform = `translate3d(${item.x + parallaxX}px, ${item.y + parallaxY}px, 0) rotate(${dynamicRot.toFixed(2)}deg)`;
    }
}

// --- PARTICELLE: LA PIOGGIA D'ORO ---
const canvas = document.getElementById('particlesCanvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.7 + 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y > canvas.height) {
            this.y = -10;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.fillStyle = `rgba(246, 211, 101, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    const divider = isMobile ? 12000 : 7000;
    let numberOfParticles = (canvas.width * canvas.height) / divider;
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function mainLoop(now) {
    updateMulticolorBackground();
    animateFloatingImages(now || performance.now());

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }

    requestAnimationFrame(mainLoop);
}

createFloatingImages();
initParticles();
requestAnimationFrame(mainLoop);

// --- ANIMAZIONI ALLO SCROLL ---
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.10
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach((element) => {
    observer.observe(element);
});
