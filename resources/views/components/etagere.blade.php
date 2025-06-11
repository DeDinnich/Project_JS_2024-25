<div class="d-inline-block position-relative shelf-block"
     data-shelf-id="{{ $shelf->id }}"
     data-order="{{ $shelf->order }}"
     style="width: 100vw; height: 200px; background-image: url('{{ asset('images/texture_fond.png') }}'); background-size: cover; background-repeat: repeat; margin-top: -7px;">

    <div class="h-100 px-3 overflow-auto" style="white-space: nowrap;">
        <div class="d-inline-flex align-items-center h-100">

            {{-- Supprimer --}}
            <div class="text-center mx-2" style="width: 100px; flex-shrink: 0;">
                <a href="#" class="d-block rounded bg-danger d-flex align-items-center justify-content-center text-decoration-none"
                   style="height: 100px; border: 2px dashed #999;" data-custom-open="deleteShelfModal-{{ $shelf->id }}">
                    <i class="fas fa-trash fa-2x text-black"></i>
                </a>
                <div class="mt-2 mb-4 p-2 text-white fw-bold small text-truncate"
                     style="background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(5px); border-radius: 5px;">
                    Supprimer
                </div>
                @include('partials.modals.delete-shelf', ['shelf' => $shelf])
            </div>

            {{-- Modifier --}}
            <div class="text-center mx-2" style="width: 100px; flex-shrink: 0;">
                <a href="#" class="d-block rounded bg-warning d-flex align-items-center justify-content-center text-decoration-none"
                   style="height: 100px; border: 2px dashed #999;" data-custom-open="editShelfModal-{{ $shelf->id }}">
                    <i class="fas fa-edit fa-2x text-black"></i>
                </a>
                <div class="mt-2 mb-4 p-2 text-white fw-bold small text-truncate"
                     style="background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(5px); border-radius: 5px;">
                    Modifier
                </div>
                @include('partials.modals.edit-shelf', ['shelf' => $shelf])
            </div>

            {{-- Ajouter un livre --}}
            <div class="text-center mx-2" style="width: 100px; flex-shrink: 0;">
                <a href="#" class="d-block rounded bg-success d-flex align-items-center justify-content-center text-decoration-none"
                   style="height: 100px; border: 2px dashed #999;" data-custom-open="addBookModal-{{ $shelf->id }}">
                    <i class="fas fa-plus fa-2x text-black"></i>
                </a>
                @include('partials.modals.add-book', ['shelf' => $shelf])
            </div>

            {{-- Livres --}}
            @foreach ($shelf->books as $book)
                <div class="book-draggable text-center mx-2"
                     data-book-id="{{ $book->id }}"
                     data-shelf-id="{{ $shelf->id }}"
                     style="width: 100px; flex-shrink: 0; cursor: grab;">
                    <img src="{{ $book->image }}" alt="{{ $book->name }}"
                         class="img-fluid rounded" style="max-height: 120px;">
                    <div class="mt-2 mb-4 p-2 text-white fw-bold small text-truncate"
                         style="background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(5px); border-radius: 5px;">
                        {{ $book->name }}
                    </div>
                </div>
            @endforeach

        </div>
    </div>

    <div class="position-absolute bottom-0 start-0 w-100"
         style="height: 30px; background-image: url('{{ asset('images/texture.png') }}'); background-repeat: repeat-x; background-size: auto 100%;">
        <div class="position-absolute start-50 translate-middle-x text-center shelf-label"
             style="background: #ffffff; color: #000000; padding: 0 10px; border-radius: 5px; font-weight: bold; top: 2px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"
             data-shelf-id="{{ $shelf->id }}">
            {{ $shelf->name }}
        </div>
    </div>
</div>
