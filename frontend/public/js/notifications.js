// Función para obtener las notificaciones
export async function actualizarNotificaciones() {
    try {
      const response = await fetch('http://localhost/UniteWork/unitework-dev/backend/src/controller/notificaciones/getNotificaciones.php');
      const notificaciones = await response.json();
      const notifBadge = document.querySelector('.notif-badge');
      const notifList = document.querySelector('.notif-list');
  
      if (notificaciones.length > 0) {
        notifBadge.classList.remove('hidden');
        notifBadge.textContent = notificaciones.length;
        notifList.textContent = '';  // Limpiar las notificaciones previas
  
        notificaciones.forEach(notif => {
          const notifItem = crearNotificacion(notif.texto, notif.negrita, notif.cursiva, notif.icono);
          notifList.appendChild(notifItem);
        });
      } else {
        notifBadge.classList.add('hidden');
      }
    } catch (error) {
      console.error('Error al cargar las notificaciones:', error);
    }
  }
  
  // Llamar a esta función cuando sea necesario
  //actualizarNotificaciones();
  