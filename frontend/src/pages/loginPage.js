// LoginPage.js
import page from 'page';
import { LoginForm } from '../components/form.js';
import { Navbar } from '../components/Navbar.js';

export function LoginPage() {
    const contentDiv = document.getElementById('content');
    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }

    // Crear Navbar
    const navbar = Navbar();
    contentDiv.appendChild(navbar);

    // Crear Formulario de Login
    const form = LoginForm();
    contentDiv.appendChild(form);

    // Lógica del submit del formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;

        // Realizar la petición fetch al backend
        try {
            const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/auth/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            });

            const result = await response.json();

            // Manejar la respuesta del servidor
            if (result.status === 'success') {
                // Si la autenticación es exitosa, redirigir al dashboard
                page('/dashboard');
            } else {
                // Si hay error, mostrar mensaje
                alert(result.message);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('Hubo un error al intentar iniciar sesión');
        }
    });
}
