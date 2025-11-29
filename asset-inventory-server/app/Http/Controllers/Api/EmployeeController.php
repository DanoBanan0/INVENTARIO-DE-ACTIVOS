<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Audit_log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Employee::with('department')->get();

        if ($request->has('department_id')) {
            $query->where('department_id', $request->input('department_id'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        $employees = $query->orderBy('last_name', 'asc')->get();

        return response()->json($employees);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:employees,email',
            'department_id' => 'required|exists:departments,id',
            'status' => 'in:activo,inactivo',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $employee = Employee::create($request->all());

        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'CREATE',
            'table_name' => 'employees',
            'record_id' => $employee->id,
            'description' => "Creó al empleado: {$employee->first_name} {$employee->last_name}",
        ]);

        return response()->json(['message' => 'Empleado creado exitosamente', 'data' => $employee], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $employee = Employee::with(['department', 'assets'])->find($id);

        if (!$employee) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        return response()->json($employee);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'nullable|email|unique:employees,email,' . $employee->id,
            'department_id' => 'required|exists:departments,id',
            'status' => 'in:activo,inactivo'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $employee->update($request->all());

        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'UPDATE',
            'table_name' => 'employees',
            'record_id' => $employee->id,
            'description' => "Actualizó datos del empleado: {$employee->first_name} {$employee->last_name}",
        ]);

        return response()->json([
            'message' => 'Empleado actualizado',
            'data' => $employee
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        if ($employee->assets()->count() > 0) {
            return response()->json([
                'error' => 'No se puede eliminar',
                'message' => 'Este empleado tiene activos asignados. Primero reasigna o desvincula los activos.'
            ], 409);
        }

        $fullName = "{$employee->first_name} {$employee->last_name}";
        $employee->delete();

        // AUDITORÍA
        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'DELETE',
            'table_name' => 'employees',
            'record_id' => $employee->id,
            'description' => "Eliminó al empleado: {$fullName}",
        ]);

        return response()->json(['message' => 'Empleado eliminado correctamente']);
    }
}
