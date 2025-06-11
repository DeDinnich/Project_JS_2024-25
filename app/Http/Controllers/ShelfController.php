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
            Log::info('ShelfController@store - Request received', ['request' => $request->all()]);

            $validated = $request->validate([
                'name'        => 'required|string',
                'description' => 'nullable|string',
                'order'       => 'required|integer',
            ]);

            Log::info('ShelfController@store - Validation successful', ['validated' => $validated]);

            Shelf::where('order', '>=', $validated['order'])->increment('order');
            Log::info('ShelfController@store - Incremented order for conflicting shelves');

            $shelf = Shelf::create($validated);
            Log::info('ShelfController@store - Shelf created successfully', ['shelf' => $shelf]);

            event(new ShelfEvent(true, 'Étagère créée avec succès.'));
            Log::info('ShelfController@store - Event dispatched');

            return response()->json([
                'success' => true,
                'shelf'   => $shelf,
                'shelves' => Shelf::orderBy('order')->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('ShelfController@store - Error occurred', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function update(Request $request, Shelf $shelf)
    {
        try {
            Log::info('ShelfController@update - Request received', ['request' => $request->all(), 'shelf' => $shelf]);

            $validated = $request->validate([
                'name'  => 'required|string|max:255',
                'order' => 'required|integer',
            ]);

            Log::info('ShelfController@update - Validation successful', ['validated' => $validated]);

            if ($validated['order'] != $shelf->order) {
                Log::info('ShelfController@update - Order conflict detected', ['validated_order' => $validated['order'], 'current_order' => $shelf->order]);

                $conflict = Shelf::where('order', $validated['order'])
                    ->where('id', '!=', $shelf->id)
                    ->first();

                if ($conflict) {
                    Log::info('ShelfController@update - Conflict shelf found', ['conflict' => $conflict]);

                    if ($validated['order'] < $shelf->order) {
                        Shelf::where('order', '>=', $validated['order'])
                             ->where('order', '<', $shelf->order)
                             ->increment('order');
                        Log::info('ShelfController@update - Incremented order for conflicting shelves');
                    } else {
                        Shelf::where('order', '<=', $validated['order'])
                             ->where('order', '>', $shelf->order)
                             ->decrement('order');
                        Log::info('ShelfController@update - Decremented order for conflicting shelves');
                    }
                }
            }

            $shelf->update([
                'name'  => $validated['name'],
                'order' => $validated['order'],
            ]);

            Log::info('ShelfController@update - Shelf updated successfully', ['shelf' => $shelf]);

            event(new ShelfEvent(true, 'Étagère mise à jour.'));
            Log::info('ShelfController@update - Event dispatched');

            return response()->json([
                'success' => true,
                'shelf'   => $shelf,
                'shelves' => Shelf::orderBy('order')->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('ShelfController@update - Error occurred', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function destroy(Shelf $shelf)
    {
        try {
            Log::info('ShelfController@destroy - Request received', ['shelf' => $shelf]);

            $shelf->books()->delete();
            Log::info('ShelfController@destroy - Associated books deleted');

            $shelf->delete();
            Log::info('ShelfController@destroy - Shelf deleted successfully');

            event(new ShelfEvent(true, 'Étagère supprimée.'));
            Log::info('ShelfController@destroy - Event dispatched');

            return response()->json([
                'success' => true,
                'shelves' => Shelf::orderBy('order')->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('ShelfController@destroy - Error occurred', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Une erreur est survenue.'], 500);
        }
    }
}
