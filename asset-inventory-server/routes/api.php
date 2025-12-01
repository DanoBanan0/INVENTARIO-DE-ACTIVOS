<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;

// Route::group(['middleware' => 'auth:api'], function () {
//     Route::post('/logout', [AuthController::class, 'logout']);
//     Route::post('/refresh', [AuthController::class, 'refresh']);
//     Route::get('/me', [AuthController::class, 'me']);

//     Route::get('/departments', [DepartmentController::class, 'index']);
//     Route::post('/departments', [DepartmentController::class, 'store']);
//     Route::get('/departments/{department}', [DepartmentController::class, 'show']);
//     Route::put('/departments/{department}', [DepartmentController::class, 'update']);
//     Route::delete('/departments/{department}', [DepartmentController::class, 'destroy']);

//     Route::get('/employees', [EmployeeController::class, 'index']);
//     Route::post('/employees', [EmployeeController::class, 'store']);
//     Route::get('/employees/{employee}', [EmployeeController::class, 'show']);
//     Route::put('/employees/{employee}', [EmployeeController::class, 'update']);
//     Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);

//     Route::get('/categories', [CategoryController::class, 'index']);
//     Route::post('/categories', [CategoryController::class, 'store']);
//     Route::get('/categories/{category}', [CategoryController::class, 'show']);
//     Route::put('/categories/{category}', [CategoryController::class, 'update']);
//     Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

//     Route::get('/assets', [AssetController::class, 'index']);
//     Route::post('/assets', [AssetController::class, 'store']);
//     Route::get('/assets/{asset}', [AssetController::class, 'show']);
//     Route::put('/assets/{asset}', [AssetController::class, 'update']);
//     Route::delete('/assets/{asset}', [AssetController::class, 'destroy']);

//     Route::get('/audit-logs', [AuditLogController::class, 'index']);
//     Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

//     Route::get('/users', [App\Http\Controllers\Api\UserController::class, 'index']);
//     Route::post('/users', [App\Http\Controllers\Api\UserController::class, 'store']);
//     Route::put('/users/{id}', [App\Http\Controllers\Api\UserController::class, 'update']);
//     Route::delete('/users/{id}', [App\Http\Controllers\Api\UserController::class, 'destroy']);
// });

// Route::post('/login', [AuthController::class, 'login']);

// 1. RUTA PÚBLICA (Login)
Route::post('/login', [AuthController::class, 'login']);

// 2. RUTAS PROTEGIDAS (Requieren Token)
Route::group(['middleware' => 'auth:api'], function () {

    // --- UTILIDADES DE AUTH (Para todos) ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);

    // --- DASHBOARD (Para todos) ---
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    // --- ZONA DE LECTURA (GET) ---
    // Accesibles para Admin, Jefe y Auditor (Para que funcionen las tablas y el Explorador)

    // Departamentos (Lectura)
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::get('/departments/{department}', [DepartmentController::class, 'show']);

    // Empleados (Lectura)
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/employees/{employee}', [EmployeeController::class, 'show']);

    // Categorías (Lectura)
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);

    // Activos (Lectura)
    Route::get('/assets', [AssetController::class, 'index']);
    Route::get('/assets/{asset}', [AssetController::class, 'show']);


    // --- ZONA DE AUDITORÍA (Admin + Auditor) ---
    // El Jefe NO puede entrar aquí
    Route::get('/audit-logs', [AuditLogController::class, 'index'])
        ->middleware('role:admin,auditor');


    // --- ZONA DE ALTA SEGURIDAD (SOLO ADMIN) ---
    // Aquí están los POST, PUT, DELETE y la gestión de Usuarios
    Route::group(['middleware' => 'role:admin'], function () {

        // Gestión de Usuarios (CRUD Completo)
        // Nota: apiResource crea automáticamente index, store, show, update, destroy
        Route::apiResource('users', UserController::class);

        // Escritura en Departamentos
        Route::post('/departments', [DepartmentController::class, 'store']);
        Route::put('/departments/{department}', [DepartmentController::class, 'update']);
        Route::delete('/departments/{department}', [DepartmentController::class, 'destroy']);

        // Escritura en Empleados
        Route::post('/employees', [EmployeeController::class, 'store']);
        Route::put('/employees/{employee}', [EmployeeController::class, 'update']);
        Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);

        // Escritura en Categorías
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        // Escritura en Activos
        Route::post('/assets', [AssetController::class, 'store']);
        Route::put('/assets/{asset}', [AssetController::class, 'update']);
        Route::delete('/assets/{asset}', [AssetController::class, 'destroy']);
    });
});
