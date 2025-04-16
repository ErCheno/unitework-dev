let isDraggingWorkspace = false;


export function workspaceDrag() {
    const workspaceList = document.getElementById('workspace-list');
    let draggedItem = null;

    workspaceList.addEventListener('dragstart', (e) => {
        if (!e.target.classList.contains('workspace-draggable')) return;

        isDraggingWorkspace = true;

        draggedItem = e.target;
        e.target.classList.add('dragging');
        workspaceList.classList.add('is-dragging');
        e.target.style.transition = 'none';
        setTimeout(() => {
            e.target.style.display = 'none';
        }, 0);
    });

    workspaceList.addEventListener('dragend', () => {
        if (draggedItem) {
            draggedItem.style.display = 'block';
            draggedItem.classList.remove('dragging');
            workspaceList.classList.remove('is-dragging');

            const dropTarget = workspaceList.querySelector('.drop-preview');
            if (dropTarget) {
                workspaceList.insertBefore(draggedItem, dropTarget);
            } else {
                workspaceList.appendChild(draggedItem);
            }

            eliminarDropPreview();
            requestAnimationFrame(() => {
                animateWorkspaceReorder();
            });

            draggedItem = null;
        }
    });

    workspaceList.addEventListener('dragover', (e) => {
        e.preventDefault();
        
        const afterElement = getDragAfterElement(workspaceList, e.clientX);
        eliminarDropPreview();
        if (afterElement) {
            afterElement.classList.add('drop-preview');
        }
    });
}

function getDragAfterElement(container, mouseX) {
    // Selecciona todos los elementos arrastrables que no están ocultos
    const draggableItems = [...container.querySelectorAll('.workspace-draggable:not([style*="display: none"])')];

    let closestElement = null;
    let smallestOffset = Number.NEGATIVE_INFINITY;

    // Recorremos cada tarjeta
    draggableItems.forEach(item => {
        const box = item.getBoundingClientRect(); // Posición y tamaño del item
        const offset = mouseX - (box.left + box.width / 2); 
        // offset < 0 → el cursor está a la izquierda del centro del item

        if (offset < 0 && offset > smallestOffset) {
            // El puntero está a la izquierda del centro del item
            // y es el más cercano a cero (más cerca del cursor)
            smallestOffset = offset;
            closestElement = item;
        }
    });

    return closestElement;
}


function eliminarDropPreview() {
    document.querySelectorAll('.drop-preview').forEach(el => {
        el.classList.remove('drop-preview');
    });
}

function animateWorkspaceReorder() {
    const workspaceList = document.getElementById('workspace-list');
    const cards = Array.from(workspaceList.querySelectorAll('.workspace-draggable'));

    const initialRects = new Map();
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        initialRects.set(card, rect);
    });

    void workspaceList.offsetWidth;

    cards.forEach(card => {
        const initial = initialRects.get(card);
        const final = card.getBoundingClientRect();
        const dx = initial.left - final.left;
        const dy = initial.top - final.top;

        if (dx || dy) {
            card.style.transition = 'none';
            card.style.transform = `translate(${dx}px, ${dy}px)`;

            requestAnimationFrame(() => {
                card.style.transition = 'transform 300ms ease';
                card.style.transform = '';
            });
        }
    });
}

export function setupHorizontalScroll() {
    const workspaceList = document.getElementById('workspace-list');
    let isDown = false;
    let startX;
    let scrollLeft;

    workspaceList.addEventListener('mousedown', (e) => {
        console.log("isDraggingWorkspace al hacer mousedown:", isDraggingWorkspace); // Depuración

        if (isDraggingWorkspace){
            console.log("Evitar scroll mientras se arrastra"); // Confirmar que el flag está activo
            return;
        }

        isDown = true;
        workspaceList.classList.add('active');
        startX = e.pageX - workspaceList.offsetLeft;
        scrollLeft = workspaceList.scrollLeft;
    });

    workspaceList.addEventListener('mouseleave', () => {
        isDown = false;
        workspaceList.classList.remove('active');
    });

    workspaceList.addEventListener('mouseup', () => {
        isDown = false;
        workspaceList.classList.remove('active');
    });

    workspaceList.addEventListener('mousemove', (e) => {
        if (!isDown || isDraggingWorkspace) return;
        e.preventDefault();
        const x = e.pageX - workspaceList.offsetLeft;
        const walk = (x - startX) * 1.5;
        workspaceList.scrollLeft = scrollLeft - walk;
    });
}
