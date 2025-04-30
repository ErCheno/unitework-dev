import { showToast } from '../../public/js/validator/regex.js';
import { WorkspaceCard } from './workspaceCard.js';
import { myWorkspacesPage } from '../pages/myworkspacesPage.js';
import { createWorkspaces } from '../../public/js/workspaces.js';

export function CreateWorkspaceModal() {
    // Crear elementos base
    const modal = document.createElement('div');
    modal.id = 'modal-crear';
    modal.className = 'modal';
    modal.style.display = 'none';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const cerrar = document.createElement('i');
    cerrar.className = 'fas fa-times';
    cerrar.id = 'cerrar'

    const tituloHeader = document.createElement('h2');
    tituloHeader.textContent = 'Nuevo espacio de trabajo';

    const labelTitulo = document.createElement('label');
    labelTitulo.setAttribute('for', 'titulo');
    labelTitulo.textContent = 'Título *';

    const inputTitulo = document.createElement('input');
    inputTitulo.id = 'titulo';
    inputTitulo.placeholder = 'Ej. Proyecto Alfa';

    const labelDescripcion = document.createElement('label');
    labelDescripcion.setAttribute('for', 'descripcion');
    labelDescripcion.textContent = 'Descripción (opcional)';

    const inputDescripcion = document.createElement('textarea');
    inputDescripcion.id = 'descripcion';
    inputDescripcion.rows = 3;
    inputDescripcion.placeholder = 'Descripción del espacio...';

    const labelMiembro = document.createElement('label');
    labelMiembro.setAttribute('for', 'miembro');
    labelMiembro.textContent = 'Añadir miembro por email (opcional)';

    const contenedorEmails = document.createElement('div');
    contenedorEmails.id = 'emails-container';

    // Crear el input para los correos
    const inputMiembro = document.createElement('input');
    inputMiembro.id = 'miembro';
    inputMiembro.type = 'email';
    inputMiembro.placeholder = 'ejemplo@correo.com';
    contenedorEmails.appendChild(inputMiembro);

    // Crear el contenedor para los tableros y su selector
    const contenedorTableros = document.createElement('div');
    contenedorTableros.id = 'tableros-container';
    contenedorTableros.style.display = 'none'; // Se ocultará hasta que se ingrese un correo

    // Crear un botón para mostrar los tableros
    const botonMostrarTableros = document.createElement('button');
    botonMostrarTableros.textContent = 'Seleccionar Tableros';
    contenedorEmails.appendChild(botonMostrarTableros);

    content.appendChild(contenedorEmails)

    // Crear la ventana de selección de tableros (ventana emergente)
    const ventanaTableros = document.createElement('div');
    ventanaTableros.id = 'ventana-tableros';
    ventanaTableros.style.position = 'absolute';
    ventanaTableros.style.top = '50px'; // Ajustar según necesidad
    ventanaTableros.style.right = '0';
    ventanaTableros.style.background = 'white';
    ventanaTableros.style.border = '1px solid #ccc';
    ventanaTableros.style.padding = '10px';
    ventanaTableros.style.display = 'none'; // Se mostrará cuando se seleccione el correo

    // Crear checkboxes de tableros (esto sería dinámico, ya que depende de los tableros disponibles)
    const tableros = ['Tablero 1', 'Tablero 2', 'Tablero 3']; // Esta lista debe ser dinámica
    tableros.forEach(tablero => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = tablero;
        checkbox.name = 'tablero';
        checkbox.value = tablero;

        const label = document.createElement('label');
        label.setAttribute('for', tablero);
        label.textContent = tablero;

        ventanaTableros.appendChild(checkbox);
        ventanaTableros.appendChild(label);
        ventanaTableros.appendChild(document.createElement('br'));
    });

    // Agregar la ventana de tableros al DOM
    content.appendChild(ventanaTableros);

    // Funcionalidad para agregar correos
    inputMiembro.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && inputMiembro.value !== '') {
            // Agregar correo a la lista de correos
            const email = inputMiembro.value;
            const listaEmails = document.createElement('span');
            listaEmails.textContent = `${email} `;
            contenedorEmails.appendChild(listaEmails);

            // Limpiar el input
            inputMiembro.value = '';

            // Mostrar la ventana de selección de tableros
            ventanaTableros.style.display = 'block';
        }
    });

    // Mostrar la ventana emergente de tableros cuando se haga click en el botón
    botonMostrarTableros.addEventListener('click', () => {
        ventanaTableros.style.display = 'block';
    });


    const actions = document.createElement('div');
    actions.className = 'modal-actions';

    const btnCancelar = document.createElement('button');
    btnCancelar.className = 'cancelar';
    btnCancelar.textContent = 'Cancelar';

    const btnCrear = document.createElement('button');
    btnCrear.className = 'confirmar';
    btnCrear.textContent = 'Crear';

    // Armar estructura
    actions.appendChild(btnCancelar);
    actions.appendChild(btnCrear);

    content.appendChild(cerrar);
    content.appendChild(tituloHeader);
    content.appendChild(labelTitulo);
    content.appendChild(inputTitulo);
    content.appendChild(labelDescripcion);
    content.appendChild(inputDescripcion);
    content.appendChild(labelMiembro);
    content.appendChild(inputMiembro);
    content.appendChild(actions);

    modal.appendChild(content);

    // Eventos
    cerrar.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    btnCancelar.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    btnCrear.addEventListener('click', async () => {
        const nombre = inputTitulo.value.trim();
        const descripcion = inputDescripcion.value.trim();
        //const usuarioId = localStorage.getItem('usuario_id');

        console.log(nombre);
        console.log(descripcion);

        if (!nombre) {
            alert('El título es obligatorio');
            return;
        }

        createWorkspaces(nombre, descripcion, modal);

    });

    // Método para mostrar
    modal.show = () => {
        modal.style.display = 'flex';
    };

    return modal;
}
