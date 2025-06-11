// resources/js/modules/initBookDrag.js

export default function initBookDrag() {
  const draggables = document.querySelectorAll('.book-draggable');
  let dragged = null;

  draggables.forEach(book => {
    // Empêche double initialisation
    if (book.dataset.dragInit) return;
    book.dataset.dragInit = 'true';

    book.setAttribute('draggable', true);

    book.addEventListener('dragstart', () => {
      dragged = book;
      console.log('Drag start:', dragged.dataset.bookId);
      setTimeout(() => book.classList.add('invisible'), 0);
    });

    book.addEventListener('dragend', () => {
      if (dragged) dragged.classList.remove('invisible');
      console.log('Drag end');
      dragged = null;
    });

    book.addEventListener('dragover', e => {
      e.preventDefault();
    });

    book.addEventListener('dragenter', () => {
      if (book !== dragged) {
        book.classList.add('border', 'border-primary');
        console.log('Drag enter:', book.dataset.bookId);
      }
    });

    book.addEventListener('dragleave', () => {
      book.classList.remove('border', 'border-primary');
    });

    book.addEventListener('drop', e => {
      e.preventDefault();
      book.classList.remove('border', 'border-primary');

      if (book === dragged) return;

      const parent = book.parentNode;
      const booksArray = Array.from(parent.children);
      const draggedIndex = booksArray.indexOf(dragged);
      const targetIndex = booksArray.indexOf(book);

      console.log('Drop detected');
      console.log('Dragged index:', draggedIndex, 'Target index:', targetIndex);

      if (draggedIndex < 0 || targetIndex < 0) {
        console.warn('One of the elements not found in DOM structure');
        return;
      }

      if (draggedIndex < targetIndex) {
        console.log('Moving after (droite)');
        parent.insertBefore(dragged, book.nextSibling);
      } else {
        console.log('Moving before (gauche)');
        parent.insertBefore(dragged, book);
      }

      const newOrder = Array.from(parent.querySelectorAll('.book-draggable'))
        .map(b => b.dataset.bookId);
      const shelfId = dragged.dataset.shelfId;

      console.log('New order:', newOrder);

      fetch('/books/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
          shelf_id: shelfId,
          ordered_ids: newOrder
        })
      })
      .then(res => res.json())
      .then(data => console.log('Reorder OK:', data))
      .catch(err => console.error('Erreur reorder:', err));
    });
  });
}
