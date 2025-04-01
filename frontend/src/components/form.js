// Componente Formulario de Login
export function LoginForm() {
    const form = document.createElement('form');
    form.id = 'loginForm';

    // Campo de email
    const emailInput = document.createElement('input');
    emailInput.type = 'email';  // Usamos 'email' como tipo
    emailInput.id = 'email';
    emailInput.placeholder = 'Email';
    emailInput.required = true;

    // Campo de contraseña
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = 'Contraseña';
    passwordInput.required = true;

    // Botón de envío
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Iniciar sesión';

    // Añadir los elementos al formulario
    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(submitButton);

    return form;
}

// Componente Formulario de Registro
export function RegisterForm() {
    const form = document.createElement('form');
    form.id = 'registerForm';

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

    // Botón de envío
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Registrar';

    // Añadir los inputs al formulario
    form.appendChild(usernameInput);
    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(confirmPasswordInput);
    form.appendChild(submitButton);

    return form;
}

