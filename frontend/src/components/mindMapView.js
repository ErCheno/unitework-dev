import MindElixir from 'mind-elixir';

export function initMindMap(containerElement, data) {
  if (!(containerElement instanceof HTMLElement)) {
    throw new Error('initMindMap: containerElement no es un elemento válido');
  }

  const mind = new MindElixir({
    el: containerElement,
    direction: MindElixir.SIDE,
    draggable: true,
    editable: true,
    contextMenu: true,
    toolBar: true,
    nodeMenu: true,
    keypress: true,
    locale: 'es',
  });

  mind.init(data);

  // Función para asignar data-padreid en los nodos DOM
  function setDataPadreIdAttributes() {
    const mapIdToPadreId = new Map();

    function recorrerNodos(nodos) {
      nodos.forEach(nodo => {
        if (nodo.data?.db_id) {
          mapIdToPadreId.set(nodo.id, nodo.data.padre_id || null);
        }
        if (nodo.children && nodo.children.length) {
          recorrerNodos(nodo.children);
        }
      });
    }

    recorrerNodos([mind.nodeData]);

    const elementos = containerElement.querySelectorAll('me-tpc');
    elementos.forEach(el => {
      const nodeid = el.getAttribute('data-nodeid'); // ej. "me144"
      if (!nodeid) return;
      const id = nodeid.slice(2); // "144"
      const padreId = mapIdToPadreId.get(id) || null;
      if (padreId !== null && padreId !== undefined) {
        el.setAttribute('data-padreid', padreId.toString());
      } else {
        el.removeAttribute('data-padreid');
      }
    });
  }

  // Sobrescribimos refresh para ejecutar setDataPadreIdAttributes después de cada refresh
  const originalRefresh = mind.refresh.bind(mind);
  mind.refresh = () => {
    originalRefresh();
    setDataPadreIdAttributes();
  };

  // Llamada inicial para poner los atributos al cargar
  setDataPadreIdAttributes();

  return mind;
}
