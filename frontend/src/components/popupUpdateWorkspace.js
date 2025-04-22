import { showToast } from "../../public/js/validator/regex.js";
import { updateWorkspace } from "../../public/js/workspaces.js";



export function mostrarDetallesWorkspace(ws) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    const popup = document.createElement('div');
    popup.className = 'popup detalles-popup';

    const titulo = document.createElement('h2');
    titulo.textContent = 'Detalles del espacio';

    // Utilidad para crear una línea de detalle
    const crearLineaDetalle = (label, value) => {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = label + ': ';
        const span = document.createElement('span');
        span.textContent = value;

        p.appendChild(strong);
        p.appendChild(span);
        return p;
    };

    const nombre = crearLineaDetalle('Nombre', ws.nombre);
    const descripcion = crearLineaDetalle('Descripción', ws.descripcion || 'Sin descripción');
    const actividad = crearLineaDetalle('Última actividad', ws.ultima_actividad_relativa);
    const tableros = crearLineaDetalle('Tableros activos', ws.numero_tableros);
    const mapas = crearLineaDetalle('Mapas mentales activos', ws.numero_mapas_mentales);
    const miembros = crearLineaDetalle('Miembros', ws.numero_miembros);
    const rol = crearLineaDetalle('Tu rol', ws.rol === 'admin' ? 'Administrador' : 'Miembro');

    const btnCerrar = document.createElement('button');
    btnCerrar.textContent = 'Cerrar';
    btnCerrar.className = 'btn-cerrar';

    btnCerrar.addEventListener('click', () => {
        document.getElementById('content').removeChild(overlay);
    });

    popup.appendChild(titulo);
    popup.appendChild(nombre);
    popup.appendChild(descripcion);
    popup.appendChild(actividad);
    popup.appendChild(tableros);
    popup.appendChild(mapas);
    popup.appendChild(miembros);
    popup.appendChild(rol);
    popup.appendChild(btnCerrar);

    // Solo para admin: botón "Editar"
    if (ws.rol === 'admin') {
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.className = 'btn-editar';

        btnEditar.addEventListener('click', () => {
            overlay.remove();
            mostrarFormularioEdicion(ws);
        });
        

        popup.appendChild(btnEditar);
    }


    overlay.appendChild(popup);
    document.getElementById('content').appendChild(overlay);
}
export function mostrarFormularioEdicion(ws) {
    console.log(ws);

    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    const popup = document.createElement('div');
    popup.className = 'popup detalles-popup';

    const titulo = document.createElement('h2');
    titulo.textContent = 'Editar espacio de trabajo';

    const form = document.createElement('form');

    // Función para crear campos editables con etiqueta
    const crearCampoEditable = (labelText, inputElement) => {
        const contenedor = document.createElement('div');
        const label = document.createElement('label');
        label.textContent = labelText;
        contenedor.appendChild(label);
        contenedor.appendChild(inputElement);
        return contenedor;
    };

    // Input nombre
    const inputNombre = document.createElement('input');
    inputNombre.type = 'text';
    inputNombre.value = ws.nombre;
    inputNombre.required = true;

    // Textarea descripción
    const inputDescripcion = document.createElement('textarea');
    inputDescripcion.value = ws.descripcion || '';

    // Botones
    const btnGuardar = document.createElement('button');
    btnGuardar.type = 'submit';
    btnGuardar.className = 'btn-confirmar';
    btnGuardar.textContent = 'Guardar cambios';

    const btnCancelar = document.createElement('button');
    btnCancelar.type = 'button';
    btnCancelar.className = 'btn-cancelar';
    btnCancelar.textContent = 'Cancelar';

    btnCancelar.addEventListener('click', () => {
        overlay.remove();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const nombreActualizado = inputNombre.value.trim();
        const descripcionActualizada = inputDescripcion.value.trim();
    
        if (!nombreActualizado) {
            showToast('El nombre no puede estar vacío', 'error');
            return;
        }
    
        updateWorkspace(ws.id, ws.creado_por, nombreActualizado, descripcionActualizada);
    });
    

    form.appendChild(crearCampoEditable('Nombre', inputNombre));
    form.appendChild(crearCampoEditable('Descripción', inputDescripcion));
    form.appendChild(btnCancelar);
    form.appendChild(btnGuardar);

    popup.appendChild(titulo);
    popup.appendChild(form);
    overlay.appendChild(popup);
    document.getElementById('content').appendChild(overlay);
}