// resources/js/modules/ajaxForms.js
import { rebindScripts } from './helpers';
import { renderShelf } from './renderer';

function handleAjaxFormSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const url = form.dataset.ajaxRoute;
  const method = (form.querySelector('input[name="_method"]')?.value || form.method).toUpperCase();
  const data = new FormData(form);

  fetch(url, {
    method: method === 'GET' ? 'GET' : method,
    headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content },
    body: data
  })
  .then(r => r.json())
  .then(res => {
    if (!res.success) return alert(res.message || 'Erreur');
    const modal = form.closest('.modal');
    modal?.dispatchEvent(new Event('custom:close'));
    form.reset();
    if (url === '/books' && res.book) {
      const block = document.querySelector(`.shelf-block[data-shelf-id="${res.book.shelf_id}"]`);
      block?.querySelector('.shelf-inner').insertAdjacentHTML('beforeend', renderBook(res.book, res.book.shelf_id));
    }
  })
  .finally(() => rebindScripts())
  .catch(err => console.error(err));
}

export default function initAjaxForms() {
  document.querySelectorAll('.ajax-form').forEach(f => {
    f.removeEventListener('submit', handleAjaxFormSubmit);
    f.addEventListener('submit', handleAjaxFormSubmit);
  });
}
