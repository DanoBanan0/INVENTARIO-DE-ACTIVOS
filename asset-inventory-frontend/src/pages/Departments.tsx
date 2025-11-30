// src/pages/Departments.tsx
import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Department } from '../types';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaSpinner } from 'react-icons/fa';

const Departments = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar la lista desde la API
    const fetchDepartments = async () => {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error al cargar departamentos', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // --- CREAR DEPARTAMENTO ---
    const handleCreate = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Nuevo Departamento',
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Nombre (ej: Finanzas)">' +
                '<input id="swal-input2" class="swal2-input" placeholder="Descripción (Opcional)">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return [
                    (document.getElementById('swal-input1') as HTMLInputElement).value,
                    (document.getElementById('swal-input2') as HTMLInputElement).value
                ];
            }
        });

        if (formValues) {
            const [name, description] = formValues;
            if (!name) return Swal.fire('Error', 'El nombre es obligatorio', 'error');

            try {
                // Enviamos al Backend
                await api.post('/departments', { name, description });
                Swal.fire('¡Creado!', 'El departamento ha sido registrado.', 'success');
                fetchDepartments(); // Recargamos la tabla
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'No se pudo crear', 'error');
            }
        }
    };

    // --- EDITAR DEPARTAMENTO ---
    const handleEdit = async (dept: Department) => {
        const { value: formValues } = await Swal.fire({
            title: 'Editar Departamento',
            html:
                `<input id="swal-input1" class="swal2-input" placeholder="Nombre" value="${dept.name}">` +
                `<input id="swal-input2" class="swal2-input" placeholder="Descripción" value="${dept.description || ''}">`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            preConfirm: () => {
                return [
                    (document.getElementById('swal-input1') as HTMLInputElement).value,
                    (document.getElementById('swal-input2') as HTMLInputElement).value
                ];
            }
        });

        if (formValues) {
            const [name, description] = formValues;
            try {
                await api.put(`/departments/${dept.id}`, { name, description });
                Swal.fire('¡Actualizado!', 'Los datos han sido guardados.', 'success');
                fetchDepartments();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'Error al actualizar', 'error');
            }
        }
    };

    // --- ELIMINAR DEPARTAMENTO ---
    const handleDelete = (id: number) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto. Si hay empleados asignados, fallará.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/departments/${id}`);
                    Swal.fire('¡Eliminado!', 'El departamento ha sido borrado.', 'success');
                    fetchDepartments();
                } catch (error: any) {
                    // Aquí mostramos el mensaje de error del backend (ej: "Tiene empleados asignados")
                    Swal.fire('No se pudo eliminar', error.response?.data?.message || 'Error desconocido', 'error');
                }
            }
        });
    };

    if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;

    return (
        <div>
            {/* Encabezado y Botón Agregar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaBuilding className="text-purple-600" /> Gestión de Departamentos
                    </h1>
                    <p className="text-gray-500 text-sm">Administra las áreas de la empresa</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2 transition-transform hover:scale-105 font-medium"
                >
                    <FaPlus /> Nuevo Departamento
                </button>
            </div>

            {/* Tabla de Datos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 border-b">ID</th>
                            <th className="px-6 py-4 border-b">Nombre</th>
                            <th className="px-6 py-4 border-b">Descripción</th>
                            <th className="px-6 py-4 border-b text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {departments.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-400">
                                    No hay departamentos registrados.
                                </td>
                            </tr>
                        ) : (
                            departments.map((dept) => (
                                <tr key={dept.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 text-gray-500">#{dept.id}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">{dept.name}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{dept.description || '-'}</td>
                                    <td className="px-6 py-4 flex justify-center gap-3">
                                        <button
                                            onClick={() => handleEdit(dept)}
                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-2 rounded-full transition"
                                            title="Editar"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition"
                                            title="Eliminar"
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

export default Departments;