@extends('layouts.index')

@section('title', 'La bibliothèque du JS')

@section('content')
    <div class="container-fluid p-0">
        <div id="shelves-container">
            @foreach($shelves as $shelf)
                @include('components.etagere', ['shelf' => $shelf])
            @endforeach
        </div>

        {{-- Bouton Ajouter une étagère --}}
        <div class="add-shelf-button d-flex justify-content-center align-items-center" style="width: 100vw; height: 200px; background-image: url('{{ asset('images/texture_fond.png') }}'); background-size: cover; background-repeat: repeat; margin-top: -7px; position: relative;">
            <button type="button" class="btn btn-outline-light border-2 rounded-pill px-4 py-2 fw-bold" data-custom-open="addShelfModal">
                <i class="fas fa-plus me-2"></i> Ajouter une étagère
            </button>

            <div class="position-absolute bottom-0 start-0 w-100" style="height: 30px; background-image: url('{{ asset('images/texture.png') }}'); background-repeat: repeat-x; background-size: auto 100%;"></div>
        </div>

        @include('partials.modals.add-shelf')
    </div>
@endsection
