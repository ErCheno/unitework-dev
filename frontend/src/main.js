import '../public/styles/estilos.scss';
import page from 'page';
import { LoginPage } from './pages/loginPage.js';
import { DashboardPage } from './pages/dashboardPage.js';
import { RegisterPage } from './pages/registerPage.js';
import { isAuthenticated } from '../public/js/auth.js';
import { myWorkspacesPage } from './pages/myworkspacesPage.js';
import { workspacePage } from './pages/workspacePage.js';

/*function checkToken() {
    const token = localStorage.getItem('token');
    return token !== null && token !== '';
}*/

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


page('/dashboard', authGuard, () => {
    DashboardPage();
});


page('/myworkspaces', authGuard, () => {
    document.body.className = 'workspaces-bg';
    myWorkspacesPage();
});

page('/workspace/:workspaceId', authGuard, (context) => {
    const workspaceId = context.params.workspaceId;
    workspacePage(workspaceId);  // Llama a la función que maneja el contenido del workspace
});


page('/login', LoginPage);
page('/registro', RegisterPage);

page();