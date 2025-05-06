import '../public/styles/estilos.scss';
import page from 'page';
import { LoginPage } from './pages/loginPage.js';
import { DashboardPage } from './pages/dashboardPage.js';
import { RegisterPage } from './pages/registerPage.js';
import { isAuthenticated } from '../public/js/auth.js';
import { myWorkspacesPage } from './pages/myworkspacesPage.js';
import { workspacePage } from './pages/workspacePage.js';
import { BoardPage } from './pages/boardPage.js';
import { fetchWorkspaces } from '../public/js/workspaces.js';
import { fetchBoards } from '../public/js/board.js';


// Función de guardia para rutas protegidas
function authGuard(ctx, next) {
    if (!isAuthenticated()) {
        page('/login');
    } else {
        next();
    }
}

// Definir las rutas con `page.js`
page('/', () => {
    if (isAuthenticated()) {
        page('/dashboard');
        document.body.className = 'dashboard-bg';
    } else {
        page('/login');
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
    const boardPageContent = BoardPage(boardId); 
    const root = document.getElementById('content');
    root.textContent = '';
    root.appendChild(boardPageContent);
});

// Ruta de login
page('/login', LoginPage);

// Ruta de registro
page('/registro', RegisterPage);

// Iniciar el enrutador de `page.js`
page.start();
