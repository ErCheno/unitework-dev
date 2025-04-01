// Página del Dashboard

import { Navbar } from '../components/Navbar.js';

export function DashboardPage() {
    const contentDiv = document.getElementById('content');
    
    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }

    const navbar = Navbar();
    contentDiv.appendChild(navbar);

    const h1 = document.createElement('h1');
    h1.textContent = 'Bienvenido al Dashboard';
    contentDiv.appendChild(h1);
}
