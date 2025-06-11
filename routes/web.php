<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\IndexController;
use App\Http\Controllers\ShelfController;
use App\Http\Controllers\BookController;

Route::get('/', [IndexController::class, 'index'])->name('home');
Route::post('/shelves', [ShelfController::class, 'store'])->name('shelves.store');
Route::put('/shelves/{shelf}', [ShelfController::class, 'update'])->name('shelves.update');
Route::delete('/shelves/{shelf}', [ShelfController::class, 'destroy'])->name('shelves.destroy');
Route::get('/api/shelves/partial', [ShelfController::class, 'partial'])->name('shelves.partial');
Route::post('/books', [BookController::class, 'store'])->name('books.store');
Route::post('/books/reorder', [BookController::class, 'reorder'])->name('books.reorder');
