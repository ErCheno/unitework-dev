import '../src/public/styles/estilos.scss';
import page from 'page';
import { LoginPage } from './pages/loginPage.js';
import { DashboardPage } from './pages/dashboardPage.js';
import { RegisterPage } from './pages/registerPage.js';

// Definir las rutas con `page.js`
page('/', () => {
    page('/login');  // Redirigir a la página de login
});

page('/login', LoginPage);
page('/dashboard', DashboardPage);
page('/register', RegisterPage);

// Inicializa el enrutador
page();
