// Componente Navbar

import page from 'page';
import { logout } from '../public/js/auth.js';


export function Navbar() {
    const nav = document.createElement('nav');
    const username = localStorage.getItem("username") || "Usuario";
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    console.log(logoutBtn);

    const dashboardLink = document.createElement('a');
    dashboardLink.textContent = 'Dashboard';
    dashboardLink.href = '#/dashboard'; 
    dashboardLink.onclick = (event) => {
        event.preventDefault();
        page('/dashboard'); 
    };

    // Crear el enlace para Login
    const loginLink = document.createElement('a');
    loginLink.textContent = 'Login';
    loginLink.href = '#/login';
    loginLink.onclick = (event) => {
        event.preventDefault(); 
        page('/login');
    };

    // Crear el enlace para Register
    const registroLink = document.createElement('a');
    registroLink.textContent = 'Register';
    registroLink.href = '#/registro';
    registroLink.onclick = (event) => {
        event.preventDefault(); 
        page('/registro');
    };

    // Añadir los enlaces al nav
    nav.appendChild(dashboardLink);
    nav.appendChild(loginLink);
    nav.appendChild(registroLink);
    nav.appendChild(logoutBtn);

    nav.querySelector('#logoutBtn').addEventListener('click', () => {
        logout();
    });
    return nav;
}
