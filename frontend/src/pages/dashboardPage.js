// Página del Dashboard

import { Navbar } from '../components/Navbar.js';
import page from 'page';
import { checkToken } from "../public/js/auth.js";

export function DashboardPage() {
    const token = localStorage.getItem('token');

    if (token) {
        checkToken(); 

        const contentDiv = document.getElementById('content');

        while (contentDiv.firstChild) {
            contentDiv.removeChild(contentDiv.firstChild);
        }

        const navbar = Navbar();
        contentDiv.appendChild(navbar);

        const h1 = document.createElement('h1');
        h1.textContent = 'Bienvenido al Dashboard';
        contentDiv.appendChild(h1);

    } else {
        page('/login');
    }

}
