// resources/js/modules/renderer.js
import { rebindScripts } from './helpers';

export default function initRenderer() {
  const initial = window.__initialShelves || [];
  localStorage.setItem('shelves', JSON.stringify(initial));
  renderAll();
}

export function renderAll() {
  const container = document.getElementById('shelves-container');
  if (!container) return;
  container.innerHTML = '';

  const shelves = JSON.parse(localStorage.getItem('shelves') || '[]');
  shelves
    .sort((a, b) => a.order - b.order)
    .forEach(shelf => container.insertAdjacentHTML('beforeend', renderShelf(shelf)));

  // réinitialiser tous les scripts après rendu (drag, ajax, modals…)
  rebindScripts();
}

export function updateStorage(newShelves) {
  localStorage.setItem('shelves', JSON.stringify(newShelves));
  renderAll();
}

export function renderShelf(shelf) {
  const booksHTML = shelf.books
    .sort((a, b) => a.order - b.order)
    .map(book => renderBook(book, shelf.id))
    .join('');

  return `
  <div class="shelf-block" draggable="true" data-shelf-id="${shelf.id}" data-order="${shelf.order}">
    <div class="shelf-scroll">
      <div class="shelf-inner">

        <div class="shelf-action text-center">
          <a href="#" class="btn bg-success" data-custom-open="addBookModal-${shelf.id}">
            <i class="fas fa-plus"></i>
          </a>
          <div class="shelf-label-action">Ajouter</div>
        </div>

        ${booksHTML}

      </div>
    </div>
    <div class="shelf-name-bar">
      <div class="shelf-label-text">${shelf.name}</div>
    </div>
  </div>

  ${renderAddBookModal(shelf)}
  ${shelf.books.map(book => renderEditBookModal(book)).join('')}
  ${shelf.books.map(book => renderDeleteBookModal(book)).join('')}
  ${shelf.books.map(book => renderViewBookModal(book)).join('')}
  `;
}

export function renderBook(book, shelfId) {
  return `
  <div
    class="book-item"
    draggable="true"
    data-book-id="${book.id}"
    data-shelf-id="${shelfId}"
    data-order="${book.order}"
    style="cursor: pointer;"
    data-custom-open="viewBookModal-${book.id}"
  >
    <img src="${book.image}" alt="${book.name}" class="img-fluid rounded" style="max-height:120px; object-fit:cover;" />
    <div class="book-name">${book.name}</div>
  </div>`;
}

function renderAddBookModal(shelf) {
  return `
  <div class="modal fade" id="addBookModal-${shelf.id}" tabindex="-1" data-custom-modal>
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Ajouter un livre</h5>
          <button type="button" class="btn-close" data-custom-close></button>
        </div>
        <div class="modal-body">
          <form
            id="addBookForm-${shelf.id}"
            class="ajax-form"
            action="/books"
            method="POST"
            enctype="multipart/form-data"
          >
            <input type="hidden" name="_token"
                   value="${document.querySelector('meta[name=csrf-token]').content}">
            <input type="hidden" name="shelf_id" value="${shelf.id}">
            <div class="mb-3">
              <label class="form-label">Nom du livre</label>
              <input type="text" class="form-control" name="name" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Image</label>
              <input type="file" class="form-control" name="image"
                     accept="image/*" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" name="description"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Ajouter</button>
          </form>
        </div>
      </div>
    </div>
  </div>`;
}

function renderEditBookModal(book) {
  return `
  <div class="modal fade" id="editBookModal-${book.id}" tabindex="-1" data-custom-modal>
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Modifier le livre</h5>
          <button type="button" class="btn-close" data-custom-close></button>
        </div>
        <div class="modal-body">
          <form class="ajax-form" data-ajax-route="/books/${book.id}" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="_token" value="${document.querySelector('meta[name=csrf-token]').content}">
            <input type="hidden" name="_method" value="PUT" />
            <div class="mb-3">
              <label class="form-label">Nom</label>
              <input type="text" class="form-control" name="name" value="${book.name}" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" name="description">${book.description || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">Enregistrer</button>
          </form>
        </div>
      </div>
    </div>
  </div>`;
}

function renderDeleteBookModal(book) {
  return `
  <div class="modal fade" id="deleteBookModal-${book.id}" tabindex="-1" data-custom-modal>
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Supprimer le livre</h5>
          <button type="button" class="btn-close" data-custom-close></button>
        </div>
        <div class="modal-body">
          Confirmez-vous la suppression de « ${book.name} » ?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-custom-close>Annuler</button>
          <form class="ajax-form" data-ajax-route="/books/${book.id}" method="POST">
            <input type="hidden" name="_token" value="${document.querySelector('meta[name=csrf-token]').content}" />
            <input type="hidden" name="_method" value="DELETE" />
            <button type="submit" class="btn btn-danger">Supprimer</button>
          </form>
        </div>
      </div>
    </div>
  </div>`;
}

// Détail : modal d’affichage d’un livre
function renderViewBookModal(book) {
  return `
  <div class="modal fade" id="viewBookModal-${book.id}" tabindex="-1" data-custom-modal>
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Détails du livre</h5>
          <button type="button" class="btn-close" data-custom-close></button>
        </div>
        <div class="modal-body">
          <div class="row gy-3">
            <div class="col-4 d-flex justify-content-center align-items-start">
              <img src="${book.image}" alt="${book.name}" class="img-fluid rounded" style="width:100%; height:auto; object-fit:cover;" />
            </div>
            <div class="col-8">
              <h4>${book.name}</h4>
              <hr/>
              <p>${book.description || '<em>Aucune description.</em>'}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-custom-close>Fermer</button>
        </div>
      </div>
    </div>
  </div>`;
}
