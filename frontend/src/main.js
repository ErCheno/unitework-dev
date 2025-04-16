import '../src/public/styles/estilos.scss';
import page from 'page';
import { LoginPage } from './pages/loginPage.js';
import { DashboardPage } from './pages/dashboardPage.js';
import { RegisterPage } from './pages/registerPage.js';
import { isAuthenticated } from './public/js/auth.js';
import { myWorkspacesPage } from './pages/myworkspacesPage.js';

function checkToken() {
    const token = localStorage.getItem('token');
    return token !== null && token !== '';
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
page('/myworkspaces', () => {
    document.body.className = 'workspaces-bg';
    myWorkspacesPage();
});
page('/login', LoginPage);
page('/registro', RegisterPage);

page('/dashboard', () => {
    if (isAuthenticated()) {
        DashboardPage();
    } else {
        page('/login');
    }
});

page();