(function () {
    [...document.querySelectorAll(".control")].forEach(button => {
        button.addEventListener("click", function() {
            document.querySelector(".active-btn").classList.remove("active-btn");
            this.classList.add("active-btn");
            document.querySelector(".active").classList.remove("active");
            document.getElementById(button.dataset.id).classList.add("active");
        })
    });
    document.querySelector(".theme-btn").addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
    })
    const portfolioGrid = document.getElementById('portfolio-grid');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    portfolioItems.forEach(item => {
        // Add click listener to the overlay
        const overlay = item.querySelector('.project-overlay');
        overlay.addEventListener('click', () => {
            // Remove expanded class from all items
            portfolioItems.forEach(p => {
                p.classList.remove('expanded');
                p.classList.add('collapsed');
            });
            // Add expanded class to clicked item
            item.classList.remove('collapsed');
            item.classList.add('expanded');
        });

        // Add click listener to close button
        const closeBtn = item.querySelector('.close-btn');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            item.classList.remove('expanded');
            // Remove collapsed class from all items
            portfolioItems.forEach(p => {
                p.classList.remove('collapsed');
            });
        });
    });
})();
