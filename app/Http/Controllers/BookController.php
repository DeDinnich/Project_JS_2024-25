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
            Log::info('Starting book creation process.', ['request' => $request->all()]);

            $validated = $request->validate([
                'shelf_id'    => 'required|exists:shelves,id',
                'name'        => 'required|string',
                'description' => 'nullable|string',
                'image'       => 'required|file|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            Log::info('Validation successful.', ['validated' => $validated]);

            $last = Book::where('shelf_id', $validated['shelf_id'])->max('order');
            $validated['order'] = $last ? $last + 1 : 1;

            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                Log::info('Processing image upload.');
                $img = Image::read($request->file('image')->getPathname());
                $img->resize(100, 100, fn($c) => $c->aspectRatio()->upsize());
                $validated['image'] = 'data:image/webp;base64,' . base64_encode($img->toWebp(75));
                Log::info('Image processed successfully.');
            }

            $book = Book::create([
                'id'          => Str::uuid(),
                'shelf_id'    => $validated['shelf_id'],
                'name'        => $validated['name'],
                'description' => $validated['description'] ?? null,
                'image'       => $validated['image'],
                'order'       => $validated['order'],
            ]);

            Log::info('Book created successfully.', ['book' => $book]);

            event(new BookEvent(true, 'Livre ajouté avec succès.'));
            Log::info('Book creation event dispatched.');

            return response()->json(['success' => true, 'book' => $book]);
        } catch (\Exception $e) {
            Log::error('Error occurred during book creation.', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Une erreur est survenue lors de la création du livre.'], 500);
        }
    }

    public function reorder(Request $request)
    {
        try {
            Log::info('Starting book reorder process.', ['request' => $request->all()]);

            $v = $request->validate([
                'shelf_id'    => 'required|uuid|exists:shelves,id',
                'ordered_ids' => 'required|array',
                'ordered_ids.*' => 'uuid|exists:books,id',
            ]);

            Log::info('Validation successful.', ['validated' => $v]);

            foreach ($v['ordered_ids'] as $i => $id) {
                Book::where('id', $id)
                    ->where('shelf_id', $v['shelf_id'])
                    ->update(['order' => $i]);
                Log::info('Updated book order.', ['book_id' => $id, 'order' => $i]);
            }

            event(new BookEvent(true, 'Ordre des livres mis à jour.'));
            Log::info('Book reorder event dispatched.');

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error occurred during book reorder.', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Une erreur est survenue lors de la mise à jour de l\'ordre des livres.'], 500);
        }
    }
}
