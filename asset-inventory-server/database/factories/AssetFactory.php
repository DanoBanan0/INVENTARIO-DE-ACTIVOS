<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AssetFactory extends Factory
{
    public function definition(): array
    {
        $specs = [
            'sistema_operativo' => $this->faker->randomElement(['Windows 11 Pro', 'macOS Sonoma', 'Ubuntu 22.04']),
            'ram' => $this->faker->randomElement(['8GB', '16GB', '32GB']),
            'almacenamiento' => $this->faker->randomElement(['256GB SSD', '512GB SSD', '1TB SSD']),
            'procesador' => $this->faker->randomElement(['Intel i5', 'Intel i7', 'AMD Ryzen 5', 'M2 Chip']),
            'color' => $this->faker->safeColorName()
        ];

        return [
            'inventory_code' => 'ACT-' . $this->faker->unique()->numberBetween(10000, 99999),
            'brand' => $this->faker->randomElement(['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Logitech']),
            'model' => $this->faker->word . ' ' . $this->faker->numberBetween(100, 900),
            'serial_number' => $this->faker->uuid(),
            'status' => $this->faker->randomElement(['operativo', 'operativo', 'operativo', 'en_reparacion', 'disponible']),
            'specifications' => $specs,
            'comments' => $this->faker->sentence(),
        ];
    }
}
