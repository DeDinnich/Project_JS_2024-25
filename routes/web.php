<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\IndexController;
use App\Http\Controllers\ShelfController;
use App\Http\Controllers\BookController;

Route::get('/', [IndexController::class, 'index'])->name('home');

Route::post('/shelves', [ShelfController::class, 'store'])->name('shelves.store');
Route::post('/shelves/reorder', [ShelfController::class, 'reorder'])->name('shelves.reorder');

Route::post('/books', [BookController::class, 'store'])->name('books.store');
Route::post('/books/reorder', [BookController::class, 'reorder'])->name('books.reorder');
Route::put('/books/{book}',    [BookController::class, 'update'])->name('books.update');
Route::delete('/books/{book}',    [BookController::class, 'destroy'])->name('books.destroy');
