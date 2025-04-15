// myWorkspacesPage.js
import page from 'page';
import { Navbar } from '../components/navbar.js';
import { TopNavbar } from '../components/topbar.js';
import { cleanupView } from '../public/js/cleanup.js';
import { WorkspaceCard } from '../components/workspaceCard.js';

export function myWorkspacesPage() {
    cleanupView();
    // Buscar o crear el div#content
    let contentDiv = document.getElementById('content');
    if (!contentDiv) {
        contentDiv = document.createElement('div');
        contentDiv.id = 'content';
        document.body.appendChild(contentDiv);
    }

    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }

    const container = document.createElement('div');
    container.id = 'container';

    const navbar = Navbar();
    const topbar = TopNavbar();

    container.appendChild(navbar);
    container.appendChild(topbar);

    const title = document.createElement('h1');
    title.textContent = 'Mis espacios de trabajo';
    title.style.textAlign = 'center';

    const grid = document.createElement('div');
    grid.id = 'workspace-list';

    // Datos simulados por ahora
    const workspaces = [
        {
            id: 1,
            nombre: 'Proyecto Alpha',
            ultimaActividad: 'Hace 2 días',
            miembros: 5,
            rol: 'admin'
        },
        {
            id: 2,
            nombre: 'Equipo Beta',
            ultimaActividad: 'Hoy',
            miembros: 12,
            rol: 'member'
        }
    ];
    workspaces.forEach(ws => {
        const card = WorkspaceCard(ws);
        grid.appendChild(card);
    });
    
    /*workspaces.forEach(ws => {
        const card = document.createElement('div');
        card.className = 'workspace-card';

        const header = document.createElement('div');
        header.className = 'workspace-header';

        const name = document.createElement('h3');
        name.textContent = ws.nombre;

        const dots = document.createElement('span');
        dots.className = 'dots';
        dots.textContent = '⋮';

        header.appendChild(name);
        header.appendChild(dots);

        const actividad = document.createElement('p');
        actividad.className = 'actividad';
        actividad.textContent = `Última actividad: ${ws.ultimaActividad}`;

        const info = document.createElement('p');
        info.className = 'info';
        info.textContent = `${ws.miembros} miembros`;

        const footer = document.createElement('div');
        footer.className = 'workspace-footer';

        const rol = document.createElement('span');
        rol.className = `rol ${ws.rol}`;
        rol.textContent = ws.rol === 'admin' ? 'Administrador' : 'Miembro';

        const enterBtn = document.createElement('button');
        enterBtn.className = 'enter-btn';
        enterBtn.textContent = '→';
        enterBtn.title = 'Entrar';

        enterBtn.addEventListener('click', () => {
            console.log(`Entrando a workspace ${ws.id}`);
            // Redirigir a la vista del workspace
            // page(`/workspace/${ws.id}`);
        });

        footer.appendChild(rol);
        footer.appendChild(enterBtn);

        card.appendChild(header);
        card.appendChild(actividad);
        card.appendChild(info);
        card.appendChild(footer);

        grid.appendChild(card);
    });*/

    container.appendChild(title);
    container.appendChild(grid);
    contentDiv.appendChild(container);
}
