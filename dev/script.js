const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const pdfLinks = document.querySelectorAll('.pdf-link');
const pdfRender = document.getElementById('pdf-render');

function setTheme(isDark) {
    if (isDark) {
        body.classList.add('dark');
        themeToggle.textContent = '☀️';
    } else {
        body.classList.remove('dark');
        themeToggle.textContent = '🌙';
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
    const isDark = !body.classList.contains('dark');
    setTheme(isDark);
});

const savedTheme = localStorage.getItem('theme');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

if (savedTheme === 'light') {
    setTheme(false);
} else {
    setTheme(true);
}

pdfLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pdfUrl = link.getAttribute('href');
        renderPDF(pdfUrl);
    });
});

function renderPDF(url) {
    pdfjsLib.getDocument(url).promise.then(pdf => {
        pdf.getPage(1).then(page => {
            const scale = 1.5;
            const viewport = page.getViewport({ scale: scale });

            const canvas = document.getElementById('pdf-render');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext);
        });
    });
}

