// Componente Navbar

import page from 'page';

export function Navbar() {
    const nav = document.createElement('nav');
    
    // Crear el enlace para el Dashboard
    const dashboardLink = document.createElement('a');
    dashboardLink.textContent = 'Dashboard';
    dashboardLink.href = '#/dashboard';  // El href sigue siendo útil para la navegación en la URL
    dashboardLink.onclick = (event) => {
        event.preventDefault();  // Prevenir que el enlace recargue la página
        page('/dashboard');  // Redirige sin recargar la página
    };

    // Crear el enlace para Login
    const loginLink = document.createElement('a');
    loginLink.textContent = 'Login';
    loginLink.href = '#/login';
    loginLink.onclick = (event) => {
        event.preventDefault();  // Prevenir que el enlace recargue la página
        page('/login');
    };

    // Crear el enlace para Register
    const registroLink = document.createElement('a');
    registroLink.textContent = 'Register';
    registroLink.href = '#/registro';
    registroLink.onclick = (event) => {
        event.preventDefault();  // Prevenir que el enlace recargue la página
        page('/registro');
    };

    // Añadir los enlaces al nav
    nav.appendChild(dashboardLink);
    nav.appendChild(loginLink);
    nav.appendChild(registroLink);

    return nav;
}
