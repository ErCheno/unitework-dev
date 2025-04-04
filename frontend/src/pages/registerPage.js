// registerPage.js
import page from 'page';
import { RegisterForm } from '../components/form.js';
import { Navbar } from '../components/Navbar.js';
//import { isAuthenticated } from '../public/js/auth.js';



// Manejo de envío de formulario
export function RegisterPage() {
    const contentDiv = document.getElementById('content');
    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }
    // Crear Navbar
    const navbar = Navbar();
    contentDiv.appendChild(navbar);
    
    const form = RegisterForm();
    contentDiv.appendChild(form);
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Verificar si las contraseñas coinciden
        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        const userData = {
            name: username,  
            email: email,
            password: password,
            confirmPassword: confirmPassword
        };

        try {
            const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/auth/registro.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)  
            });

            const result = await response.json(); 

            if (result.status === "success") {
                alert("Registro exitoso. Puedes iniciar sesión.");
                page('/login');  
            } else {
                alert(result.message);  // Mostrar el mensaje de error del backend
            }
        } catch (error) {
            alert("Hubo un problema al registrar el usuario.");
            console.error(error);
        }
    });
}
