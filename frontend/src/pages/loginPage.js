// LoginPage.js
import page from 'page';
import { LoginForm } from '../components/form.js';
import { getToken } from '../public/js/auth.js';
import { isValidEmail, isValidPassword } from '../public/js/validator/regex.js';
import { showToast } from '../public/js/validator/regex.js'; // nueva función toast

export async function LoginPage() {
    // Si ya está autenticado, redirigir al dashboard
    if (getToken()) {
        page('/dashboard');
        return;
    }

    const contentDiv = document.getElementById('content');
    const oldDivDerecho = document.querySelector('.divDerecho');
    if (oldDivDerecho) oldDivDerecho.remove();

    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }

    const main = document.createElement('main');
    contentDiv.appendChild(main);
    const form = LoginForm();
    main.appendChild(form);

    // Aside derecho
    const divDerecho = document.createElement('aside');
    divDerecho.className = "divDerecho";

    const h2 = document.createElement('h2');
    h2.textContent = "¡Nos alegramos de verte!";
    const p = document.createElement('p');
    p.textContent = "Estamos deseando ponerte al día con nuestras novedades.";
    const imagen = document.createElement('img');
    imagen.className = "background-img";
    imagen.src = "http://localhost/UniteWork/unitework-dev/assets/img/buho.png";

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

        /*if (!isValidPassword(password)) {
            showToast("La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.", 'error');
            valido = false;
        }*/

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
                if (remember) {
                    localStorage.setItem("token", result.token);
                } else {
                    sessionStorage.setItem("token", result.token);
                }
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