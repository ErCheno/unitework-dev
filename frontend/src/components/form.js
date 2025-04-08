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

    // EMAIL
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'email';
    emailInput.placeholder = 'Email';
    emailInput.required = true;
    form.appendChild(emailInput);

    // PASSWORD
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'password-container'; 

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = 'Contraseña';
    passwordInput.required = true;

    const togglePassword = document.createElement('i');
    togglePassword.className = 'fa-solid fa-eye toggle-password'; 

    togglePassword.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePassword.className = isPassword 
            ? 'fa-solid fa-eye-slash toggle-password'
            : 'fa-solid fa-eye toggle-password'; 
    });

    passwordContainer.appendChild(passwordInput);
    passwordContainer.appendChild(togglePassword);
    form.appendChild(passwordContainer);

    // CHECKBOX
    const rememberContainer = document.createElement('div');
    rememberContainer.className = 'remember-container';
    
    const rememberInput = document.createElement('input');
    rememberInput.type = 'checkbox';
    rememberInput.id = 'rememberMe';
    
    const rememberLabel = document.createElement('label');
    rememberLabel.htmlFor = 'rememberMe';
    rememberLabel.textContent = 'Mantener sesión iniciada';
    
    rememberContainer.appendChild(rememberInput);
    rememberContainer.appendChild(rememberLabel);
    form.appendChild(rememberContainer);

    // SUBMIT
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'INICIAR SESIÓN';
    form.appendChild(submitButton);

    // LINK
    const h5 = document.createElement('h5');
    h5.textContent = "¿No tienes cuenta?";
    const a = document.createElement('a');
    a.href = "/registro";
    a.textContent = " Regístrate aquí";
    a.className = "aMain";
    h5.appendChild(a);

    formContainer.appendChild(form);
    formContainer.appendChild(h5);

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
    h3.textContent = "Crea una cuenta para empezar a colaborar.";
    formContainer.appendChild(h3);

    const form = document.createElement('form');
    form.id = 'registerForm';

    // USERNAME
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.placeholder = 'Nombre de usuario';
    usernameInput.required = true;
    form.appendChild(usernameInput);

    // EMAIL
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'email';
    emailInput.placeholder = 'Email';
    emailInput.required = true;
    form.appendChild(emailInput);

    // PASSWORD
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'password-container';

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = 'Contraseña';
    passwordInput.required = true;

    const togglePassword = document.createElement('i');
    togglePassword.className = 'fa-solid fa-eye toggle-password';

    togglePassword.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        togglePassword.className = isPassword
            ? 'fa-solid fa-eye-slash toggle-password'
            : 'fa-solid fa-eye toggle-password';
    });

    passwordContainer.appendChild(passwordInput);
    passwordContainer.appendChild(togglePassword);
    form.appendChild(passwordContainer);

    // CONFIRM PASSWORD
    const confirmContainer = document.createElement('div');
    confirmContainer.className = 'confirmPassword-container';

    const confirmPasswordInput = document.createElement('input');
    confirmPasswordInput.type = 'password';
    confirmPasswordInput.id = 'confirmPassword';
    confirmPasswordInput.placeholder = 'Confirmar contraseña';
    confirmPasswordInput.required = true;

    const toggleConfirmPassword = document.createElement('i');
    toggleConfirmPassword.className = 'fa-solid fa-eye toggle-confirmPassword';

    toggleConfirmPassword.addEventListener('click', () => {
        const isPassword = confirmPasswordInput.type === 'password';
        confirmPasswordInput.type = isPassword ? 'text' : 'password';
        toggleConfirmPassword.className = isPassword
            ? 'fa-solid fa-eye-slash toggle-password'
            : 'fa-solid fa-eye toggle-password';
    });

    confirmContainer.appendChild(confirmPasswordInput);
    confirmContainer.appendChild(toggleConfirmPassword);
    form.appendChild(confirmContainer);

    // SUBMIT
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'CREAR CUENTA';
    form.appendChild(submitButton);

    // LINK
    const h5 = document.createElement('h5');
    h5.textContent = "¿Ya tienes una cuenta?";
    const a = document.createElement('a');
    a.href = "/login";
    a.className = "aMain";
    a.textContent = " Inicia sesión aquí";
    h5.appendChild(a);

    formContainer.appendChild(form);
    formContainer.appendChild(h5);

    return formContainer;
}




