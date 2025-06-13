// resources/js/modules/initBookDrag.js
export default function initBookDrag() {
  const draggables = document.querySelectorAll('.book-item');
  let dragged = null;

  draggables.forEach(book => {
    if (book.dataset.dragInit) return;
    book.dataset.dragInit = 'true';
    book.draggable = true;

    book.addEventListener('dragstart', () => {
      dragged = book;
      console.log('📚 [DragStart] book-id:', dragged.dataset.bookId);
      setTimeout(() => dragged.classList.add('invisible'), 0);
    });

    book.addEventListener('dragend', () => {
      if (dragged) {
        dragged.classList.remove('invisible');
        console.log('📚 [DragEnd] book');
      }
      dragged = null;
    });

    book.addEventListener('dragover', e => {
      if (!(dragged && dragged.classList.contains('book-item'))) return;
      console.log('📚 [DragOver] book-id:', book.dataset.bookId);
      e.preventDefault();
    });

    book.addEventListener('dragenter', () => {
      if (!(dragged && dragged.classList.contains('book-item')) || book === dragged) return;
      console.log('📚 [DragEnter] book-id:', book.dataset.bookId);
      book.classList.add('border', 'border-primary');
    });

    book.addEventListener('dragleave', () => {
      if (!(dragged && dragged.classList.contains('book-item'))) return;
      console.log('📚 [DragLeave] book-id:', book.dataset.bookId);
      book.classList.remove('border', 'border-primary');
    });

    book.addEventListener('drop', e => {
      if (!(dragged && dragged.classList.contains('book-item'))) return;
      console.log('📚 [Drop] on book-id:', book.dataset.bookId);
      e.preventDefault();
      book.classList.remove('border', 'border-primary');

      if (book === dragged) return;

      const parent = book.parentNode;
      const booksArray = Array.from(parent.children);
      const from = booksArray.indexOf(dragged);
      const to = booksArray.indexOf(book);
      console.log(`📚 [Reorder] from ${from} to ${to}`);

      if (from < to) parent.insertBefore(dragged, book.nextSibling);
      else parent.insertBefore(dragged, book);

      const newOrder = Array.from(parent.querySelectorAll('.book-item')).map(b => b.dataset.bookId);
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
