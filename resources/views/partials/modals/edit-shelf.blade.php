<div class="modal fade" id="editShelfModal-{{ $shelf->id }}" tabindex="-1" data-custom-modal>
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Modifier l’étagère</h5>
                <button type="button" class="btn-close" data-custom-close></button>
            </div>
            <div class="modal-body">
                <form class="ajax-form" data-ajax-route="{{ route('shelves.update', $shelf->id) }}" method="POST">
                    @csrf
                    @method('PUT')

                    <div class="mb-3">
                        <label for="shelfName-{{ $shelf->id }}" class="form-label">Nom de l’étagère</label>
                        <input type="text" class="form-control" id="shelfName-{{ $shelf->id }}" name="name"
                            value="{{ $shelf->name }}" required>
                    </div>

                    <div class="mb-3">
                        <label for="shelfOrder-{{ $shelf->id }}" class="form-label">Ordre</label>
                        <input type="number" class="form-control" id="shelfOrder-{{ $shelf->id }}" name="order"
                            value="{{ $shelf->order }}" required>
                    </div>

                    <button type="submit" class="btn btn-primary">Enregistrer</button>
                </form>
            </div>
        </div>
    </div>
</div>
