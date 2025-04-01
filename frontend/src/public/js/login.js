// auth.js

export async function loginUser(email, password) {
    try {
        const response = await fetch('http://localhost/api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // El login fue exitoso
            console.log('Login exitoso', data);
            return true;  // Indica que el login fue exitoso
        } else {
            // El login falló
            console.error('Error de login:', data.message);
            return false;  // Indica que el login falló
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        return false;  // Indica que hubo un error al conectar
    }
}
