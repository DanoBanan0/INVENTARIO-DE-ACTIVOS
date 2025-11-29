<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');
        $token = Auth::attempt($credentials);

        if (!$token) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        
        $user = Auth::user();

        if (!$user->is_active) {
            Auth::logout();
            return response()->json([
                'error' => 'Usuario inactivo',
                'message' => 'Tu cuenta ha sido desactivada. Contacta al administrador.'
            ], 403);
        }
        
        return response()->json([
            'message' => 'User successfully logged in',
            'user' => $user,
            'authorization' => [
                'token' => $token,
                'type' => 'bearer',
            ]
        ], 200);
    }

    // Obtener información del usuario autenticado
    public function me()
    {
        return response()->json(JWTAuth::parseToken()->authenticate());
    }

    // Cerrar sesión del usuario
    public function logout()
    {
        Auth::logout();
        return response()->json(['message' => 'Successfully logged out']);
    }

    //refrescar el token del usuario
    public function refresh()
    {
        return response()->json([
            'new_access_token' => Auth::refresh(),
            'token_type' => 'bearer',
        ]);
    }
}
