// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Obtener el formulario de registro
    const registerForm = document.getElementById('registerForm');

    // Añadir un listener al evento de submit del formulario
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();  // Prevenir el envío normal del formulario

        // Obtener los valores de los campos del formulario
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Verificar si las contraseñas coinciden
        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        // Crear un objeto con los datos que vamos a enviar al backend
        const userData = {
            name: name,
            email: email,
            password: password
        };

        // Enviar los datos al servidor mediante fetch (AJAX)
        try {
            const response = await fetch('/registro.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)  // Convertimos el objeto a JSON
            });

            // Leer la respuesta en formato JSON
            const result = await response.json();

            // Comprobar si el registro fue exitoso
            if (result.status === "success") {
                alert("Registro exitoso. Puedes iniciar sesión.");
                // Redirigir al login
                window.location.href = '/login';  // Cambia la ruta según corresponda
            } else {
                alert(result.message);  // Mostrar el mensaje de error
            }
        } catch (error) {
            alert("Hubo un problema al registrar el usuario.");
            console.error(error);
        }
    });
});
