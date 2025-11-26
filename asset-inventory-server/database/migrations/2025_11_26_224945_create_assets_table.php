<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('inventory_code')->unique();

            //Relaciones
            $table->foreignId('category_id')->constrained('categories');
            $table->foreignId('employee_id')->constrained('employees');

            //Datos comunes
            $table->string('brand');
            $table->string('model');
            $table->string('serial_number')->unique()->nullable();

            //Estado y JSON
            $table->enum('status', ['operativo', 'en_reparacion', 'obsoleto', 'baja', 'disponible'])->default('operativo');
            $table->json('specifications')->nullable();

            $table->text('comments')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
