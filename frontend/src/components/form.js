// Componente Formulario de Login
export function LoginForm() {
    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';

    const h1 = document.createElement('h1');
    h1.textContent = "¡Hola!";
    formContainer.appendChild(h1);

    const h3 = document.createElement('h3');
    h3.textContent = "Inicia sesión para acceder a tu cuenta.";
    formContainer.appendChild(h3);

    const form = document.createElement('form');
    form.id = 'loginForm';

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'email';
    emailInput.placeholder = 'Email';
    emailInput.required = true;

    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'password-container'; 

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = 'Contraseña';
    passwordInput.required = true;

    const togglePassword = document.createElement('i');
    togglePassword.className = 'fa-solid fa-eye toggle-password'; 
    
    // EVENTO
    // Evento para mostrar/ocultar contraseña
    togglePassword.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
    
        togglePassword.className = isPassword 
            ? 'fa-solid fa-eye-slash toggle-password'
            : 'fa-solid fa-eye toggle-password'; 
    });

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'INICIAR SESIÓN';

    form.appendChild(togglePassword);
    form.appendChild(emailInput);
    passwordContainer.appendChild(passwordInput);
    passwordContainer.appendChild(togglePassword);
    form.appendChild(passwordContainer);

    const h5 = document.createElement('h5');
    h5.textContent = "¿No tienes cuenta?";
    const a = document.createElement('a');
    a.href = "/registro";

    a.textContent = " Regístrate aquí";
    a.className = "aMain";
    h5.appendChild(a);

    formContainer.appendChild(form);
    formContainer.appendChild(h5);
    form.appendChild(submitButton);


    return formContainer;
}


// Componente Formulario de Registro
export function RegisterForm() {


    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';

    const h1 = document.createElement('h1');
    h1.textContent = "¡Hola!";
    formContainer.appendChild(h1);

    const h3 = document.createElement('h3');
    h3.textContent = "Inicia sesión para acceder a tu cuenta.";
    formContainer.appendChild(h3);

    const togglePassword = document.createElement('i');
    togglePassword.className = 'fa-solid fa-eye toggle-password'; 
    
    // EVENTO
    // Evento para mostrar/ocultar contraseña
    togglePassword.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
    
        togglePassword.className = isPassword 
            ? 'fa-solid fa-eye-slash toggle-password'
            : 'fa-solid fa-eye toggle-password'; 
    });

    const toggleConfirmPassword = document.createElement('i');
    toggleConfirmPassword.className = 'fa-solid fa-eye toggle-confirmPassword'; 
    
    // EVENTO
    // Evento para mostrar/ocultar contraseña
    toggleConfirmPassword.addEventListener('click', () => {
        const isPassword = confirmPasswordInput.type === 'password';
        confirmPasswordInput.type = isPassword ? 'text' : 'password';
    
        toggleConfirmPassword.className = isPassword 
            ? 'fa-solid fa-eye-slash toggle-password'
            : 'fa-solid fa-eye toggle-password'; 
    });


    const form = document.createElement('form');
    form.className = 'form-container';

    // Input para el nombre de usuario
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.placeholder = 'Nombre de usuario';
    usernameInput.required = true;

    // Input para el email
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'email';
    emailInput.placeholder = 'Email';
    emailInput.required = true;

    // Input para la contraseña
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = 'Contraseña';
    passwordInput.required = true;

    // Input para confirmar la contraseña
    const confirmPasswordInput = document.createElement('input');
    confirmPasswordInput.type = 'password';
    confirmPasswordInput.id = 'confirmPassword';
    confirmPasswordInput.placeholder = 'Confirmar contraseña';
    confirmPasswordInput.required = true;

    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'password-container'; 

    const confirmPasswordContainer = document.createElement('div');
    confirmPasswordContainer.className = 'confirmPassword-container'; 

    // Botón de envío
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'CREAR CUENTA';

    // Añadir los inputs al formulario
    form.appendChild(usernameInput);
    form.appendChild(emailInput);
    passwordContainer.appendChild(passwordInput);
    passwordContainer.appendChild(togglePassword);
    confirmPasswordContainer.appendChild(confirmPasswordInput);
    confirmPasswordContainer.appendChild(toggleConfirmPassword);
    form.appendChild(passwordContainer);
    form.appendChild(confirmPasswordContainer);


    const h5 = document.createElement('h5');
    h5.textContent = "¿Ya tienes una cuenta?";
    const a = document.createElement('a');
    a.href = "/login";

    a.textContent = " Inicia sesión aquí";
    a.className = "aMain";
    h5.appendChild(a);

    formContainer.appendChild(form);
    formContainer.appendChild(h5);

    form.appendChild(submitButton);

    return formContainer;
}

