{{-- Modal Bootstrap --}}
<div class="modal fade" id="addShelfModal" data-custom-modal>
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addShelfModalLabel">Ajouter une étagère</h5>
                <button type="button" class="btn-close" data-custom-close></button>
            </div>
            <div class="modal-body">
                <form class="ajax-form" data-ajax-route="{{ route('shelves.store') }}" method="POST">
                    @csrf
                    <div class="mb-3">
                        <label for="shelfName" class="form-label">Nom de l'étagère</label>
                        <input type="text" class="form-control" id="shelfName" name="name" required>
                    </div>
                    <div class="mb-3">
                        <label for="shelfDescription" class="form-label">Description</label>
                        <textarea class="form-control" id="shelfDescription" name="description" rows="3"></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="shelfOrder" class="form-label">Ordre</label>
                        <input type="number" class="form-control" id="shelfOrder" name="order" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Ajouter</button>
                </form>
            </div>
        </div>
    </div>
</div>
