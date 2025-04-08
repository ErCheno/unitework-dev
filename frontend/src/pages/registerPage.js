import page from 'page';
import { RegisterForm } from '../components/form.js';
import { isValidUsername, isValidEmail, isValidPassword } from '../public/js/validator/regex.js';
import { showToast } from '../public/js/validator/regex.js'; // <-- Asegúrate de tener este archivo

export function RegisterPage() {
    const contentDiv = document.getElementById('content');

    const oldDivDerecho = document.querySelector('.divDerecho');
    if (oldDivDerecho) {
        oldDivDerecho.remove();
    }

    const divDerecho = document.createElement('aside');
    divDerecho.className = "divDerecho";

    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }

    const main = document.createElement('main');
    contentDiv.appendChild(main);
    const form = RegisterForm();
    main.appendChild(form);

    const h2 = document.createElement('h2');
    h2.textContent = "¡Nos encanta ver caras nuevas!";
    const p = document.createElement('p');
    p.textContent = "En nuestra corporación nos esmeramos en satisfacer las necesidades de nuestros usuarios. Estamos entuasmados por tu nueva llegada 🚀🔥";

    const imagenDivDerecho = document.createElement('img');
    imagenDivDerecho.className = "background-img";
    imagenDivDerecho.src = "http://localhost/UniteWork/unitework-dev/assets/img/perro.png";
    divDerecho.appendChild(imagenDivDerecho);
    divDerecho.appendChild(h2);
    divDerecho.appendChild(p);

    document.body.appendChild(divDerecho);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
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

        if (!isValidPassword(password)) {
            showToast('La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.', 'error');
            valido = false;
        }

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
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (result.status === "success") {
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
