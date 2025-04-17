// LoginPage.js
import page from 'page';
import { LoginForm } from '../components/form.js';
import { getToken } from '../public/js/auth.js';
import { isValidEmail, isValidPassword } from '../public/js/validator/regex.js';
import { showToast } from '../public/js/validator/regex.js'; // nueva función toast
import { cleanupView } from '../public/js/cleanup.js';

export async function LoginPage() {
    cleanupView();

    if (getToken()) {
        page('/dashboard');
        return;
    }

        // Eliminar el contenedor anterior si existe
    const oldAuthContent = document.getElementById('auth-content');
    if (oldAuthContent) {
        oldAuthContent.remove();
    }

    // Eliminar aside derecho si existe
    const oldDivDerecho = document.querySelector('.divDerecho');
    if (oldDivDerecho) {
        oldDivDerecho.remove();
    }








    // Crear nuevo contenedor de login
    const authContent = document.createElement('div');
    authContent.id = 'auth-content';
    authContent.className = 'login-page';
    document.body.appendChild(authContent);

    const main = document.createElement('main');
    authContent.appendChild(main);
    const form = LoginForm();
    main.appendChild(form);

    // Crear aside derecho
    const divDerecho = document.createElement('aside');
    divDerecho.className = "divDerecho";

    const h2 = document.createElement('h2');
    h2.textContent = "¡Nos alegramos de verte!";
    const p = document.createElement('p');
    p.textContent = "Estamos deseando ponerte al día con nuestras novedades.";
    const imagen = document.createElement('img');
    imagen.className = "background-img";
    imagen.src = "./src/public/img/buho.png";

    divDerecho.append(imagen, h2, p);
    document.body.appendChild(divDerecho);

    // Evento de login
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const remember = form.querySelector('#rememberMe').checked;
        const email = form.querySelector('#email').value.trim();
        const password = form.querySelector('#password').value;

        let valido = true;

        if (!isValidEmail(email)) {
            showToast("Introduce un email válido.", 'error');
            valido = false;
        }

        if (!valido) return;

        try {
            const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/auth/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (result.status === "success" && result.token) {
                if (result.usuario_id) {
                    localStorage.setItem('usuario_id', result.usuario_id);
                }
                if (remember) {
                    localStorage.setItem("token", result.token);
                } else {
                    sessionStorage.setItem("token", result.token);
                }

                // Limpiar el contenido antes de redirigir
                authContent.remove();
                divDerecho.remove();

                page("/dashboard");
            } else {
                showToast(result.message || "Error al iniciar sesión");
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            showToast('Hubo un error al intentar iniciar sesión');
        }
    });
}


/**
 * Este loginUser permite la comprobación mediante una respuesta POST 
 * que dentro del login.php dirige toda la lógica de la base de datos y luego
 * el resultado en json lo devuelve para después crear un token de este
 * 
 * @param {*} email 
 * @param {*} password 
 */
export async function loginUser(email, password) {
    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.status === "success") {
            localStorage.setItem("token", result.token);
            alert("Inicio de sesión exitoso");
            window.location.replace("/dashboard");
            //window.location.href = "/dashboard"; Es mejor opción la de arriba (al parecer evita que el usuario pueda ir con el botón atrás)
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Hubo un problema con la conexión.");
    }
}
export async function checkToken() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.log("No hay token, redirigiendo al login...");
        window.location.href = "/login";
        return;
    }

    try {
        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/auth/checkToken.php', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (result.status !== "success") {
            console.log("Token inválido, redirigiendo al login...");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    } catch (error) {
        console.error("Error al verificar token:", error);
        window.location.href = "/login";
    }
}

// Función para cerrar sesión
export function logoutUser() {
    localStorage.removeItem("token");
    window.location.href = "/login";
}