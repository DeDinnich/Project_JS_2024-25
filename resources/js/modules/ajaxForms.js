// resources/js/modules/ajaxForms.js

/**
 * Soumission AJAX pour tous les formulaires .ajax-form
 */
function handleAjaxFormSubmit(e) {
  e.preventDefault();
  const form   = e.currentTarget;
  const formId = form.id; // ex: "addBookForm-<shelfId>"
  const method = (form.querySelector('input[name="_method"]')?.value || form.method)
                   .toUpperCase();
  const data   = new FormData(form);

  // Déterminer la route à appeler en AJAX
  let url;
  if (formId.startsWith('addBookForm-')) {
    url = '/books';
  } else if (formId.startsWith('editBookForm-')) {
    const bookId = formId.replace('editBookForm-', '');
    url = `/books/${bookId}`;
  } else if (formId.startsWith('deleteBookForm-')) {
    const bookId = formId.replace('deleteBookForm-', '');
    url = `/books/${bookId}`;
  } else {
    console.error('Formulaire AJAX non reconnu :', formId);
    return;
  }

  fetch(url, {
    method,
    headers: {
      'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content
    },
    body: data
  })
    .then(r => r.json())
    .then(res => {
      if (!res.success) {
        alert(res.message || 'Erreur lors de la requête.');
        return;
      }
      // fermer le modal entièrement (et retirer toute interception)
      const modal = form.closest('.modal');
      if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';      // cache et désactive le modal
        document.body.classList.remove('modal-open');
        document.querySelectorAll('.modal-backdrop').forEach(m => m.remove());
        modal.dispatchEvent(new Event('custom:close'));
        form.reset();
      }
      // pas de mise à jour du DOM ici, c'est géré par notifications.js
    })
    .catch(err => console.error('❌ AJAX error:', err));
}

/**
 * Initialise les écouteurs de soumission pour .ajax-form
 */
export default function initAjaxForms() {
  document.querySelectorAll('.ajax-form').forEach(form => {
    form.removeEventListener('submit', handleAjaxFormSubmit);
    form.addEventListener('submit', handleAjaxFormSubmit);
  });
}
