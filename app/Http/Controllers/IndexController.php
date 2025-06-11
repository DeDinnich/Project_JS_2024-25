<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Shelf;

class IndexController extends Controller
{
    public function index()
    {
        $shelves = Shelf::with(['books' => function ($query) {
            $query->orderBy('order');
        }])->orderBy('order')->get();

        return view('pages.index', compact('shelves'));
    }
}
