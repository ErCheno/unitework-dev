import page from 'page';
import { showToast } from "./validator/regex.js";
import { myWorkspacesPage } from "../../src/pages/myworkspacesPage.js";

export async function fetchBoards(workspaceId, usuarioId) {
    try {
        const res = await fetch(`http://localhost/UniteWork/unitework-dev/backend/src/controller/boardKanban/getBoard.php?espacio_trabajo_id=${workspaceId}&creado_por=${usuarioId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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


export async function createBoards(nombre, descripcion, creado_por, espacio_trabajo_id) {
    try {
        const res = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/boardKanban/createBoard.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre,
                descripcion,
                creado_por,
                espacio_trabajo_id
            }),
        });

        const data = await res.json();

        if (data.success) {
            showToast("Tablero creado correctamente", "success");
            // Refresca la página o recarga los tableros
            //page.redirect(`/workspace/${espacio_trabajo_id}`);
        } else {
            showToast("Error: " + data.message, "error");
        }
    } catch (err) {
        showToast("Error de red: " + err.message, "error");
    }
}