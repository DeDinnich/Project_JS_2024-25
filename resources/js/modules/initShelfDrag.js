// resources/js/modules/initShelfDrag.js
import { updateStorage } from './renderer';

export default function initShelfDrag() {
  const container = document.getElementById('shelves-container');
  let dragged = null;

  if (!container) {
    console.warn('📦 [initShelfDrag] shelves-container non trouvé');
    return;
  }
  console.log('📦 [initShelfDrag] Delegated drag & drop initialisé');

  // début du drag
  container.addEventListener('dragstart', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!shelf) return;
    dragged = shelf;
    console.log('📦 [DragStart] shelf-id:', dragged.dataset.shelfId);
  });

  // fin du drag
  container.addEventListener('dragend', e => {
    if (dragged) {
      console.log('📦 [DragEnd] shelf-id:', dragged.dataset.shelfId);
      dragged = null;
    }
  });

  // survol pendant le drag
  container.addEventListener('dragover', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!dragged || !shelf || shelf === dragged) return;
    console.log('📦 [DragOver] shelf-id:', shelf.dataset.shelfId);
    e.preventDefault();
  });

  // entrée dans une cible
  container.addEventListener('dragenter', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!dragged || !shelf || shelf === dragged) return;
    console.log('📦 [DragEnter] shelf-id:', shelf.dataset.shelfId);
    const label = shelf.querySelector('.shelf-label-text');
    if (label) {
      label.classList.add('drop-target');
      console.log('📦 [DropTarget] ajouté pour shelf-id:', shelf.dataset.shelfId);
    }
  });

  // sortie d'une cible
  container.addEventListener('dragleave', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!shelf) return;
    console.log('📦 [DragLeave] shelf-id:', shelf.dataset.shelfId);
    const label = shelf.querySelector('.shelf-label-text');
    if (label) {
      label.classList.remove('drop-target');
      console.log('📦 [DropTarget] retiré pour shelf-id:', shelf.dataset.shelfId);
    }
  });

  // dépôt
  container.addEventListener('drop', e => {
    const shelf = e.target.closest('.shelf-block');
    if (!dragged || !shelf) return;
    console.log('📦 [Drop] sur shelf-id:', shelf.dataset.shelfId);
    e.preventDefault();
    const label = shelf.querySelector('.shelf-label-text');
    if (label) {
      label.classList.remove('drop-target');
      console.log('📦 [DropTarget] retiré après drop pour shelf-id:', shelf.dataset.shelfId);
    }
    if (shelf === dragged) return;

    const children = Array.from(container.children);
    const from = children.indexOf(dragged);
    const to = children.indexOf(shelf);
    console.log(`📦 [Reorder] from ${from} to ${to}`);

    if (from < to) container.insertBefore(dragged, shelf.nextSibling);
    else container.insertBefore(dragged, shelf);

    const newOrder = Array.from(container.querySelectorAll('.shelf-block'))
      .map(el => el.dataset.shelfId);
    console.log('📦 [NewOrder]:', newOrder);

    // mise à jour back-end
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

      // mettre à jour le localStorage et re-rendu (mise à jour order)
      const stored = JSON.parse(localStorage.getItem('shelves') || '[]');
      const reordered = newOrder
        .map(id => stored.find(s => s.id === id))
        .filter(s => s);

      // mise à jour de la propriété order
      reordered.forEach((sh, idx) => { sh.order = idx; });

      updateStorage(reordered);
      console.log('📦 [LocalStorage] mise à jour (order réinitialisé) et rendu');
    })
    .catch(err => console.error('❌ [Reorder shelves] Error:', err));
  });
}
