// resources/js/modules/initBookDrag.js

export default function initBookDrag() {
  const draggables = document.querySelectorAll('.book-item');
  let dragged = null;
  let originShelf = null;

  draggables.forEach(book => {
    if (book.dataset.dragInit) return;
    book.dataset.dragInit = 'true';
    book.draggable = true;

    book.addEventListener('dragstart', e => {
      e.stopPropagation();
      dragged = book;
      originShelf = book.dataset.shelfId;
      setTimeout(() => dragged.classList.add('invisible'), 0);
      console.log('📚 [DragStart]', dragged.dataset.bookId, 'from shelf', originShelf);
    });

    book.addEventListener('dragend', e => {
      e.stopPropagation();
      if (dragged) {
        dragged.classList.remove('invisible');
        console.log('📚 [DragEnd]');
      }
      dragged = null;
      originShelf = null;
    });

    book.addEventListener('dragover', e => {
      e.stopPropagation();
      if (!dragged) return;
      e.preventDefault();
    });

    book.addEventListener('drop', e => {
      e.stopPropagation();
      if (!dragged || book === dragged) return;
      e.preventDefault();

      // 1) déplacer dans le DOM
      const targetShelf = book.dataset.shelfId;
      const parent = book.parentNode;
      const booksArray = Array.from(parent.children);
      const fromIdx = booksArray.indexOf(dragged);
      const toIdx = booksArray.indexOf(book);
      if (fromIdx < toIdx) parent.insertBefore(dragged, book.nextSibling);
      else parent.insertBefore(dragged, book);

      // 2) calculer le nouvel ordre de la targetShelf
      const newOrder = Array.from(parent.querySelectorAll('.book-item'))
        .map(b => b.dataset.bookId);

      console.log('📚 [Drop] moved to shelf', targetShelf, 'newOrder:', newOrder);

      // 3) si même étagère, on appelle /books/reorder
      if (originShelf === targetShelf) {
        fetch('/books/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content
          },
          body: JSON.stringify({
            shelf_id: targetShelf,
            ordered_ids: newOrder
          })
        })
        .then(r => r.json())
        .then(() => console.log('✅ [Reorder OK] same shelf'))
        .catch(err => console.error(err));
      }
      // 4) sinon, on appelle /books/move
      else {
        fetch('/books/move', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content
          },
          body: JSON.stringify({
            book_id: dragged.dataset.bookId,
            from_shelf_id: originShelf,
            to_shelf_id: targetShelf,
            ordered_ids: newOrder
          })
        })
        .then(r => r.json())
        .then(() => console.log('✅ [Move OK] inter-shelf'))
        .catch(err => console.error(err));
      }
    });
  });
}
