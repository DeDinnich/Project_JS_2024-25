<div class="modal fade" id="deleteShelfModal-{{ $shelf->id }}" tabindex="-1" data-custom-modal>
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Supprimer l’étagère</h5>
                <button type="button" class="btn-close" data-custom-close></button>
            </div>
            <div class="modal-body">
                <p>Êtes-vous sûr de vouloir supprimer cette étagère <strong>"{{ $shelf->name }}"</strong> ?<br>
                <span class="text-danger">Tous les livres associés seront également supprimés.</span></p>

                <form class="ajax-form" data-ajax-route="{{ route('shelves.destroy', $shelf->id) }}" method="POST">
                    @csrf
                    @method('DELETE')

                    <div class="d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary" data-custom-close>Annuler</button>
                        <button type="submit" class="btn btn-danger">Supprimer</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
