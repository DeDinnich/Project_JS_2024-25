// resources/js/modules/initBookDrag.js

export default function initBookDrag() {
  const draggables = document.querySelectorAll('.book-item');
  let dragged = null;

  draggables.forEach(book => {
    if (book.dataset.dragInit) return;
    book.dataset.dragInit = 'true';
    book.draggable = true;

    book.addEventListener('dragstart', e => {
      e.stopPropagation();
      dragged = book;
      console.log('📚 [DragStart] book-id:', dragged.dataset.bookId);
      setTimeout(() => dragged.classList.add('invisible'), 0);
    });

    book.addEventListener('dragend', e => {
      e.stopPropagation();
      if (dragged) {
        dragged.classList.remove('invisible');
        console.log('📚 [DragEnd] book-id:', dragged.dataset.bookId);
      }
      dragged = null;
    });

    book.addEventListener('dragover', e => {
      e.stopPropagation();
      if (!dragged) return;
      e.preventDefault();
      console.log('📚 [DragOver] book-id:', book.dataset.bookId);
    });

    book.addEventListener('dragenter', e => {
      e.stopPropagation();
      if (!dragged || book === dragged) return;
      console.log('📚 [DragEnter] book-id:', book.dataset.bookId);
      book.classList.add('border', 'border-primary');
    });

    book.addEventListener('dragleave', e => {
      e.stopPropagation();
      if (!dragged) return;
      console.log('📚 [DragLeave] book-id:', book.dataset.bookId);
      book.classList.remove('border', 'border-primary');
    });

    book.addEventListener('drop', e => {
      e.stopPropagation();
      if (!dragged || book === dragged) return;
      e.preventDefault();
      console.log('📚 [Drop] on book-id:', book.dataset.bookId);
      book.classList.remove('border', 'border-primary');

      const parent = book.parentNode;
      const booksArray = Array.from(parent.children);
      const from = booksArray.indexOf(dragged);
      const to = booksArray.indexOf(book);
      console.log(`📚 [Reorder] from ${from} to ${to}`);

      if (from < to) parent.insertBefore(dragged, book.nextSibling);
      else parent.insertBefore(dragged, book);

      const newOrder = Array.from(parent.querySelectorAll('.book-item'))
        .map(b => b.dataset.bookId);
      console.log('📚 [NewOrder]:', newOrder);
      const shelfId = dragged.dataset.shelfId;

      fetch('/books/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({ shelf_id: shelfId, ordered_ids: newOrder })
      })
      .then(res => res.json())
      .then(data => console.log('✅ [Reorder books] OK:', data))
      .catch(err => console.error('❌ [Reorder books] Error:', err));
    });
  });
}
