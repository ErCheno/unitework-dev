import '../src/public/styles/estilos.scss';
import page from 'page';
import { LoginPage } from './pages/loginPage.js';
import { DashboardPage } from './pages/dashboardPage.js';
import { RegisterPage } from './pages/registerPage.js';
import { isAuthenticated } from './public/js/auth.js';

function checkToken() {
    const token = localStorage.getItem('token');
    return token !== null && token !== ''; 
}
// Definir las rutas con `page.js`
page('/', () => {
    if (isAuthenticated()) {
        page.redirect('/dashboard');
    } else {
        page.redirect('/login');
    }});

page('/login', LoginPage);
page('/registro', RegisterPage);

// Ruta protegida para el dashboard
page('/dashboard', () => {
    if (checkToken()) {
        DashboardPage(); 
    } else {
        page.redirect('/login');
    }
});

page();

