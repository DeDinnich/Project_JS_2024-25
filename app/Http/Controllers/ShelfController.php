<?php
// app/Http/Controllers/ShelfController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Shelf;

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
            Log::info('ShelfController@store - Existing shelves order adjusted');

            $shelf = Shelf::create($validated);
            Log::info('ShelfController@store - Shelf created', ['shelf' => $shelf]);

            return response()->json([
                'success' => true,
                'shelf'   => $shelf,
                'shelves' => Shelf::orderBy('order')->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('ShelfController@store - Error occurred', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'An error occurred while storing the shelf.'], 500);
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
                $conflict = Shelf::where('order', $validated['order'])
                                 ->where('id', '!=', $shelf->id)
                                 ->first();

                if ($conflict) {
                    Log::info('ShelfController@update - Conflict detected', ['conflict' => $conflict]);

                    if ($validated['order'] < $shelf->order) {
                        Shelf::where('order', '>=', $validated['order'])
                             ->where('order', '<', $shelf->order)
                             ->increment('order');
                        Log::info('ShelfController@update - Order adjusted for upward movement');
                    } else {
                        Shelf::where('order', '<=', $validated['order'])
                             ->where('order', '>', $shelf->order)
                             ->decrement('order');
                        Log::info('ShelfController@update - Order adjusted for downward movement');
                    }
                }
            }

            $shelf->update([
                'name'  => $validated['name'],
                'order' => $validated['order'],
            ]);

            Log::info('ShelfController@update - Shelf updated', ['shelf' => $shelf]);

            return response()->json([
                'success' => true,
                'shelf'   => $shelf,
                'shelves' => Shelf::orderBy('order')->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('ShelfController@update - Error occurred', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'An error occurred while updating the shelf.'], 500);
        }
    }

    public function destroy(Shelf $shelf)
    {
        try {
            Log::info('ShelfController@destroy - Request received', ['shelf' => $shelf]);

            $shelf->books()->delete();
            Log::info('ShelfController@destroy - Books associated with shelf deleted');

            $shelf->delete();
            Log::info('ShelfController@destroy - Shelf deleted');

            return response()->json([
                'success' => true,
                'shelves' => Shelf::orderBy('order')->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('ShelfController@destroy - Error occurred', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'An error occurred while deleting the shelf.'], 500);
        }
    }
}
