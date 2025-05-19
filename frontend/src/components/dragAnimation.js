import Sortable from 'sortablejs';

export function setupSortable(containerId, handleClass, onEndCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    Sortable.create(container, {
        animation: 200,
        handle: handleClass, // Arrastrar solo desde un área
        ghostClass: 'sortable-ghost',
        onEnd: onEndCallback,
    });
}

// setupSortableKanban → mover tareas dentro y entre columnas
export function setupSortableKanban(containerSelector, listSelector, onEndCallback) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const lists = container.querySelectorAll(listSelector);
    lists.forEach(list => {
        Sortable.create(list, {
            group: 'kanban-tasks', // grupo exclusivo para tareas
            animation: 150,
            ghostClass: 'opacity-50',
            draggable: '.task-draggable',
            filter: '.no-drag',
            preventOnFilter: false,
            onMove: evt => !evt.related.classList.contains('no-drag'),
            onEnd: onEndCallback
        });
    });
}




// setupSortableList → mover columnas solamente
export function setupSortableList(containerSelector, onEndCallback) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    Sortable.create(container, {
        group: 'kanban-columns',  // grupo exclusivo para columnas
        animation: 200,
        ghostClass: 'opacity-50',
        draggable: '.kanban-column', // mueve columnas
        handle: '.kanban-column', // o cualquier parte fija si usas handle
        onEnd: onEndCallback,
    });
}

export function scrollHorizontal(container) {
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('active');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5; // la multiplicación ajusta la velocidad
        container.scrollLeft = scrollLeft - walk;
    });
}

