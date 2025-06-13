<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Shelf;
use App\Events\ShelfEvent;

class ShelfController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name'        => 'required|string',
                'description' => 'nullable|string',
                'order'       => 'required|integer',
            ]);

            // Décale les étagères existantes si nécessaire
            Shelf::where('order', '>=', $validated['order'])->increment('order');

            // Création
            $shelf = Shelf::create($validated);

            // Broadcast immédiat
            event(new ShelfEvent(
                true,
                'Étagère créée avec succès.',
                'create',
                $shelf,
                Shelf::orderBy('order')->get()->toArray()
            ));

            return response()->json([
                'success' => true,
                'shelf'   => $shelf,
                'shelves' => Shelf::orderBy('order')->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('ShelfController@store - Error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la création.'
            ], 500);
        }
    }

    public function reorder(Request $request)
    {
        try {
            $validated = $request->validate([
                'ordered_ids'   => 'required|array',
                'ordered_ids.*' => 'uuid|exists:shelves,id',
            ]);

            foreach ($validated['ordered_ids'] as $index => $id) {
                \App\Models\Shelf::where('id', $id)->update(['order' => $index]);
            }

            // Event de mise à jour si besoin
            event(new \App\Events\ShelfEvent(
                true,
                'Ordre des étagères mis à jour.',
                'reorder',
                null,
                $validated['ordered_ids']
            ));

            return response()->json(['success' => true]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('ShelfController@reorder - Validation Error', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation des données.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('ShelfController@reorder - Error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la réorganisation.',
            ], 500);
        }
    }
}
