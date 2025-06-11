<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Book;
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

            $lastBookOrder = Book::where('shelf_id', $validated['shelf_id'])->max('order');
            $validated['order'] = $lastBookOrder ? $lastBookOrder + 1 : 1;

            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                $imageFile = $request->file('image');
                $image = Image::read($imageFile->getPathname());

                $image->resize(100, 100, function ($c) {
                    $c->aspectRatio();
                    $c->upsize();
                });

                $validated['image'] = 'data:image/webp;base64,' . base64_encode($image->toWebp(75));
            }

            $book = Book::create([
                'id'          => Str::uuid(),
                'shelf_id'    => $validated['shelf_id'],
                'name'        => $validated['name'],
                'description' => $validated['description'] ?? null,
                'image'       => $validated['image'],
                'order'       => $validated['order'],
            ]);

            return response()->json(['success' => true, 'book' => $book]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Erreur création livre : ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erreur lors de la création.'], 500);
        }
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'shelf_id'     => 'required|uuid|exists:shelves,id',
            'ordered_ids'  => 'required|array',
            'ordered_ids.*'=> 'uuid|exists:books,id',
        ]);

        foreach ($validated['ordered_ids'] as $index => $bookId) {
            Book::where('id', $bookId)
                ->where('shelf_id', $validated['shelf_id'])
                ->update(['order' => $index]);
        }

        return response()->json(['success' => true]);
    }
}
