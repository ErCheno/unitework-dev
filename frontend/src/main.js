import '../public/styles/estilos.scss';
import page from 'page';
import { LoginPage } from './pages/loginPage.js';
import { DashboardPage } from './pages/dashboardPage.js';
import { RegisterPage } from './pages/registerPage.js';
import { isAuthenticated } from './js/auth.js';
import { myWorkspacesPage } from './pages/myworkspacesPage.js';
import { workspacePage } from './pages/workspacePage.js';
import { BoardPage } from './pages/boardPage.js';
import { fetchWorkspaces } from './js/workspaces.js';
import { fetchBoards } from './js/board.js';
import { connectSocket } from './js/socket.js';
import { MindMapPage } from './pages/mindMapPage.js';
import { showToast } from '../public/js/validator/regex.js';
import { GuidePage } from './pages/guidePage.js';

window.addEventListener('load', () => {
    connectSocket();  // Llamamos a connectSocket en la carga de la página
    // Aquí luego puedes hacer otras acciones relacionadas con el socket
});
connectSocket();

// Función de guardia para rutas protegidas
function authGuard(ctx, next) {
    if (!isAuthenticated()) {
        page.redirect('/login'); // usar redirect para claridad
        return; // ← MUY IMPORTANTE
    }
    next(); // solo se ejecuta si hay token
}

// Definir las rutas con `page.js`
page('/', () => {
    if (isAuthenticated()) {
        page.redirect('/dashboard');
        document.body.className = 'dashboard-bg';
    } else {
        page.redirect('/login');
    }
});
// Ruta para el dashboard (activar polling)
page('/dashboard', authGuard, () => {
    DashboardPage();
    //startPollingNotificaciones();
});

// Ruta para la página de workspaces (activar polling)
page('/myworkspaces', authGuard, () => {
    document.body.className = 'workspaces-bg';
    myWorkspacesPage();
});

// Ruta para los workspaces específicos (desactivar polling si no es necesario)
page('/workspace/:workspaceId', authGuard, (context) => {
    const workspaceId = context.params.workspaceId;
    workspacePage(workspaceId);

});


// Ruta para el tablero específico (desactivar polling si no es necesario)
page('/board/:boardId', authGuard, (context) => {
    const boardId = context.params.boardId;
    BoardPage(boardId); 
});


page('/mindmap/:mindmapId', authGuard, (context) => {
    const mindmapId = context.params.mindmapId;
    MindMapPage(mindmapId); 
});

/*
page('/board/:boardId', authGuard, (context) => {
    const boardId = context.params.boardId;
    const boardPageContent = BoardPage(boardId); 
    const root = document.getElementById('content');
    root.textContent = '';
    root.appendChild(boardPageContent);
});
*/

// Ruta de login
page('/login', LoginPage);

// Ruta de registro
page('/registro', RegisterPage);

page('/guia', GuidePage);

// Ruta para ir al último tablero visitado
page('/lastboard', authGuard, () => {
  const ultimoBoardId = localStorage.getItem('ultimo_board_id');
  if (ultimoBoardId) {
    page.redirect(`/board/${ultimoBoardId}`);
  } else {
    page.redirect('/myworkspaces'); // fallback
    showToast('Parece que no te has metido a algún tablero recientemente o ha sido borrado...');
  }
});

// Ruta para ir al último mapa mental visitado
page('/lastmindmap', authGuard, () => {
  const ultimoMindmapId = localStorage.getItem('ultimo_map_id');
  if (ultimoMindmapId) {
    page.redirect(`/mindmap/${ultimoMindmapId}`);
  } else {
    page.redirect('/myworkspaces'); // fallback
    showToast('Parece que no te has metido a algún mapa recientemente o ha sido borrado...');
  }
});



// Iniciar el enrutador de `page.js`
page.start();


