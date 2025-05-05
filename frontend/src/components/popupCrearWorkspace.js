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

    // Crear el contenedor para los tableros y su selector
    const contenedorTableros = document.createElement('div');
    contenedorTableros.id = 'tableros-container';
    contenedorTableros.style.display = 'none'; // Se ocultará hasta que se ingrese un correo

    // Crear un botón para mostrar los tableros
    const botonMostrarTableros = document.createElement('button');
    botonMostrarTableros.textContent = 'Seleccionar Tableros';

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


    // Agregar la ventana de tableros al DOM


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
    // Acción principal
    async function handleCreateWorkspace() {
        const nombre = inputTitulo.value.trim();
        const descripcion = inputDescripcion.value.trim();

        console.log(nombre);
        console.log(descripcion);

        if (!nombre) {
            alert('El título es obligatorio');
            return;
        }

        createWorkspaces(nombre, descripcion, modal);
    }

    // Al hacer clic en el botón
    btnCrear.addEventListener('click', handleCreateWorkspace);

    // Al presionar Enter en el input de título o descripción
    [inputTitulo, inputDescripcion].forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Evita comportamiento por defecto como enviar un formulario
                handleCreateWorkspace();
            }
        });
    });


    // Método para mostrar
    modal.show = () => {
        modal.style.display = 'flex';
    };

    return modal;
}
