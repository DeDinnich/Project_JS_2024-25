// resources/js/modules/initShelfDrag.js
import { updateStorage } from './renderer';

export default function initShelfDrag() {
  const container = document.getElementById('shelves-container');
  if (!container) return;

  // Prevent multiple bindings
  if (container.dataset.dragInit) return;
  container.dataset.dragInit = 'true';

  let dragged = null;

  // When drag starts on a shelf
  container.addEventListener('dragstart', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!shelf) return;
    dragged = shelf;
    console.log('📦 [DragStart] shelf-id:', dragged.dataset.shelfId);
  });

  // When drag ends
  container.addEventListener('dragend', e => {
    if (!dragged) return;
    console.log('📦 [DragEnd] shelf-id:', dragged.dataset.shelfId);
    dragged = null;
  });

  // Allow dragover to signal droppable targets
  container.addEventListener('dragover', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!dragged || !shelf || shelf === dragged) return;
    e.preventDefault();
    console.log('📦 [DragOver] shelf-id:', shelf.dataset.shelfId);
  });

  // Highlight target on dragenter
  container.addEventListener('dragenter', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!dragged || !shelf || shelf === dragged) return;
    const label = shelf.querySelector('.shelf-label-text');
    if (label) {
      label.classList.add('drop-target');
      console.log('📦 [DropTarget] ajouté pour shelf-id:', shelf.dataset.shelfId);
    }
  });

  // Remove highlight on dragleave
  container.addEventListener('dragleave', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!shelf) return;
    const label = shelf.querySelector('.shelf-label-text');
    if (label) {
      label.classList.remove('drop-target');
      console.log('📦 [DropTarget] retiré pour shelf-id:', shelf.dataset.shelfId);
    }
  });

  // Handle drop to reorder
  container.addEventListener('drop', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!dragged || !shelf) return;
    e.preventDefault();

    // Clean up highlight
    const label = shelf.querySelector('.shelf-label-text');
    if (label) {
      label.classList.remove('drop-target');
      console.log('📦 [DropTarget] retiré après drop pour shelf-id:', shelf.dataset.shelfId);
    }
    if (shelf === dragged) return;

    // Swap in DOM
    const items = Array.from(container.children);
    const fromIndex = items.indexOf(dragged);
    const toIndex   = items.indexOf(shelf);
    console.log(`📦 [Reorder] from ${fromIndex} to ${toIndex}`);
    if (fromIndex < toIndex) container.insertBefore(dragged, shelf.nextSibling);
    else                     container.insertBefore(dragged, shelf);

    // Build new order
    const newOrder = Array.from(container.querySelectorAll('.shelf-block'))
      .map(el => el.dataset.shelfId);
    console.log('📦 [NewOrder]:', newOrder);

    // Send to backend
    fetch('/shelves/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({ ordered_ids: newOrder })
    })
    .then(res => res.json())
    .then(data => {
      console.log('✅ [Reorder shelves] OK:', data);
      // Update localStorage and rerender
      const stored = JSON.parse(localStorage.getItem('shelves') || '[]');
      const reordered = newOrder
        .map(id => stored.find(s => s.id === id))
        .filter(Boolean);
      reordered.forEach((s, idx) => s.order = idx);
      updateStorage(reordered);
      console.log('📦 [LocalStorage] mise à jour et rendu');
    })
    .catch(err => console.error('❌ [Reorder shelves] Error:', err));
  });
}
