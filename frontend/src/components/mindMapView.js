import MindElixir from 'mind-elixir';

// mindMapView.js
export function initMindMap(containerElement, data) {
  if (!(containerElement instanceof HTMLElement)) {
    throw new Error('initMindMap: containerElement no es un elemento válido');
  }

  const mind = new MindElixir({
    el: containerElement, // ¡debe ser un elemento real!
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
  return mind;
}