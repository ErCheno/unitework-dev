/*onEnd: async function (evt) {
    const taskId = evt.item.dataset.id;
    const newStatus = evt.to.dataset.status;

    try {
        const response = await fetch(`/api/tareas/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error('Error al actualizar tarea');
    } catch (err) {
        console.error(err);
        showToast('Error al mover tarea', 'error');
    }
}
*/