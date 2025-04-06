// LoginPage.js
import { isAuthenticated } from '../public/js/auth.js';

import page from 'page';
import { LoginForm } from '../components/form.js';
import { Navbar } from '../components/navbar.js';
import { setToken } from '../public/js/auth.js';


export function LoginPage() {

    if (isAuthenticated()) {
        return page('/dashboard');
    }


    const contentDiv = document.getElementById('content');
    const oldDivDerecho = document.querySelector('.divDerecho');
    if (oldDivDerecho) {
        oldDivDerecho.remove();
    }
    
    // Crear el aside con el texto y la imagen
    const divDerecho = document.createElement('aside');
    divDerecho.className = "divDerecho";

    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }

    //const navbar = Navbar();
    //contentDiv.appendChild(navbar);

    const main = document.createElement('main');
    contentDiv.appendChild(main);
    const form = LoginForm();
    main.appendChild(form);

    // Crear el aside con el texto y la imagen
    divDerecho.className = "divDerecho";
    const h2 = document.createElement('h2');
    h2.textContent = "¡Nos alegramos de verte!";
    const p = document.createElement('p');
    p.textContent = "Estamos deseando ponerte al día con nuestras novedades.";
    const imagenDivDerecho = document.createElement('img');
    imagenDivDerecho.className = "background-img";
    imagenDivDerecho.src = "http://localhost/UniteWork/unitework-dev/assets/img/buho.png";
    divDerecho.appendChild(imagenDivDerecho);  // Se añade dentro del aside
    divDerecho.appendChild(h2);
    divDerecho.appendChild(p);

    // Colocar el aside fuera de 'main' (fuera de contentDiv también)
    document.body.appendChild(divDerecho);  // Se añade fuera del main pero dentro del body



    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;

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

            if (result.status === 'success' && result.token) {
                setToken(result.token);
                localStorage.setItem("username", result.user.nombre);
                page('/dashboard');
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('Hubo un error al intentar iniciar sesión');
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