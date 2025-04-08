import { Navbar } from '../components/navbar.js';
import { getToken } from '../public/js/auth.js';
import page from 'page';


export function DashboardPage() {
    const token = getToken();

    // Si no hay token, redirigimos al login
    if (!token) {
        page('/login');
        return;
    }

    const contentDiv = document.getElementById('content');
    const divDerecho = document.getElementsByClassName('divDerecho');
    if (divDerecho.length > 0) {
        divDerecho[0].remove();
    }

    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }

    const navbar = Navbar();
    contentDiv.appendChild(navbar);

    const h1 = document.createElement('h1');
    h1.textContent = 'Bienvenido al Dashboard';
    contentDiv.appendChild(h1);

}