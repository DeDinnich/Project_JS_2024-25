// resources/js/modules/initShelfDrag.js
import { updateStorage } from './renderer';

export default function initShelfDrag() {
  const container = document.getElementById('shelves-container');
  if (!container) return;

  // Ne bind qu'une seule fois
  if (container.dataset.dragInit) {
    return;
  }
  container.dataset.dragInit = 'true';

  let dragged = null;

  // Drag start
  container.addEventListener('dragstart', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!shelf) return;
    dragged = shelf;
    console.log('📦 [DragStart] shelf-id:', dragged.dataset.shelfId);
  });

  // Drag end
  container.addEventListener('dragend', e => {
    if (!dragged) return;
    console.log('📦 [DragEnd] shelf-id:', dragged.dataset.shelfId);
    dragged = null;
  });

  // Drag over
  container.addEventListener('dragover', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!dragged || !shelf || shelf === dragged) return;
    e.preventDefault();
    console.log('📦 [DragOver] shelf-id:', shelf.dataset.shelfId);
  });

  // Drag enter → highlight
  container.addEventListener('dragenter', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!dragged || !shelf || shelf === dragged) return;
    const label = shelf.querySelector('.shelf-label-text');
    if (label) {
      label.classList.add('drop-target');
      console.log('📦 [DropTarget] ajouté pour shelf-id:', shelf.dataset.shelfId);
    }
  });

  // Drag leave → un-highlight
  container.addEventListener('dragleave', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!shelf) return;
    const label = shelf.querySelector('.shelf-label-text');
    if (label) {
      label.classList.remove('drop-target');
      console.log('📦 [DropTarget] retiré pour shelf-id:', shelf.dataset.shelfId);
    }
  });

  // Drop → reorder
  container.addEventListener('drop', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!dragged || !shelf) return;
    e.preventDefault();

    const label = shelf.querySelector('.shelf-label-text');
    if (label) {
      label.classList.remove('drop-target');
      console.log('📦 [DropTarget] retiré après drop pour shelf-id:', shelf.dataset.shelfId);
    }
    if (shelf === dragged) return;

    const items = Array.from(container.children);
    const from = items.indexOf(dragged);
    const to   = items.indexOf(shelf);
    console.log(`📦 [Reorder] from ${from} to ${to}`);

    if (from < to) container.insertBefore(dragged, shelf.nextSibling);
    else           container.insertBefore(dragged, shelf);

    // Nouvelle série d'IDs
    const newOrder = Array.from(container.querySelectorAll('.shelf-block'))
      .map(el => el.dataset.shelfId);
    console.log('📦 [NewOrder]:', newOrder);

    // Mise à jour back-end
    fetch('/shelves/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({ ordered_ids: newOrder })
    })
    .then(r => r.json())
    .then(data => {
      console.log('✅ [Reorder shelves] OK:', data);
      // Met à jour localStorage + rerender
      const stored = JSON.parse(localStorage.getItem('shelves') || '[]');
      const reordered = newOrder
        .map(id => stored.find(s => s.id === id))
        .filter(Boolean);
      // Remet à jour l'ordre dans l'objet
      reordered.forEach((s, idx) => s.order = idx);
      updateStorage(reordered);
      console.log('📦 [LocalStorage] mise à jour (order réinitialisé) et rendu');
    })
    .catch(err => console.error('❌ [Reorder shelves] Error:', err));
  });
}
