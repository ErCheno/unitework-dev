import { Navbar } from '../components/navbar.js';
import { TopNavbar } from '../components/topbar.js';
import { getToken } from '../public/js/auth.js';
import page from 'page';


export function DashboardPage() {
    const token = getToken();

    // Si no hay token, redirigimos al login
    if (!token) {
        page('/login');
        return;
    }

    const contentDiv = document.getElementById('content');
    const divDerecho = document.getElementsByClassName('divDerecho');
    if (divDerecho.length > 0) {
        divDerecho[0].remove();
    }

    // Limpiar contenido anterior
    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }

    // Navbar y TopNavbar
    const navbar = Navbar();
    contentDiv.appendChild(navbar);

    const topbar = TopNavbar();
    contentDiv.appendChild(topbar);

    // Establecer el contenido principal a la derecha del sidebar
    const mainContent = document.createElement('div');
    mainContent.className = 'main-content'; // Agregamos una clase para el estilo

    // Título del Dashboard

    // Contenedor general tipo grid o flex
    const dashboardContainer = document.createElement('div');
    dashboardContainer.className = 'dashboard-container';

    // Columna izquierda
    const leftColumn = document.createElement('div');
    leftColumn.className = 'dashboard-left';

    // h1 y párrafo
    const h1 = document.createElement('h1');
    h1.textContent = '¿Qué hay nuevo?';
    leftColumn.appendChild(h1);

    const p = document.createElement('p');
    p.textContent = 'Nuevas mejoras y actualizaciones para UWrk.';
    leftColumn.appendChild(p);

    // div del kanban
    const div3 = document.createElement('div');
    div3.className = 'divMainContent';
    div3.id = 'div3';

    const div3H2 = document.createElement('h2');
    div3H2.textContent = '¡Crea un tablero kanban enseguida!';
    div3.appendChild(div3H2);

    const kanbanBtn = document.createElement('button');
    kanbanBtn.textContent = 'Ir a mi tablero Kanban';
    kanbanBtn.className = 'kanban-btn';
    kanbanBtn.addEventListener('click', () => {
        page('/kanban');
    });
    div3.appendChild(kanbanBtn);

    const kanbanIntro = document.createElement('p');
    kanbanIntro.textContent = '"Organiza tus tareas visualmente y colabora con tu equipo de forma eficiente."';
    div3.appendChild(kanbanIntro);

    leftColumn.appendChild(div3);

    // Columna derecha
    const rightColumn = document.createElement('div');
    rightColumn.className = 'dashboard-right';

    const logo = document.createElement('img');
    logo.src = 'http://localhost/UniteWork/unitework-dev/assets/img/logoOriginal.png';
    logo.alt = 'Logo';
    logo.className = 'dashboard-logo';
    rightColumn.appendChild(logo);

    const illustration = document.createElement('img');
    illustration.src = 'http://localhost/UniteWork/unitework-dev/assets/img/tableroKanban.png';
    illustration.alt = 'Ilustración';
    illustration.id = 'illustration';
    illustration.className = 'dashboard-illustration';



    // NUEVO Carrusel con animación de deslizamiento
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-container';

    const carouselTrack = document.createElement('div');
    carouselTrack.className = 'carousel-track';

    const images = [
        'http://localhost/UniteWork/unitework-dev/assets/img/tableroKanban.png',
        'http://localhost/UniteWork/unitework-dev/assets/img/montanya.png',
        'http://localhost/UniteWork/unitework-dev/assets/img/teamwork.png'
    ];

    images.forEach((imgSrc) => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'carousel-img';
        carouselTrack.appendChild(img);
    });

    carouselContainer.appendChild(carouselTrack);

    // Botones
    const antesBtn = document.createElement('button');
    antesBtn.className = 'carousel-btn antes';

    const prevIcon = document.createElement('i');
    prevIcon.className = 'fas fa-chevron-left';
    antesBtn.appendChild(prevIcon);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-btn next';

    const nextIcon = document.createElement('i');
    nextIcon.className = 'fas fa-chevron-right';
    nextBtn.appendChild(nextIcon);

    carouselContainer.appendChild(antesBtn);
    carouselContainer.appendChild(nextBtn);


    // Lógica para deslizar
    let currentIndex = 0;

    function actualizarCarousel() {
        const offset = -currentIndex * 100;
        carouselTrack.style.transform = `translateX(${offset}%)`;
    }

    antesBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        actualizarCarousel();
    });
    
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length;
        actualizarCarousel();
    });
    
    // Deslizar automáticamente cada 5 segundos
    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        actualizarCarousel();
    }, 5000);
    

    const h3 = document.createElement('h3');
    h3.textContent = 'Implementaciones de esta semana';

    rightColumn.appendChild(h3);
    rightColumn.appendChild(carouselContainer);

    const rightText = document.createElement('p');
    const rightText2 = document.createElement('p');
    rightText.textContent = '¡Nos alegra tenerte de vuelta! Prepárate para organizarlo todo.'; 
    rightText.id = 'rightText';
    rightText2.textContent = 'Con nuestra nueva interfaz, podrás visualizar tus tareas, compartir ideas y trabajar junto a tu equipo de forma más fluida y eficiente. ¡La organización nunca fue tan intuitiva!';
    rightColumn.appendChild(rightText);
    rightColumn.appendChild(rightText2);

    const divSaber = document.createElement('div');
    divSaber.id = 'sabermas';

    const aSaberMas = document.createElement('a');
    aSaberMas.textContent = 'Saber Más ';
    const iconSaberMas = document.createElement('i');
    iconSaberMas.className = 'fa-solid fa-arrow-right'

    divSaber.appendChild(aSaberMas);
    aSaberMas.appendChild(iconSaberMas);
    rightColumn.appendChild(divSaber);



    // Añadir columnas al contenedor principal
    dashboardContainer.appendChild(leftColumn);
    dashboardContainer.appendChild(rightColumn);

    // Añadir al mainContent
    mainContent.appendChild(dashboardContainer);
    contentDiv.appendChild(mainContent);

}
