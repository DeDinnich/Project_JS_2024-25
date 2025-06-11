export default function initNotifications() {
  const container = document.getElementById('notification-container');
  const shelvesContainer = document.getElementById('shelves-container');
  if (!container || !shelvesContainer) return;

  const channel = window.Echo.channel('reverb');

  channel.listen('ShelfEvent', event => {
    console.log('📬 ShelfEvent reçu :', event);
    showNotification(container, event.message, event.success);
    handleShelf(event, shelvesContainer);
  });

  channel.listen('BookEvent', event => {
    console.log('📬 BookEvent reçu :', event);
    showNotification(container, event.message, event.success);
    handleBook(event);
  });
}

function showNotification(container, message, success) {
  const alert = document.createElement('div');
  alert.classList.add('notification', success ? 'notification-success' : 'notification-error');
  alert.textContent = message;
  container.appendChild(alert);
  setTimeout(() => { alert.classList.add('fade-out'); alert.addEventListener('transitionend', () => alert.remove()); }, 3000);
}

function handleShelf({ action, shelf, shelves }, container) {
  if (action === 'create') {
    container.insertAdjacentHTML('beforeend', renderShelfHTML(shelf));
  } else if (action === 'update') {
    const el = container.querySelector(`.shelf-block[data-shelf-id="${shelf.id}"]`);
    if (el) {
      el.querySelector('.shelf-label').textContent = shelf.name;
      el.dataset.order = shelf.order;
    }
  } else if (action === 'delete') {
    Array.from(container.children).forEach(node => {
      if (!shelves.find(s => s.id === node.dataset.shelfId)) node.remove();
    });
  }
  Array.from(container.children)
    .sort((a,b)=>a.dataset.order - b.dataset.order)
    .forEach(n=>container.appendChild(n));
  rebindScripts();
}

function handleBook({ action, book, ordered_ids }) {
  const shelfBlock = document.querySelector(`.shelf-block[data-shelf-id="${book ? book.shelf_id : ordered_ids[0]}"]`);
  if (!shelfBlock) return;
  const flex = shelfBlock.querySelector('.d-inline-flex');
  if (action === 'create') {
    flex.insertAdjacentHTML('beforeend', renderBookHTML(book));
  } else if (action === 'reorder') {
    ordered_ids.forEach((id, idx) => {
      const el = flex.querySelector(`.book-draggable[data-book-id="${id}"]`);
      if (el) el.dataset.order = idx;
    });
    Array.from(flex.children)
      .sort((a,b)=>a.dataset.order - b.dataset.order)
      .forEach(n=>flex.appendChild(n));
  }
  rebindScripts();
}
