// registerPage.js
import page from 'page';
import { RegisterForm } from '../components/form.js';
import { Navbar } from '../components/navbar.js';
//import { isAuthenticated } from '../public/js/auth.js';



// Manejo de envío de formulario
export function RegisterPage() {
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
    // Crear Navbar
    //const navbar = Navbar();
    //contentDiv.appendChild(navbar);

    const main = document.createElement('main');
    contentDiv.appendChild(main);
    const form = RegisterForm();
    main.appendChild(form);

    // Crear el aside con el texto y la imagen
    divDerecho.className = "divDerecho";
    const h2 = document.createElement('h2');
    h2.textContent = "¡Nos encanta ver caras nuevas!";
    const p = document.createElement('p');
    p.textContent = "En nuestra corporación nos esmeramos en satisfacer las necesidades de nuestros usuarios. Estamos entuasmados por tu nueva llegada 🚀🔥";
    
    const imagenDivDerecho = document.createElement('img');
    imagenDivDerecho.className = "background-img";
    imagenDivDerecho.src = "http://localhost/UniteWork/unitework-dev/assets/img/perro.png";
    divDerecho.appendChild(imagenDivDerecho);  // Se añade dentro del aside
    divDerecho.appendChild(h2);
    divDerecho.appendChild(p);

    // Colocar el aside fuera de 'main' (fuera de contentDiv también)
    document.body.appendChild(divDerecho);  // Se añade fuera del main pero dentro del body


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
