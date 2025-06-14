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

    public function move(Request $request)
    {
        $v = $request->validate([
            'book_id'        => 'required|uuid|exists:books,id',
            'from_shelf_id'  => 'required|uuid|exists:shelves,id',
            'to_shelf_id'    => 'required|uuid|exists:shelves,id',
            'ordered_ids'    => 'required|array',
            'ordered_ids.*'  => 'uuid|exists:books,id',
        ]);

        // 1) on change l'étagère du livre
        Book::where('id', $v['book_id'])
            ->update(['shelf_id' => $v['to_shelf_id']]);

        // 2) on réordonne l'ancienne étagère
        $oldOrder = Book::where('shelf_id', $v['from_shelf_id'])->pluck('id')->all();
        foreach ($oldOrder as $i => $id) {
            Book::where('id', $id)->update(['order' => $i]);
        }

        // 3) on réordonne la nouvelle étagère selon ordered_ids
        foreach ($v['ordered_ids'] as $i => $id) {
            Book::where('id', $id)
                ->update(['order' => $i, 'shelf_id' => $v['to_shelf_id']]);
        }

        // 4) émettre deux events pour que le front réagisse
        event(new BookEvent(true, 'Ordre de l’ancienne étagère mis à jour.', 'reorder', null, $oldOrder, $v['from_shelf_id']));
        event(new BookEvent(true, 'Livre déplacé et nouvel ordre appliqué.', 'reorder', null, $v['ordered_ids'], $v['to_shelf_id']));

        return response()->json(['success' => true]);
    }
}
