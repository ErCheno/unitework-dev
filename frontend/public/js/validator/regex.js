// TODOS LOS REGEX SON SACADOS DE DIFERENTES APARTADOS



export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function isValidPassword(password) {

    // Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
}

export function isValidUsername(username) {
    return username.trim().length >= 3; // Asegura que tenga al menos 3 caracteres

}

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
  
    document.body.appendChild(toast);
  
    // Forzar reflow para que se active la animación
    getComputedStyle(toast).top;
  
    toast.classList.add('show');
  
    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
  }
  

