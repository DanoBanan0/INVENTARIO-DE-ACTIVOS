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
     * Listar empleados.
     */
    public function index(Request $request)
    {
        // 1. Iniciamos la consulta (Builder), NO ejecutamos get() todavía
        $query = Employee::with('department');

        // 2. Aplicamos filtros SI existen
        if ($request->has('department_id') && $request->department_id != null) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->has('search') && $request->search != null) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'LIKE', "%{$search}%")
                    ->orWhere('last_name', 'LIKE', "%{$search}%");
            });
        }

        // 3. Finalmente ordenamos y ejecutamos la consulta
        // Aquí es donde ocurría el error: antes se ejecutaba el get() muy pronto
        $employees = $query->orderBy('id', 'desc')->get();

        return response()->json($employees);
    }

    /**
     * Crear empleado.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'nullable|email|unique:employees,email',
            'department_id' => 'required|exists:departments,id',
            'status' => 'in:activo,inactivo'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $employee = Employee::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'department_id' => $request->department_id,
            'status' => $request->status ?? 'activo'
        ]);

        // AUDITORÍA
        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'CREATE',
            'table_name' => 'employees',
            'record_id' => $employee->id,
            'description' => "Creó al empleado: {$employee->first_name} {$employee->last_name}",
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'message' => 'Empleado registrado exitosamente',
            'data' => $employee
        ], 201);
    }

    /**
     * Mostrar un empleado.
     */
    public function show($id)
    {
        $employee = Employee::with(['department', 'assets'])->find($id);

        if (!$employee) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        return response()->json($employee);
    }

    /**
     * Actualizar empleado.
     */
    public function update(Request $request, $id)
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'nullable|email|unique:employees,email,' . $id,
            'department_id' => 'required|exists:departments,id',
            'status' => 'in:activo,inactivo'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $employee->update($request->all());

        // AUDITORÍA
        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'UPDATE',
            'table_name' => 'employees',
            'record_id' => $employee->id,
            'description' => "Actualizó datos del empleado: {$employee->first_name} {$employee->last_name}",
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'message' => 'Empleado actualizado',
            'data' => $employee
        ]);
    }

    /**
     * Eliminar empleado.
     */
    public function destroy(Request $request, $id)
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        if ($employee->assets()->count() > 0) {
            return response()->json([
                'error' => 'No se puede eliminar',
                'message' => 'Este empleado tiene activos asignados.'
            ], 409);
        }

        $fullName = "{$employee->first_name} {$employee->last_name}";
        $employee->delete();

        // AUDITORÍA
        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'DELETE',
            'table_name' => 'employees',
            'record_id' => $id,
            'description' => "Eliminó al empleado: {$fullName}",
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'Empleado eliminado correctamente']);
    }
}
