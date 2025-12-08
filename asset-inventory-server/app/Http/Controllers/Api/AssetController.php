<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Asset;
use App\Models\Audit_log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AssetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Asset::with(['category', 'employee.department']);

        if ($request->has('department_id')) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('department_id', $request->department_id);
            });
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('inventory_code', 'LIKE', "%{$search}%")
                    ->orWhere('brand', 'LIKE', "%{$search}%")
                    ->orWhere('model', 'LIKE', "%{$search}%")
                    ->orWhereHas('employee', function ($q2) use ($search) {
                        $q2->where('first_name', 'LIKE', "%{$search}%")
                            ->orWhere('last_name', 'LIKE', "%{$search}%");
                    });
            });
        }

        $assets = $query->orderBy('created_at', 'desc')->get();

        return response()->json($assets);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'inventory_code' => 'required|string|unique:assets,inventory_code',
            'category_id' => 'required|exists:categories,id',
            'employee_id' => 'required|exists:employees,id',
            'brand' => 'required|string',
            'model' => 'required|string',
            'status' => 'required|in:operativo,en_reparacion,obsoleto,baja,disponible',
            'specifications' => 'nullable|array',
            'comments' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $asset = Asset::create($request->all());

        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'CREATE',
            'table_name' => 'assets',
            'record_id' => $asset->inventory_code,
            'description' => "Registró activo: {$asset->brand} {$asset->model} asignado a empleado ID {$asset->employee_id}",
        ]);

        return response()->json([
            'message' => 'Activo registrado exitosamente',
            'data' => $asset
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Asset $asset)
    {
        return response()->json($asset->load(['category', 'employee.department']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Asset $asset)
    {
        $validator = Validator::make($request->all(), [
            'inventory_code' => 'required|string|unique:assets,inventory_code,' . $asset->id,
            'category_id' => 'exists:categories,id',
            'employee_id' => 'exists:employees,id',
            'status' => 'in:operativo,en_reparacion,obsoleto,baja,disponible',
            'specifications' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $oldStatus = $asset->status;
        $oldEmployee = $asset->employee_id;

        $asset->update($request->all());

        $logDescription = "Actualizó activo {$asset->inventory_code}.";
        if ($oldStatus !== $asset->status) {
            $logDescription .= " Cambio de estado: $oldStatus -> {$asset->status}.";
        }
        if ($oldEmployee !== $asset->employee_id) {
            $logDescription .= " Reasignado de empleado ID $oldEmployee a {$asset->employee_id}.";
        }

        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'UPDATE',
            'table_name' => 'assets',
            'record_id' => $asset->inventory_code,
            'description' => $logDescription,
        ]);

        return response()->json([
            'message' => 'Activo actualizado',
            'data' => $asset
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Asset $asset)
    {
        $code = $asset->inventory_code;
        $asset->delete();

        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'DELETE',
            'table_name' => 'assets',
            'record_id' => $code,
            'description' => "Dio de baja el activo: {$code}",
        ]);

        return response()->json(['message' => 'Activo dado de baja correctamente']);
    }
}
