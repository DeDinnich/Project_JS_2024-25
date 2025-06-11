<!-- Modal -->
<div class="modal fade" id="addBookModal-{{ $shelf->id }}" tabindex="-1" data-custom-modal>
    <div class="modal-dialog modal-dialog-centered"> <!-- Ajout de la classe modal-dialog-centered -->
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addBookModalLabel">Ajouter un livre</h5>
                <button type="button" class="btn-close" data-custom-close></button>
            </div>
            <div class="modal-body">
                <!-- Formulaire pour ajouter un livre -->
                <form class="ajax-form" data-ajax-route="{{ route('books.store') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    <input type="hidden" name="shelf_id" value="{{ $shelf->id }}">

                    <div class="mb-3">
                        <label for="bookName" class="form-label">Nom du livre</label>
                        <input type="text" class="form-control" id="bookName" name="name" required>
                    </div>

                    <div class="mb-3">
                        <label for="bookImage" class="form-label">Image du livre</label>
                        <input type="file" class="form-control" id="bookImage" name="image" accept="image/*" required>
                    </div>

                    <div class="mb-3">
                        <label for="bookDescription" class="form-label">Description</label>
                        <textarea class="form-control" id="bookDescription" name="description" rows="3"></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary">Ajouter</button>
                </form>
            </div>
        </div>
    </div>
</div>
<div class="mt-2 mb-4 p-2 text-white fw-bold small text-truncate" style="
    background: rgba(255, 255, 255, 0.3);
    color: #ffffff;
    backdrop-filter: blur(5px);
    border-radius: 5px;
    max-width: 100px;
">
    Ajouter
</div>
