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
            ['email' => 'admin@empresa.com'],
            [
                'name' => 'Admin Sistema',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'is_active' => true
            ]
        );

        User::firstOrCreate(
            ['email' => 'auditor@empresa.com'],
            [
                'name' => 'Auditor Externo',
                'password' => Hash::make('password123'),
                'role' => 'auditor',
                'is_active' => true
            ]
        );

        $deptNames = [
            'Tecnología e Informática',
            'Recursos Humanos',
            'Contabilidad y Finanzas',
            'Marketing y Ventas',
            'Operaciones y Logística',
            'Dirección General'
        ];

        $departments = [];
        foreach ($deptNames as $name) {
            $departments[] = Department::create([
                'name' => $name,
                'description' => 'Departamento encargado de ' . $name
            ]);
        }

        $catNames = [
            'Laptop',
            'Computadora de Escritorio',
            'Monitor',
            'Teclado/Mouse',
            'Impresora',
            'Teléfono IP',
            'Proyector',
            'Tablet',
            'Silla Ergonómica'
        ];

        $categories = [];
        foreach ($catNames as $name) {
            $categories[] = Category::create(['name' => $name]);
        }

        foreach ($departments as $dept) {

            $numEmployees = rand(5, 10);

            $employees = Employee::factory($numEmployees)->create([
                'department_id' => $dept->id
            ]);

            foreach ($employees as $emp) {
                $numAssets = rand(1, 3);

                Asset::factory($numAssets)->create([
                    'employee_id' => $emp->id,
                    'category_id' => $categories[array_rand($categories)]->id
                ]);
            }
        }
    }
}
