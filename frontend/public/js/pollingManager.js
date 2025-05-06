import { cargarInvitaciones } from "../../src/components/topbar";
import { WorkspaceCard } from "../../src/components/workspaceCard";
import { renderWorkspaces } from "../../src/pages/myworkspacesPage";
import { fetchWorkspaces } from "./workspaces";

let pollingInterval = null; // Definir la variable global para el intervalo de polling

// Función para iniciar el polling (llamadas periódicas)
export function startPolling(callback, interval = 2000) {
    // Evitar que se inicie un polling si ya está activo
    if (pollingInterval) {
        console.log("Polling ya está en curso.");
        return;
    }

    pollingInterval = setInterval(async () => {
        try {
            await callback(); // Llama la función de actualización periódica
        } catch (error) {
            console.error('Error durante polling:', error);
        }
    }, interval); // Ejecuta cada 'interval' milisegundos (por defecto cada 2 segundos)
    console.log("Polling iniciado.");
}

// Función para detener el polling (cuando ya no se necesita)
export function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log("Polling detenido.");
    } else {
        console.log("No hay polling en curso.");
    }
}


// Iniciar polling para notificaciones
export function startPollingNotificaciones() {
    setInterval(async () => {
      try {
        const badge = document.querySelector('.notif-badge');
        const list = document.querySelector('.notif-list');
        await cargarInvitaciones(list, badge);
      } catch (error) {
        console.error('Error durante el polling de notificaciones:', error);
      }
    }, 5000);
  }
  
/*
  export function startPollingWorkspaces() {
    setInterval(async () => {
      const grid = document.getElementById('workspace-list');
      if (!grid) return;
      await renderWorkspaces(grid);
    }, 15000);
  }*/