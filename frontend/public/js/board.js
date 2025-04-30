import page from 'page';
import { showToast } from "./validator/regex.js";
import { workspacePage } from '../../src/pages/workspacePage.js';

export async function fetchBoards(workspaceId) {
    try {

        const token = localStorage.getItem('token');

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            return;
        }


        const res = await fetch(`http://localhost/UniteWork/unitework-dev/backend/src/controller/boardKanban/getBoard.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera
            },
            body: JSON.stringify({
                espacio_trabajo_id: workspaceId,
            })
        });

        const data = await res.json();
        console.log('Respuesta del backend:', data);

        if (!data.success) {
            throw new Error(data.message || 'Error desconocido al obtener los tableros');
        }

        return data.tableros || [];

    } catch (err) {
        console.error(err);
        throw new Error('Error al cargar tableros: ' + err.message);
    }
}



export async function createBoards(nombre, descripcion, espacio_trabajo_id) {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            return;
        }

        const res = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/boardKanban/createBoard.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera
            },
            body: JSON.stringify({
                nombre,
                descripcion,
                espacio_trabajo_id
            }),
        });

        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        if (data.success) {
            showToast("Tablero creado correctamente", "success");
            // page.redirect(`/workspace/${espacio_trabajo_id}`);
        } else {
            showToast("Error: " + data.message, "error");
        }
    } catch (err) {
        showToast("Error de red o servidor: " + err.message, "error");
    }
}



export async function deleteBoards(tableroId) {
    try {

        const token = localStorage.getItem('token');

        if (!token) {
            showToast("Token no disponible. Inicia sesión nuevamente.", "error");
            return;
        }

        const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/boardKanban/deleteBoard.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluir el token en la cabecera
            },
            body: JSON.stringify({
                tablero_id: tableroId,
            })
        });

        const data = await response.json();
        console.log('DELETE Respuesta del backend:', data);

        if (data.success) {
            showToast('Espacio eliminado correctamente', "info");

            const boardElement = document.getElementById(`board-${tableroId}`);
            if (boardElement) {
                boardElement.remove();  // Eliminar la tarjeta del tablero del DOM directamente
            }

        }
        
    } catch (error) {
        console.error('Error al eliminar el espacio:', error);
        alert('Error en la petición');
    }
}


export async function uploadAvatar(usuarioId) {
    const formData = new FormData();
    formData.append("usuario_id", usuarioId);
    formData.append("avatar", archivo);
  
    try {
      const response = await fetch("http://localhost/backend/usuarios/subir_avatar.php", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      if (data.success) {
        console.log("Avatar subido con éxito:", data.avatar);
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    }
}

export async function getUsuariosDisponibles(tableroId, filtro = "") {
    try {
        const response = await fetch("http://localhost/UniteWork/unitework-dev/backend/src/controller/selectUsers.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tablero_id: tableroId, filtro })
        });

        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Error desconocido");

        return data.usuarios_disponibles;
    } catch (error) {
        console.error("Error al obtener usuarios disponibles:", error.message);
        return [];
    }
}
