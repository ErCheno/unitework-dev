import { showToast } from '../public/js/validator/regex.js';
import { WorkspaceCard } from './workspaceCard.js';

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
    labelMiembro.textContent = 'Añadir miembro (email)';

    const inputMiembro = document.createElement('input');
    inputMiembro.id = 'miembro';
    inputMiembro.type = 'email';
    inputMiembro.placeholder = 'ejemplo@correo.com';

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
        const usuarioId = localStorage.getItem('usuario_id');  // Asegúrate de tener el ID del usuario

        console.log(nombre);
        console.log(descripcion);
        console.log(usuarioId);

        if (!nombre) {
            alert('El título es obligatorio');
            return;
        }

        try {
            console.log("Enviando datos:", {
                nombre,
                descripcion,
                creado_por: usuarioId // o como se llame tu variable
              });

            const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/workspace/espaciosTrabajo.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    creado_por: usuarioId,
                    nombre,
                    descripcion,
                }),
            });


              

            const result = await response.json();

            if (result.success || result.status === "success") {
                showToast("Espacio creado con éxito", "success");
                modal.style.display = 'none';
    
                const newCard = WorkspaceCard({
                    nombre: 'Nuevo Espacio de Trabajo',
                    descripcion: 'Descripción del workspace',
                    numero_tableros: 0,
                    numero_mapas_mentales: 0,
                    numero_miembros: 1,
                    fecha_creacion: 'recién creado',
                    creado_por: usuarioId
                });

                

                
                
    
                const container = document.getElementById("workspace-container");
                if (container) {
                    container.appendChild(newCard);
                }
            } else {
                showToast(result.message || "Error al crear espacio", "error");
                console.log(result.message);
            }

        } catch (err) {
            console.error(err);
            alert('Error en la petición');
        }


     
        

    });

    // Método para mostrar
    modal.show = () => {
        modal.style.display = 'flex';
    };

    return modal;
}
