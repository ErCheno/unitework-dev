import { Navbar } from '../components/navbar.js';
import { TopNavbar } from '../components/topbar.js';
import { getToken } from '../js/auth.js';
import page from 'page';
import { socketGetWorkspaces } from '../js/socketsEvents.js';
import { fetchWorkspaces } from '../js/workspaces.js';
import { fetchBoards } from '../js/board.js';
import { fetchMindMaps } from '../js/mindMap.js';
import { lightenColor } from '../components/mindMapCard.js';


export async function DashboardPage() {
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
    const inicioContainer = document.createElement('div');
    inicioContainer.id = 'inicioContainer';


    const divTituloInicio = document.createElement('div');
    divTituloInicio.id = 'divTituloInicio';
    const icoLogo = document.createElement('img');
    icoLogo.src = './public/img/logoOriginal.png';
    const h2Inicio = document.createElement('h2');
    h2Inicio.textContent = 'Estos son tus proyectos, ' + localStorage.getItem('username');

    divTituloInicio.appendChild(icoLogo);
    divTituloInicio.appendChild(h2Inicio);

    inicioContainer.appendChild(divTituloInicio);

    function createRecentSection(id, title) {
        const section = document.createElement('section');
        section.id = id;
        section.className = 'recent-section';

        let icono;

        switch (id) {
            case 'recentWorkspaces':
                icono = document.createElement('i');
                icono.className = 'fa-solid fa-toolbox';
                break;

            case 'recentKanbans':
                icono = document.createElement('i');
                icono.className = 'fa-solid fa-columns';
                break;

            case 'recentMindMaps':
                icono = document.createElement('i');
                icono.className = 'fa-solid fa-diagram-project';
                break;

            default:
                icono = document.createElement('i');
                icono.className = 'fa-solid fa-question-circle';
        }

        const h2 = document.createElement('h2');
        h2.textContent = title;
        const divSection = document.createElement('div');
        divSection.id = 'divSection';
        divSection.appendChild(icono);
        divSection.appendChild(h2);

        const divSubInformacion = document.createElement('div');
        divSubInformacion.id = 'divSubInformacion';

        const spanSubInformacion = document.createElement('span');
        spanSubInformacion.className = 'spanSubInformacion';

        // Cambiar texto según tipo
        if (id === 'recentKanbans') {
            spanSubInformacion.textContent = 'Accede rápidamente a tus tableros Kanban y organiza tus tareas.';
        } else if (id === 'recentMindMaps') {
            spanSubInformacion.textContent = 'Explora y edita tus mapas mentales para potenciar tus ideas.';
        } else {
            spanSubInformacion.textContent = 'Accede rápidamente a los espacios donde colaboras con tu equipo.';
        }

        divSubInformacion.appendChild(spanSubInformacion);
        section.appendChild(divSection);
        section.appendChild(divSubInformacion);

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'recent-cards-container';
        section.appendChild(cardsContainer);

        return { section, cardsContainer };
    }

    const workspacesSection = createRecentSection('recentWorkspaces', 'Espacios de trabajo recientes');
    const kanbansSection = createRecentSection('recentKanbans', 'Tableros Kanban recientes');
    const mindmapsSection = createRecentSection('recentMindMaps', 'Mapas mentales recientes');

    const hrInicio1 = document.createElement('hr');
    const hrInicio2 = document.createElement('hr');

    hrInicio1.className = 'hrInicio';
    hrInicio2.className = 'hrInicio';


    inicioContainer.appendChild(kanbansSection.section);
    inicioContainer.appendChild(hrInicio1);
    inicioContainer.appendChild(mindmapsSection.section);
    inicioContainer.appendChild(hrInicio2);
    inicioContainer.appendChild(workspacesSection.section);

    function createCard(title, id = null) {
        const card = document.createElement('div');
        card.className = 'recent-card';
        card.title = title;

        if (id !== null) {
            card.setAttribute('data-id', id);

            card.addEventListener('click', () => {
                // Navegación SPA con page.js u otra lib,
                page(`/workspace/${id}`);
            });
        }

        card.textContent = title;
        return card;
    }

    function createKanbanCard(nombre, id, color) {
        const card = document.createElement('div');
        card.className = 'recent-card-kanban';
        card.title = nombre;

        if (id !== null) {
            card.setAttribute('data-id', id);
            card.style.backgroundColor = color;

            card.addEventListener('click', () => {
                page(`/board/${id}`);
            });
        }

        card.textContent = nombre;
        return card;
    }

    function createCardMindmaps(nombre, id, color) {
        const card = document.createElement('div');
        card.classList.add('recent-card-mindmap'); // Añade clases para estilos específicos si quieres
        card.title = nombre;

        if (id !== null) {
            card.setAttribute('data-id', id);
            const lightColor = lightenColor(color, 40); // Aclarar un 10%
            card.style.backgroundColor = lightColor;
            // Añadir redirección al hacer clic
            card.addEventListener('click', () => {
                // Asumiendo que usas navegación SPA con page.js u otra lib,
                // o simplemente redirección por URL
                page(`/mindmap/${id}`);
            });
        }
        card.textContent = nombre;
        return card;
    }



    // --- Obtener workspaces reales ---
    try {
        const workspaces = await fetchWorkspaces('actividad_desc');

        workspaces.slice(0, 5).forEach(ws => {
            const card = createCard(ws.nombre, ws.id);
            workspacesSection.cardsContainer.appendChild(card);
        });

        // Traer tableros de esos workspaces
        for (const ws of workspaces.slice(0, 5)) {
            const boards = await fetchBoards(ws.id); // ← le pasas el ID de cada workspace

            boards.forEach(board => {
                const card = createKanbanCard(board.nombre, board.id, board.color);
                kanbansSection.cardsContainer.appendChild(card);
            });
        }

        // Traer mindmaps de esos workspaces
        for (const ws of workspaces.slice(0, 5)) {
            const mindmaps = await fetchMindMaps(ws.id); // ← le pasas el ID de cada workspace

            mindmaps.forEach(mindmap => {
                const card = createCardMindmaps(mindmap.titulo, mindmap.id, mindmap.color);
                mindmapsSection.cardsContainer.appendChild(card);
            });
        }


    } catch (error) {
        console.error('Error al obtener espacios de trabajo recientes:', error);
    }

    // Contenedor general tipo grid o flex
    const dashboardContainer = document.createElement('div');
    dashboardContainer.className = 'dashboard-container';

    // Columna izquierda
    const leftColumn = document.createElement('div');
    leftColumn.className = 'dashboard-left';

    // h1 y párrafo
    const h1 = document.createElement('h1');
    const usuarioId = localStorage.getItem('username');
    h1.textContent = '¡Bienvenid@ ' + usuarioId + '!';
    leftColumn.appendChild(h1);

    const p = document.createElement('p');
    p.textContent = 'Seguimos mejorando para ti. ¡Descubre lo nuevo!';
    leftColumn.appendChild(p);

    // div del kanban
    const div3 = document.createElement('div');
    div3.className = 'divMainContent';
    div3.id = 'div3';

    const div3H2 = document.createElement('h2');
    div3H2.textContent = '¡Comencemos a trabajar!';
    div3.appendChild(div3H2);

    const kanbanBtn = document.createElement('button');
    kanbanBtn.textContent = 'Ir a mis espacios de trabajo';
    kanbanBtn.className = 'kanban-btn';
    kanbanBtn.addEventListener('click', () => {
        page('/myworkspaces');
    });
    div3.appendChild(kanbanBtn);

    const kanbanIntro = document.createElement('p');
    kanbanIntro.textContent = '"Organiza tus tareas visualmente y colabora con tu equipo de forma eficiente."';
    div3.appendChild(kanbanIntro);

    leftColumn.appendChild(div3);

    const h2Down = document.createElement('h2');
    h2Down.textContent = '¿Primera vez aquí?'

    const img = document.createElement('img');
    img.src = "../../public/img/undraw_creative-flow_t3kz.svg";
    img.alt = "Ilustración creativa";
    img.style.width = "200px";




    // Columna derecha
    const rightColumn = document.createElement('div');
    rightColumn.className = 'dashboard-right';

    const logo = document.createElement('img');
    logo.src = './public/img/logoOriginal.png';
    logo.alt = 'Logo';
    logo.className = 'dashboard-logo';
    //rightColumn.appendChild(logo);

    const illustration = document.createElement('img');
    illustration.src = './public/img/tableroKanban.png';
    illustration.alt = 'Ilustración';
    illustration.id = 'illustration';
    illustration.className = 'dashboard-illustration';

    // Título arriba del carrusel
    const h3 = document.createElement('h3');
    h3.textContent = '¿Qué hay nuevo?';
    //rightColumn.appendChild(carouselWrapper);

    const divInformacion = document.createElement('div');
    divInformacion.id = 'divInformacion';
    divInformacion.appendChild(h2Down);

    divInformacion.appendChild(img);


    const rightText2 = document.createElement('p');
    rightText2.id = 'rightText2';
    rightText2.textContent = 'Esta guía está diseñada para ayudarte a entender el funcionamiento de la aplicación paso a paso. Aquí encontrarás explicaciones claras, ejemplos visuales y consejos prácticos sobre cómo usar cada sección: desde crear un espacio de trabajo o tablero, hasta colaborar con tu equipo y organizar tus ideas en mapas mentales.';
    divInformacion.appendChild(rightText2);
    const divSaber = document.createElement('div');
    divSaber.id = 'sabermas';
    divSaber.style.cursor = 'pointer'; // estilo para cursor pointer

    const aSaberMas = document.createElement('a');
    aSaberMas.textContent = 'Saber Más ';
    const iconSaberMas = document.createElement('i');
    iconSaberMas.className = 'fa-solid fa-arrow-right';

    aSaberMas.appendChild(iconSaberMas);
    divSaber.appendChild(aSaberMas);

    // Añadir el event listener para navegación SPA con page.js
    divSaber.addEventListener('click', () => {
        page('/guia');  // Cambia '/ruta-nueva' por la ruta real
    });

    // Suponiendo que divInformacion y leftColumn ya existen en tu DOM
    divInformacion.appendChild(divSaber);
    leftColumn.appendChild(divInformacion);



    // Añadir columnas al contenedor principal
    dashboardContainer.appendChild(leftColumn);
    dashboardContainer.appendChild(inicioContainer);


    // Añadir al mainContent
    mainContent.appendChild(dashboardContainer);
    contentDiv.appendChild(mainContent);

    socketGetWorkspaces();

}
