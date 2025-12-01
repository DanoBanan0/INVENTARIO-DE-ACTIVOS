<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    // Listar usuarios (Solo Admin debería ver esto)
    public function index()
    {
        // Ocultamos al propio usuario logueado para que no se borre a sí mismo accidentalmente
        $currentUserId = Auth::id();

        $users = User::query()
            ->when($currentUserId, function ($query) use ($currentUserId) {
                return $query->where('id', '!=', $currentUserId);
            })
            ->get();
        return response()->json($users);
    }

    // Crear nuevo usuario (Admin)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,jefe,auditor'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Encriptar
            'role' => $request->role,
            'is_active' => true
        ]);

        return response()->json(['message' => 'Usuario creado exitosamente', 'data' => $user], 201);
    }

    // Editar usuario (Rol o Estado)
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) return response()->json(['error' => 'Usuario no encontrado'], 404);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $id,
            'role' => 'required|in:admin,jefe,auditor',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) return response()->json($validator->errors(), 422);

        $data = $request->only(['name', 'email', 'role', 'is_active']);
        
        // Solo actualizamos password si enviaron una nueva
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['message' => 'Usuario actualizado', 'data' => $user]);
    }

    // Eliminar usuario
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['error' => 'Usuario no encontrado'], 404);

        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
}