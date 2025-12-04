let currentPage = 0; // cover page is index 0

function showPage(index) {
    const pages = document.querySelectorAll('.page');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    pages.forEach((page, i) => {
        page.classList.remove('active');
        if (i === index) {
            page.classList.add('active');
        }
    });

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === pages.length - 1;
}

document.addEventListener("DOMContentLoaded", function () {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            showPage(currentPage);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < document.querySelectorAll('.page').length - 1) {
            currentPage++;
            showPage(currentPage);
        }
    });

    document.querySelectorAll('.toc-list button').forEach(button => {
        button.addEventListener('click', (e) => {
            const pageNum = parseInt(e.target.getAttribute('data-goto'));
            if (!isNaN(pageNum)) {
                currentPage = pageNum;
                showPage(currentPage);
            }
        });
    });

    // Initial page display
    showPage(currentPage);
});
