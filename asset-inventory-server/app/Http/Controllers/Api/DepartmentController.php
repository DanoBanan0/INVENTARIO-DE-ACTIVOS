<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Department;
use App\Models\Audit_log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $departments = Department::all();

        return response()->json($departments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $department = Department::create([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
        ]);

        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'CREATE',
            'table_name' => 'departments',
            'record_id' => $department->id,
            'description' => 'Creó el departamento: ' . $department->name,
        ]);

        return response()->json([
            'message' => 'Departamento creado exitosamente',
            'data' => $department
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Department $department)
    {
        return response()->json($department);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Department $department)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:departments,name,' . $department->id,
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldName = $department->name;

        $department->update([
            'name' => $request->name,
            'description' => $request->description
        ]);

        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'UPDATE',
            'table_name' => 'departments',
            'record_id' => $department->id,
            'description' => "Actualizó departamento: De '{$oldName}' a '{$department->name}'",
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'message' => 'Departamento actualizado exitosamente',
            'data' => $department
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Department $department)
    {
        if ($department->employees()->count() > 0) {
            return response()->json([
                'error' => 'No se puede eliminar', 
                'message' => 'Este departamento tiene empleados asignados. Reasíngnalos antes de eliminar.'
            ], 409);
        }

        $name = $department->name;
        $department->delete();

        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'DELETE',
            'table_name' => 'departments',
            'record_id' => $department->id,
            'description' => "Eliminó el departamento: '{$name}'",
        ]);

        return response()->json([
            'message' => 'Departamento eliminado exitosamente'
        ], 200);
    }
}