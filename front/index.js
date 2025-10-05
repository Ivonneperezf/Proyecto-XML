// Variables
let currentIndex = 2;
const cards = document.querySelectorAll('.card-3d');
const indicators = document.querySelectorAll('.indicator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const coverflowWrapper = document.querySelector('.coverflow-wrapper');
let autoPlayInterval;

// Función para actualizar las posiciones de las tarjetas
function updateCards() {
    cards.forEach((card, index) => {
        const relativePosition = index - currentIndex;

        card.classList.remove('active');
        card.setAttribute('data-index', Math.abs(relativePosition));

        if (relativePosition === 0) {
            card.classList.add('active');
            card.style.transform = 'translateX(0) translateZ(0) rotateY(0deg) scale(1)';
            card.style.opacity = '1';
            card.style.zIndex = '10';
        } else if (relativePosition === -1) {
            card.style.transform = 'translateX(-250px) translateZ(-150px) rotateY(20deg) scale(0.85)';
            card.style.opacity = '0.7';
            card.style.zIndex = '2';
        } else if (relativePosition === -2) {
            card.style.transform = 'translateX(-500px) translateZ(-300px) rotateY(35deg) scale(0.7)';
            card.style.opacity = '0.5';
            card.style.zIndex = '1';
        } else if (relativePosition === 1) {
            card.style.transform = 'translateX(250px) translateZ(-150px) rotateY(-20deg) scale(0.85)';
            card.style.opacity = '0.7';
            card.style.zIndex = '2';
        } else if (relativePosition === 2) {
            card.style.transform = 'translateX(500px) translateZ(-300px) rotateY(-35deg) scale(0.7)';
            card.style.opacity = '0.5';
            card.style.zIndex = '1';
        } else {
            card.style.opacity = '0';
            card.style.zIndex = '0';
        }
    });

    // Actualizar indicadores
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
}

// Función para ir al siguiente
function nextSlide() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCards();
}

// Función para ir al anterior
function prevSlide() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCards();
}

// Función para ir a un índice específico
function goToSlide(index) {
    currentIndex = index;
    updateCards();
}

// Funciones de Autoplay
function startAutoplay() {
    autoPlayInterval = setInterval(nextSlide, 2000); // Inicia el autoplay
}

function stopAutoplay() {
    clearInterval(autoPlayInterval); // Detiene el autoplay
}

// Event Listeners
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => goToSlide(index));
});
coverflowWrapper.addEventListener('mouseenter', stopAutoplay); //Pausa al pasar el mouse
coverflowWrapper.addEventListener('mouseleave', startAutoplay); //Sigue al quitar el mouse

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevSlide();
    } else if (e.key === 'ArrowRight') {
        nextSlide();
    }
});

// Touch/Swipe support
let touchStartX = 0;
let touchEndX = 0;

coverflowWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    // Simula mouseover al tocar
    coverflowWrapper.classList.add('hovered');
});

coverflowWrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    // Quita el efecto de hover después de un momento
    setTimeout(() => {
        coverflowWrapper.classList.remove('hovered');
    }, 500);
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        nextSlide();
    }
    if (touchEndX > touchStartX + 50) {
        prevSlide();
    }
}

// Inicializar
updateCards();
startAutoplay(); // 🔁 Autoplay activado desde el inicio