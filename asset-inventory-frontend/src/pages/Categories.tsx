// src/pages/Categories.tsx
import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Category } from '../types';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash, FaTags, FaSpinner } from 'react-icons/fa';

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error cargando categorías', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // --- CREAR ---
    const handleCreate = async () => {
        const { value: name } = await Swal.fire({
            title: 'Nueva Categoría',
            input: 'text',
            inputLabel: 'Nombre de la categoría',
            inputPlaceholder: 'Ej: Laptops, Proyectores...',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            inputValidator: (value) => {
                if (!value) return 'El nombre es obligatorio';
            }
        });

        if (name) {
            try {
                await api.post('/categories', { name });
                Swal.fire('¡Creada!', 'La categoría ha sido registrada.', 'success');
                fetchCategories();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
            }
        }
    };

    // --- EDITAR ---
    const handleEdit = async (cat: Category) => {
        const { value: name } = await Swal.fire({
            title: 'Editar Categoría',
            input: 'text',
            inputLabel: 'Nuevo nombre',
            inputValue: cat.name,
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            inputValidator: (value) => {
                if (!value) return 'El nombre no puede estar vacío';
            }
        });

        if (name && name !== cat.name) {
            try {
                await api.put(`/categories/${cat.id}`, { name });
                Swal.fire('¡Actualizado!', 'Categoría renombrada correctamente.', 'success');
                fetchCategories();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'Error al actualizar', 'error');
            }
        }
    };

    // --- ELIMINAR ---
    const handleDelete = (id: number) => {
        Swal.fire({
            title: '¿Eliminar categoría?',
            text: "Si existen activos de este tipo, no se podrá eliminar.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, borrar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/categories/${id}`);
                    Swal.fire('Eliminado', 'La categoría ha sido borrada.', 'success');
                    fetchCategories();
                } catch (error: any) {
                    Swal.fire('No se puede eliminar', error.response?.data?.message || 'Error desconocido', 'error');
                }
            }
        });
    };

    if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaTags className="text-orange-500" /> Categorías de Activos
                    </h1>
                    <p className="text-gray-500 text-sm">Clasifica tus equipos (Hardware, Periféricos, etc.)</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2 transition-transform hover:scale-105 font-medium"
                >
                    <FaPlus /> Nueva Categoría
                </button>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 border-b">ID</th>
                            <th className="px-6 py-4 border-b">Nombre</th>
                            <th className="px-6 py-4 border-b text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center py-8 text-gray-400">
                                    No hay categorías registradas.
                                </td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-orange-50/30 transition-colors">
                                    <td className="px-6 py-4 text-gray-500">#{cat.id}</td>
                                    <td className="px-6 py-4 font-bold text-gray-700">{cat.name}</td>
                                    <td className="px-6 py-4 flex justify-center gap-3">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-2 rounded-full transition"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Categories;