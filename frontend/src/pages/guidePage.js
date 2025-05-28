import { Navbar } from '../components/navbar.js';
import { TopNavbar } from '../components/topbar.js';

export function GuidePage() {
    let contentDiv = document.getElementById('content');
    if (!contentDiv) {
        contentDiv = document.createElement('div');
        contentDiv.id = 'content';
        document.body.appendChild(contentDiv);
    }

    // Limpiar y reiniciar
    document.querySelector('.divDerecho')?.remove();
    contentDiv.innerHTML = '';

    const container = document.createElement('div');
    container.classList.add('page');

    // Navbar y topbar
    contentDiv.append(Navbar(), TopNavbar());

    const main = document.createElement('main');
    main.classList.add('main-container');

    const title = document.createElement('h1');
    title.textContent = '📘 Guía completa de UniteWork';

    const secciones = [
        {
            icono: '🏢',
            titulo: 'Espacios de trabajo',
            color: 'bg-green-50',
            svg: 'workspace',
            contenido: [
                'Agrupan tableros Kanban y mapas mentales de un proyecto o equipo.',
                'Puedes ser Administrador (gestiona) o Miembro (colabora).',
                'Se puede invitar personas, ver actividad reciente y salir si ya no participas.',
                'Todo lo relacionado con tu organización empieza aquí.'
            ]
        },
        {
            icono: '🗂️',
            titulo: 'Tableros Kanban',
            color: 'bg-yellow-50',
            svg: 'kanban',
            contenido: [
                'Representan flujos de trabajo por columnas y tareas.',
                'Crea columnas como "Pendiente", "En curso", "Finalizado"...',
                'Arrastra tarjetas para cambiar su estado visualmente.',
                'Colabora con tu equipo y mantén tus tareas organizadas.'
            ]
        },
        {
            icono: '🧠',
            titulo: 'Mapas mentales',
            color: 'bg-purple-50',
            svg: 'mindmap',
            contenido: [
                'Organiza ideas de forma jerárquica y visual.',
                'Empieza desde un nodo central y expande con subnodos.',
                'Puedes mover, editar o eliminar nodos fácilmente.',
                'Ideal para lluvias de ideas, esquemas o planificaciones.'
            ]
        },
        {
            icono: '👥',
            titulo: 'Gestión de miembros',
            color: 'bg-pink-50',
            svg: 'users',
            contenido: [
                'Invita usuarios a espacios de trabajo o a tableros/mapas específicos.',
                'Define el rol: administrador (gestiona) o miembro (colabora).',
                'Los roles controlan quién puede modificar qué.',
                'Las invitaciones se envían por correo.'
            ]
        },
        {
            icono: '💡',
            titulo: 'Consejos de uso',
            color: 'bg-orange-50',
            svg: 'tips',
            contenido: [
                'Usa tableros Kanban para organizar tareas de forma visual.',
                'Usa mapas mentales para estructurar ideas complejas.',
                'Agrupa tus proyectos por espacios para mantener el orden.',
                'Haz mantenimiento regular a tus tareas y nodos.',
                'Colabora y comunica con tu equipo dentro de cada módulo.'
            ]
        },

    ];

    secciones.forEach(({ titulo, icono, contenido, color }, index) => {
        const section = document.createElement('section');
        section.classList.add('section-card', color);

        const header = document.createElement('div');
        header.classList.add('section-header');

        const icon = document.createElement('span');
        icon.textContent = icono;
        icon.classList.add('section-icon');

        const title = document.createElement('span');
        title.classList.add('section-title');
        title.textContent = titulo;

        header.append(icon, title);

        const ul = document.createElement('ul');
        ul.classList.add('section-list');

        contenido.forEach(texto => {
            const li = document.createElement('li');
            li.textContent = texto;
            ul.appendChild(li);
        });

        section.append(header, ul);
        main.appendChild(section);

        // ✅ Insertar GIF y texto después de la primera sección
        if (index === 2) {
            const tutorialDiv = document.createElement('div');
            tutorialDiv.classList.add('tutorial-section');

            const video = document.createElement('video');
            video.src = '../../public/img/tutorialkanban.mp4'; // reemplaza con la ruta real al video
            video.controls = true; // muestra controles de reproducción
            video.style.maxWidth = '100%';
            video.style.borderRadius = '1rem';
            video.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            video.style.marginBottom = '1rem';

            const text = document.createElement('p');
            text.textContent = '💡 En este ejemplo visual, puedes ver cómo crear tareas, moverlas y estructurar tus ideas como en este caso las tareas académicas. Ideal para proyectos colaborativos.';
            text.style.fontSize = '1.1rem';
            text.style.lineHeight = '1.6';
            text.style.color = '#334155';

            tutorialDiv.appendChild(video);
            tutorialDiv.appendChild(text);

            // Lo insertamos justo después del primer section
            main.appendChild(tutorialDiv);
        }
    });


    const divTop = document.createElement('div');
    divTop.id = 'divTop';
    divTop.appendChild(title);

    container.appendChild(divTop);
    container.appendChild(main);
    contentDiv.appendChild(container);
}
