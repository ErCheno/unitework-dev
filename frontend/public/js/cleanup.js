// cleanup.js
export function cleanupView() {
    const content = document.getElementById('content');
    if (content) content.remove();

    const auth = document.getElementById('auth-content');
    if (auth) auth.remove();

    const aside = document.querySelector('.divDerecho');
    if (aside) aside.remove();
}
