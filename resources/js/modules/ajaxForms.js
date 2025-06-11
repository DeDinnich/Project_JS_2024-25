// resources/js/modules/ajaxForms.js

import { rebindScripts } from './helpers';

export default function initAjaxForms() {
  document.querySelectorAll('.ajax-form').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      const url            = form.dataset.ajaxRoute;
      const method         = form.method.toUpperCase();
      const formData       = new FormData(form);
      const isShelfForm    = url.includes('/shelves');
      const isBookForm     = url.includes('/books');
      const methodOverride = form.querySelector('input[name="_method"]');
      const effective      = methodOverride
                             ? methodOverride.value.toUpperCase()
                             : method;

      if (methodOverride) formData.append('_method', methodOverride.value);

      console.log('📡 AJAX →', url, '| méthode →', effective);

      try {
        const res  = await fetch(url, {
          method: method === 'GET' ? 'GET' : 'POST',
          headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
          body: formData,
        });
        const data = await res.json();
        console.log('✅ réponse AJAX :', data);

        if (!data.success) {
          alert('Erreur : ' + (data.message || 'inconnue'));
          return;
        }

        // fermer la modal
        const modal = form.closest('.modal');
        if (modal) {
          modal.classList.remove('show');
          modal.removeAttribute('style');
        }
        document.body.classList.remove('modal-open');
        document.querySelectorAll('.modal-backdrop').forEach(x => x.remove());
        form.reset();

        // —— Gestion des étagères ——
        if (isShelfForm) {
          const wrapper = document.querySelector('#shelves-container');
          let shelfId;

          // identifier shelfId pour POST/PUT
          if (data.shelf) {
            shelfId = data.shelf.id;
          } else if (effective === 'DELETE') {
            // extraire ID de l'URL
            const parts = url.split('/');
            shelfId = parts[parts.length - 1];
          }

          // ➕ Création
          if (effective === 'POST') {
            wrapper.insertAdjacentHTML('beforeend', renderShelf(data.shelf));
            console.log('➕ shelf ajouté', shelfId);
          }
          // ❌ Suppression
          else if (effective === 'DELETE') {
            const toRemove = wrapper.querySelector(`.shelf-block[data-shelf-id="${shelfId}"]`);
            if (toRemove) {
              toRemove.remove();
              console.log('❌ shelf supprimée', shelfId);
            }
          }

          // 🔄 Mise à jour TOUS les orders
          if (data.shelves) {
            console.log('🔄 maj orders globales');
            data.shelves.forEach(s => {
              const el = wrapper.querySelector(`.shelf-block[data-shelf-id="${s.id}"]`);
              if (el) el.dataset.order = s.order;
            });
          }

          // ↕ Tri des étagères
          const before = Array.from(wrapper.children).map(c => c.dataset.order);
          console.log('🕑 before sort:', before);

          Array.from(wrapper.children)
            .sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order))
            .forEach(el => wrapper.appendChild(el));

          const after = Array.from(wrapper.children).map(c => c.dataset.order);
          console.log('✅ after sort :', after);

          rebindScripts();
        }

        // —— Gestion des livres ——
        if (isBookForm && data.book) {
          const block = modal.closest('.shelf-block');
          const flex  = block?.querySelector('.d-inline-flex');
          console.log('📚 book ajouté', data.book.id);
          if (flex) {
            flex.insertAdjacentHTML('beforeend', renderBook(data.book));
            rebindScripts();
          }
        }

      } catch (err) {
        console.error('❌ Erreur AJAX :', err);
        alert('Une erreur est survenue.');
      }
    });
  });
}

function renderShelf(shelf) {
  return `
    <div class="d-inline-block position-relative shelf-block"
         data-shelf-id="${shelf.id}"
         data-order="${shelf.order}"
         style="width:100vw;height:200px; background:url('/images/texture_fond.png') center/cover repeat; margin-top:-7px;">
      <div class="h-100 px-3 overflow-auto" style="white-space:nowrap;">
        <div class="d-inline-flex align-items-center h-100">
          <!-- Supprimer -->
          <div class="text-center mx-2" style="width:100px;flex-shrink:0;">
            <a href="#" class="d-block rounded bg-danger" data-custom-open="deleteShelfModal-${shelf.id}"
               style="height:100px;border:2px dashed #999;display:flex;align-items:center;justify-content:center;">
              <i class="fas fa-trash fa-2x text-black"></i>
            </a>
            <div class="mt-2 p-2 text-white fw-bold small text-truncate">Supprimer</div>
          </div>
          <!-- Modifier -->
          <div class="text-center mx-2" style="width:100px;flex-shrink:0;">
            <a href="#" class="d-block rounded bg-warning" data-custom-open="editShelfModal-${shelf.id}"
               style="height:100px;border:2px dashed #999;display:flex;align-items:center;justify-content:center;">
              <i class="fas fa-edit fa-2x text-black"></i>
            </a>
            <div class="mt-2 p-2 text-white fw-bold small text-truncate">Modifier</div>
          </div>
          <!-- Ajouter livre -->
          <div class="text-center mx-2" style="width:100px;flex-shrink:0;">
            <a href="#" class="d-block rounded bg-success" data-custom-open="addBookModal-${shelf.id}"
               style="height:100px;border:2px dashed #999;display:flex;align-items:center;justify-content:center;">
              <i class="fas fa-plus fa-2x text-black"></i>
            </a>
            <div class="mt-2 p-2 text-white fw-bold small text-truncate">Ajouter</div>
          </div>
          <!-- Conteneur livres -->
          <div class="d-inline-flex align-items-center h-100">
            <!-- injecté par AJAX -->
          </div>
        </div>
      </div>
      <div class="position-absolute bottom-0 start-0 w-100"
           style="height:30px;background:url('/images/texture.png') repeat-x;">
        <div class="position-absolute start-50 translate-middle-x shelf-label"
             style="background:#fff;padding:0 10px;border-radius:5px;font-weight:bold;top:2px;box-shadow:0 2px 5px rgba(0,0,0,0.2);">
          ${shelf.name}
        </div>
      </div>
    </div>`;
}

function renderBook(book) {
  return `
    <div class="book-draggable text-center mx-2"
         data-book-id="${book.id}"
         data-shelf-id="${book.shelf_id}"
         style="width:100px;cursor:grab;">
      <img src="${book.image}" alt="${book.name}" class="img-fluid rounded" style="max-height:120px;">
      <div class="mt-2 mb-4 p-2 text-white fw-bold small text-truncate">
        ${book.name}
      </div>
    </div>`;
}
