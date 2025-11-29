<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Audit_log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::OrderBy('name', 'asc')->get();
        return response()->json($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:categories,name'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $category = Category::create([
            'name' => $request->name
        ]);

        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'CREATE',
            'table_name' => 'categories',
            'record_id' => $category->id,
            'description' => "Creó la categoría: {$category->name}",
        ]);

        return response()->json([
            'message' => 'Categoría creada exitosamente',
            'data' => $category
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return response()->json($category);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:categories,name,' . $category->id
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $oldName = $category->name;
        $category->update(['name' => $request->name]);

        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'UPDATE',
            'table_name' => 'categories',
            'record_id' => $category->id,
            'description' => "Renombró categoría: De '{$oldName}' a '{$category->name}'",
        ]);

        return response()->json([
            'message' => 'Categoría actualizada',
            'data' => $category
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        if ($category->assets()->count() > 0) {
            return response()->json([
                'error' => 'No se puede eliminar',
                'message' => 'Existen activos registrados bajo esta categoría. No se puede eliminar.'
            ], 409);
        }

        $name = $category->name;
        $category->delete();

        Audit_log::create([
            'user_id' => Auth::id(),
            'action' => 'DELETE',
            'table_name' => 'categories',
            'record_id' => $category->id,
            'description' => "Eliminó la categoría: {$name}",

        ]);

        return response()->json(['message' => 'Categoría eliminada correctamente']);
    }
}
