// resources/js/modules/notifications.js

import { rebindScripts }        from './helpers';
import { renderShelf, renderBook } from './ajaxForms';  // <— IMPORT crucial

export default function initNotifications() {
  const container        = document.getElementById('notification-container');
  const shelvesContainer = document.getElementById('shelves-container');
  if (!container || !shelvesContainer || !window.Echo) return;

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
  setTimeout(() => {
    alert.classList.add('fade-out');
    alert.addEventListener('transitionend', () => alert.remove());
  }, 3000);
}

function handleShelf({ action, shelf, shelves }, container) {
  if (action === 'create') {
    // désormais disponible !
    container.insertAdjacentHTML('beforeend', renderShelf(shelf));
  }
  else if (action === 'update') {
    const el = container.querySelector(`.shelf-block[data-shelf-id="${shelf.id}"]`);
    if (el) {
      el.querySelector('.shelf-label').textContent = shelf.name;
      el.dataset.order = shelf.order;
    }
  }
  else if (action === 'delete') {
    Array.from(container.children).forEach(node => {
      if (!shelves.find(s => s.id === node.dataset.shelfId)) {
        node.remove();
      }
    });
  }

  // tri + rebind
  Array.from(container.children)
    .sort((a,b)=>Number(a.dataset.order)-Number(b.dataset.order))
    .forEach(n=>container.appendChild(n));
  rebindScripts();
}

function handleBook({ action, book, ordered_ids, shelf_id }) {
  const shelfBlock = document.querySelector(`.shelf-block[data-shelf-id="${shelf_id}"]`);
  if (!shelfBlock) return;
  const flex = shelfBlock.querySelector('.d-inline-flex');

  if (action === 'create' && book) {
    flex.insertAdjacentHTML('beforeend', renderBook(book));
  }
  else if (action === 'reorder') {
    ordered_ids.forEach((id, idx) => {
      const el = flex.querySelector(`.book-draggable[data-book-id="${id}"]`);
      if (el) el.dataset.order = idx;
    });
    Array.from(flex.children)
      .sort((a,b)=>Number(a.dataset.order)-Number(b.dataset.order))
      .forEach(n=>flex.appendChild(n));
  }

  rebindScripts();
}
