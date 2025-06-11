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

    public function update(Request $request, Shelf $shelf)
    {
        try {
            $validated = $request->validate([
                'name'  => 'required|string|max:255',
                'order' => 'required|integer',
            ]);

            if ($validated['order'] != $shelf->order) {
                $conflict = Shelf::where('order', $validated['order'])
                                 ->where('id', '!=', $shelf->id)
                                 ->first();
                if ($conflict) {
                    if ($validated['order'] < $shelf->order) {
                        Shelf::where('order', '>=', $validated['order'])
                             ->where('order', '<', $shelf->order)
                             ->increment('order');
                    } else {
                        Shelf::where('order', '<=', $validated['order'])
                             ->where('order', '>', $shelf->order)
                             ->decrement('order');
                    }
                }
            }

            $shelf->update([
                'name'  => $validated['name'],
                'order' => $validated['order'],
            ]);

            event(new ShelfEvent(
                true,
                'Étagère mise à jour.',
                'update',
                $shelf,
                Shelf::orderBy('order')->get()->toArray()
            ));

            return response()->json([
                'success' => true,
                'shelf'   => $shelf,
                'shelves' => Shelf::orderBy('order')->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('ShelfController@update - Error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la mise à jour.'
            ], 500);
        }
    }

    public function destroy(Shelf $shelf)
    {
        try {
            $shelf->books()->delete();
            $shelf->delete();

            event(new ShelfEvent(
                true,
                'Étagère supprimée.',
                'delete',
                null,
                Shelf::orderBy('order')->get()->toArray()
            ));

            return response()->json([
                'success' => true,
                'shelves' => Shelf::orderBy('order')->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('ShelfController@destroy - Error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la suppression.'
            ], 500);
        }
    }
}
