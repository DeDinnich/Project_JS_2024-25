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
            $img->resize(100, 100, fn($c)=>$c->aspectRatio()->upsize());
            $validated['image'] = 'data:image/webp;base64,'.base64_encode($img->toWebp(75));
        }

        $book = Book::create([
            'id'          => Str::uuid(),
            'shelf_id'    => $validated['shelf_id'],
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'image'       => $validated['image'],
            'order'       => $validated['order'],
        ]);

        // Envoi immédiat
        event(new BookEvent(
            true,
            'Livre ajouté avec succès.',
            'create',
            $book,
            [],
            $book->shelf_id
        ));

        return response()->json(['success'=>true,'book'=>$book]);
    }

    public function reorder(Request $request)
    {
        $v = $request->validate([
            'shelf_id'    => 'required|uuid|exists:shelves,id',
            'ordered_ids' => 'required|array',
            'ordered_ids.*'=> 'uuid|exists:books,id',
        ]);

        foreach ($v['ordered_ids'] as $i=>$id) {
            Book::where('id',$id)
                ->where('shelf_id',$v['shelf_id'])
                ->update(['order'=>$i]);
        }

        // Envoi immédiat
        event(new BookEvent(
            true,
            'Ordre des livres mis à jour.',
            'reorder',
            null,
            $v['ordered_ids'],
            $v['shelf_id']
        ));

        return response()->json(['success'=>true]);
    }
}
