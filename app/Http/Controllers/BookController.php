<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Book;
use App\Events\BookEvent;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class BookController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'shelf_id'    => 'required|exists:shelves,id',
                'name'        => 'required|string',
                'description' => 'nullable|string',
                'image'       => 'required|file|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            $lastOrder = Book::where('shelf_id', $validated['shelf_id'])->max('order');
            $validated['order'] = $lastOrder ? $lastOrder + 1 : 1;

            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                $img = Image::read($request->file('image')->getPathname());
                $img->resize(100, 100, fn($c) => $c->aspectRatio()->upsize());
                $validated['image'] = 'data:image/webp;base64,' . base64_encode($img->toWebp(75));
            }

            $book = Book::create([
                'id'          => Str::uuid(),
                'shelf_id'    => $validated['shelf_id'],
                'name'        => $validated['name'],
                'description' => $validated['description'] ?? null,
                'image'       => $validated['image'],
                'order'       => $validated['order'],
            ]);

            event(new BookEvent(
                true,
                'Livre ajouté avec succès.',
                'create',
                $book
            ));

            return response()->json([
                'success' => true,
                'book'    => $book,
            ]);
        } catch (\Exception $e) {
            Log::error('BookController@store - Error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la création du livre.'
            ], 500);
        }
    }

    public function reorder(Request $request)
    {
        try {
            $data = $request->validate([
                'shelf_id'    => 'required|uuid|exists:shelves,id',
                'ordered_ids' => 'required|array',
                'ordered_ids.*' => 'uuid|exists:books,id',
            ]);

            foreach ($data['ordered_ids'] as $index => $id) {
                Book::where('id', $id)
                    ->where('shelf_id', $data['shelf_id'])
                    ->update(['order' => $index]);
            }

            event(new BookEvent(
                true,
                'Ordre des livres mis à jour.',
                'reorder',
                null,
                $data['ordered_ids']
            ));

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('BookController@reorder - Error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la mise à jour de l’ordre des livres.'
            ], 500);
        }
    }
}
