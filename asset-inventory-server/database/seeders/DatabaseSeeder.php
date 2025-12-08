<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;
use App\Models\Category;
use App\Models\Employee;
use App\Models\Asset;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Daniel Admin',
                'password' => Hash::make('test123'),
                'role' => 'admin',
                'is_active' => true
            ]
        );
    }
}
