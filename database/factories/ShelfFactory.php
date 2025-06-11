<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ShelfFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id' => Str::uuid(),
            'name' => 'Étagère ' . fake()->word(),
            'description' => fake()->sentence(),
            'order' => fake()->unique()->numberBetween(1, 100),
        ];
    }
}
