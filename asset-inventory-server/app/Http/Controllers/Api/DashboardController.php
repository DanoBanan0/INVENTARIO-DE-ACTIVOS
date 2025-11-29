<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Asset;
use App\Models\Employee;
use App\Models\Department;
use App\Models\User;

class DashboardController extends Controller
{
    public function summary() {

        return response()->json([
            'total_asseets' => Asset::count(),
            'total_employees' => Employee::count(),
            'total_departments' => Department::count(),
            'assets_by_status' => [
                'operativo' => Asset::where('status', 'operativo')->count(),
                'reparacion' => Asset::where('status', 'en_reparacion')->count(),
                'disponible' => Asset::where('status', 'disponible')->count(),
            ],

            'recent_assets' => Asset::with('category')->latest()->take(5)->get(),
        ]);
    }
}
