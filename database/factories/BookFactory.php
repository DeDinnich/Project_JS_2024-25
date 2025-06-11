<?php

// database/factories/BookFactory.php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BookFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id' => Str::uuid(),
            'name' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'image' => null, // ou générer un dummy plus tard
            'order' => $this->faker->unique()->numberBetween(1, 1000),
        ];
    }
}
