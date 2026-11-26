const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const pdfUrl = 'magazine-digitale-collaborativo-unit8.pdf'; 

// Variabili globali per lo zoom
let currentZoom = 1;
let initialZoom = 1;

async function initFlipbook() {
    try {
        const statusText = document.getElementById('status-text');
        
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        
        // Risoluzione molto alta per l'HD (2.5)
        const HD_SCALE = 2.5; 
        const primaPagina = await pdf.getPage(1);
        const viewportBase = primaPagina.getViewport({ scale: HD_SCALE }); 
        
        const pdfWidth = viewportBase.width;
        const pdfHeight = viewportBase.height;
        const flipbookEl = document.getElementById('flipbook');

        // Genera pagine e Link
        for (let i = 1; i <= numPages; i++) {
            statusText.innerText = `Generazione pagina HD ${i} di ${numPages}...`;
            
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: HD_SCALE });

            const pageDiv = document.createElement('div');
            pageDiv.className = 'page';
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            pageDiv.appendChild(canvas); 

            // --- ESTRAZIONE DEI LINK DEL PDF ---
            const annotations = await page.getAnnotations();
            annotations.forEach(anno => {
                if (anno.subtype === 'Link' && anno.url) {
                    const rect = viewport.convertToViewportRectangle(anno.rect);
                    const x = Math.min(rect[0], rect[2]);
                    const y = Math.min(rect[1], rect[3]);
                    const width = Math.abs(rect[2] - rect[0]);
                    const height = Math.abs(rect[3] - rect[1]);

                    const linkEl = document.createElement('a');
                    linkEl.href = anno.url;
                    linkEl.target = '_blank';
                    linkEl.className = 'pdf-link';
                    linkEl.style.left = `${x}px`;
                    linkEl.style.top = `${y}px`;
                    linkEl.style.width = `${width}px`;
                    linkEl.style.height = `${height}px`;
                    linkEl.title = anno.url; 

                    pageDiv.appendChild(linkEl);
                }
            });

            flipbookEl.appendChild(pageDiv);
        }

        const screenWidth = window.innerWidth * 0.9;
        const screenHeight = window.innerHeight - 150; 
        
        const pageFlip = new St.PageFlip(flipbookEl, {
            width: pdfWidth,     
            height: pdfHeight,   
            size: "fixed",       
            showCover: true,     
            autoCenter: true,      // <-- AGGIUNTO: Centra automaticamente copertina e retro!
            maxShadowOpacity: 0.4, 
            usePortrait: false   
        });
        
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));

        initialZoom = Math.min(screenWidth / (pdfWidth * 2), screenHeight / pdfHeight);
        currentZoom = initialZoom;
        document.getElementById('flipbook-wrapper').style.transform = `scale(${currentZoom})`;

        // Chiude la schermata di caricamento
        const overlay = document.getElementById('loading-overlay');
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.style.display = 'none'; }, 500);

        setupControls(); 

    } catch (error) {
        console.error(error);
        document.getElementById('loading-overlay').innerHTML = `
            <div style="background: white; border-radius: 10px; padding: 30px; text-align: center; color: #cc0000;">
                <h2>Impossibile leggere il PDF</h2><p>${error.message}</p>
            </div>
        `;
    }
}

// --- GESTIONE DEI PULSANTI ---
function setupControls() {
    const wrapper = document.getElementById('flipbook-wrapper');
    const flipbook = document.getElementById('flipbook');

    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        currentZoom += 0.15;
        wrapper.style.transform = `scale(${currentZoom})`;
    });

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        currentZoom = Math.max(0.2, currentZoom - 0.15); 
        wrapper.style.transform = `scale(${currentZoom})`;
    });

    let scrollLocked = false;
    document.getElementById('btn-lock-scroll').addEventListener('click', function() {
        scrollLocked = !scrollLocked;
        flipbook.classList.toggle('scroll-locked', scrollLocked);
        this.classList.toggle('locked', scrollLocked);
        this.innerText = scrollLocked ? "Sblocca Scorrimento" : "Blocca Scorrimento";
    });

    let linksLocked = false;
    document.getElementById('btn-lock-links').addEventListener('click', function() {
        linksLocked = !linksLocked;
        flipbook.classList.toggle('links-locked', linksLocked);
        this.classList.toggle('locked', linksLocked);
        this.innerText = linksLocked ? "Sblocca Link" : "Blocca Link";
    });
}

initFlipbook();