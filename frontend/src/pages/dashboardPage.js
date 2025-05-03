import { Navbar } from '../components/navbar.js';
import { TopNavbar } from '../components/topbar.js';
import { getToken } from '../../public/js/auth.js';
import page from 'page';


export function DashboardPage() {
    const token = getToken();
    if (!token) {
        page('/login');
        return;
    }

    // Buscar o crear el div#content
    let contentDiv = document.getElementById('content');
    if (!contentDiv) {
        contentDiv = document.createElement('div');
        contentDiv.id = 'content';
        document.body.appendChild(contentDiv);
    }

    // Eliminar divDerecho si existe
    const divDerecho = document.querySelector('.divDerecho');
    if (divDerecho) divDerecho.remove();

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
    mainContent.className = 'main-content';

    // Título del Dashboard

    // Contenedor general tipo grid o flex
    const dashboardContainer = document.createElement('div');
    dashboardContainer.className = 'dashboard-container';

    // Columna izquierda
    const leftColumn = document.createElement('div');
    leftColumn.className = 'dashboard-left';

    // h1 y párrafo
    const h1 = document.createElement('h1');
    const usuarioId = localStorage.getItem('username');
    h1.textContent = '¡Bienvenid@ '+usuarioId+'!';
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
    logo.src = './public/img/logoOriginal.png';
    logo.alt = 'Logo';
    logo.className = 'dashboard-logo';
    rightColumn.appendChild(logo);

    const illustration = document.createElement('img');
    illustration.src = './public/img/tableroKanban.png';
    illustration.alt = 'Ilustración';
    illustration.id = 'illustration';
    illustration.className = 'dashboard-illustration';



    // Carrusel Bootstrap// Carrusel Bootstrap
    const carouselWrapper = document.createElement('div');
    carouselWrapper.id = 'dashboardCarousel';
    carouselWrapper.className = 'carousel slide';
    carouselWrapper.setAttribute('data-bs-ride', 'carousel');

    // Contenedor interno de las imágenes
    const carouselInner = document.createElement('div');
    carouselInner.className = 'carousel-inner';

    const carouselImages = [
        './public/img/tableroKanban.png',
        './public/img/montanya.png',
        './public/img/teamwork.png'
    ];

    let imagesLoaded = 0;
    carouselImages.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = index === 0 ? 'carousel-item active' : 'carousel-item';
    
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Slide ${index + 1}`;
        img.className = 'd-block w-100'; 
        img.style.height = '100%';
        img.style.objectFit = 'cover';
    
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === carouselImages.length) {
                document.getElementById('dashboardCarousel').classList.add('show-carousel');
            }
        };
    
        item.appendChild(img);
        carouselInner.appendChild(item);
    });
    

    carouselWrapper.appendChild(carouselInner);

    // Botón anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-control-prev';
    prevBtn.type = 'button';
    prevBtn.setAttribute('data-bs-target', '#dashboardCarousel');
    prevBtn.setAttribute('data-bs-slide', 'prev');

    const prevIcon = document.createElement('span');
    prevIcon.className = 'carousel-control-prev-icon';
    prevIcon.setAttribute('aria-hidden', 'true');

    const prevText = document.createElement('span');
    prevText.className = 'visually-hidden';
    prevText.textContent = 'Anterior';

    prevBtn.appendChild(prevIcon);
    prevBtn.appendChild(prevText);

    // Botón siguiente
    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-control-next';
    nextBtn.type = 'button';
    nextBtn.setAttribute('data-bs-target', '#dashboardCarousel');
    nextBtn.setAttribute('data-bs-slide', 'next');

    const nextIcon = document.createElement('span');
    nextIcon.className = 'carousel-control-next-icon';
    nextIcon.setAttribute('aria-hidden', 'true');

    const nextText = document.createElement('span');
    nextText.className = 'visually-hidden';
    nextText.textContent = 'Siguiente';

    nextBtn.appendChild(nextIcon);
    nextBtn.appendChild(nextText);

    // Insertar los botones en el carrusel
    carouselWrapper.appendChild(prevBtn);
    carouselWrapper.appendChild(nextBtn);

    // Título arriba del carrusel
    const h3 = document.createElement('h3');
    h3.textContent = '¿Qué hay nuevo?';
    rightColumn.appendChild(h3);
    rightColumn.appendChild(carouselWrapper);



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
