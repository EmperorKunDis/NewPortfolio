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

    function setupSlideshows() {
        const slideshowContainers = document.querySelectorAll('.slideshow-container');
        
        slideshowContainers.forEach(container => {
            const images = container.querySelectorAll('img');
            // Clone images and append them to create seamless loop
            images.forEach(img => {
                const clone = img.cloneNode(true);
                container.appendChild(clone);
            });
        });
    }

    function openModal() {
            document.getElementById("myModal").style.display = "block";
        }

        // Funkce pro zavření modalu
        function closeModal() {
            document.getElementById("myModal").style.display = "none";
        }

        // Zavření modalu kliknutím mimo obsah
        window.onclick = function(event) {
            let modal = document.getElementById("myModal");
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    window.addEventListener('load', setupSlideshows);
    
    const portfolioGrid = document.getElementById('portfolio-grid');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const slideshowContainers = document.querySelectorAll('.slideshow-container');
    slideshowContainers.forEach(container => {
        container.addEventListener('animationend', () => {
            container.style.animation = 'none';
            container.offsetHeight; // Trigger reflow
            container.style.animation = null;
        });
    });

    portfolioItems.forEach(item => {
        // Add click listener to the overlay
        const overlay = item.querySelector('.project-overlay');
        overlay.addEventListener('click', () => {
            if (!item.classList.contains('expanded')) {
            // Add slide-in animation class
            item.classList.add('slide-in');
            
            // Remove expanded class from all items
            portfolioItems.forEach(p => {
                p.classList.remove('expanded');
                p.classList.add('collapsed');
            });
            
            // Add expanded class to clicked item
            item.classList.remove('collapsed');
            item.classList.add('expanded');
            
            // Trigger side decorator animations
            const decorators = item.querySelectorAll('.side-decorator');
            decorators.forEach(decorator => {
                decorator.style.animation = 'none';
                decorator.offsetHeight; // Trigger reflow
                decorator.style.animation = null;
            });
        }
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
