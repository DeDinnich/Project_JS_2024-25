<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Shelf;
use App\Models\Book;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Shelf::factory(4)->create()->each(function ($shelf) {
            Book::factory(1)->create([
                'shelf_id' => $shelf->id,
            ]);
        });
    }
}
