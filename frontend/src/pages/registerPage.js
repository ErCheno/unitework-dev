import page from 'page';
import { RegisterForm } from '../components/form.js';
import { isValidUsername, isValidEmail, isValidPassword } from '../public/js/validator/regex.js';
import { showToast } from '../public/js/validator/regex.js';
import { cleanupView } from '../public/js/cleanup.js';

export function RegisterPage() {
    cleanupView();

    
    // Eliminar contenedores previos si existen
    const oldAuthContent = document.getElementById('auth-content');
    if (oldAuthContent) oldAuthContent.remove();

    const oldDivDerecho = document.querySelector('.divDerecho');
    if (oldDivDerecho) oldDivDerecho.remove();

    // Crear contenedor principal
    let authContent = document.createElement('div');
    authContent.id = 'auth-content';
    authContent.className = 'login-page';
    document.body.appendChild(authContent);


    
    const main = document.createElement('main');
    authContent.appendChild(main);

    const form = RegisterForm();
    main.appendChild(form);

    // Crear aside derecho
    const divDerecho = document.createElement('aside');
    divDerecho.className = "divDerecho";

    const h2 = document.createElement('h2');
    h2.textContent = "¡Nos encanta ver caras nuevas!";
    const p = document.createElement('p');
    p.textContent = "En nuestra corporación nos esmeramos en satisfacer las necesidades de nuestros usuarios. Estamos entusiasmados por tu nueva llegada 🚀🔥";

    const imagenDivDerecho = document.createElement('img');
    imagenDivDerecho.className = "background-img";
    imagenDivDerecho.src = "./src/public/img/perro.png";

    divDerecho.append(imagenDivDerecho, h2, p);
    document.body.appendChild(divDerecho);

    // Manejador del formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        let valido = true;

        if (password !== confirmPassword) {
            showToast('Las contraseñas no coinciden', 'error');
            valido = false;
        }

        if (!isValidUsername(username)) {
            showToast('El nombre debe tener al menos 3 caracteres', 'error');
            valido = false;
        }

        if (!isValidEmail(email)) {
            showToast('Introduce un email válido.', 'error');
            valido = false;
        }

        // if (!isValidPassword(password)) {
        //     showToast('La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.', 'error');
        //     valido = false;
        // }

        if (!valido) return;

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
                body: JSON.stringify(userData),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            

            if (result.status === "success") {
                localStorage.setItem('usuarioId', result.usuarioId);

                showToast("Registro exitoso. Puedes iniciar sesión.", "success");
                setTimeout(() => page('/login'), 2000);
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            console.error(error);
            showToast("Hubo un problema al registrar el usuario.", "error");
        }
    });
}
