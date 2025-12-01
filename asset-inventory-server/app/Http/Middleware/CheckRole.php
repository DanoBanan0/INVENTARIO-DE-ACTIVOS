<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Verificar si hay usuario
        if (! $request->user()) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // 2. SOLUCIÓN CLAVE: Aplanar y limpiar los roles
        // Laravel a veces envía ["admin,auditor"] en vez de ["admin", "auditor"]
        $allowedRoles = [];
        foreach ($roles as $role) {
            if (str_contains($role, ',')) {
                $allowedRoles = array_merge($allowedRoles, explode(',', $role));
            } else {
                $allowedRoles[] = $role;
            }
        }

        // 3. Comparar con el rol del usuario
        $userRole = trim($request->user()->role);

        if (! in_array($userRole, $allowedRoles)) {
            return response()->json(['message' => 'Acceso Denegado: Rol insuficiente'], 403);
        }

        return $next($request);
    }
}
