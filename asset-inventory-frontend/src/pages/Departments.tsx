import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Department } from '../types';
import { useAuth } from '../context/AuthContext'; // <--- Importamos Auth
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaSpinner } from 'react-icons/fa';

const Departments = () => {
    const { user } = useAuth(); // <--- Obtenemos el usuario actual
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // --- CREAR ---
    const handleCreate = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Nuevo Departamento',
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Nombre">' +
                '<input id="swal-input2" class="swal2-input" placeholder="Descripción">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            preConfirm: () => {
                return [
                    (document.getElementById('swal-input1') as HTMLInputElement).value,
                    (document.getElementById('swal-input2') as HTMLInputElement).value
                ];
            }
        });

        if (formValues) {
            try {
                await api.post('/departments', { name: formValues[0], description: formValues[1] });
                Swal.fire('¡Creado!', 'Departamento registrado.', 'success');
                fetchDepartments();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
            }
        }
    };

    // --- EDITAR ---
    const handleEdit = async (dept: Department) => {
        const { value: formValues } = await Swal.fire({
            title: 'Editar Departamento',
            html:
                `<input id="swal-input1" class="swal2-input" value="${dept.name}" placeholder="Nombre">` +
                `<input id="swal-input2" class="swal2-input" value="${dept.description || ''}" placeholder="Descripción">`,
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
            try {
                await api.put(`/departments/${dept.id}`, { name: formValues[0], description: formValues[1] });
                Swal.fire('¡Actualizado!', 'Datos guardados.', 'success');
                fetchDepartments();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'Error al actualizar', 'error');
            }
        }
    };

    // --- ELIMINAR ---
    const handleDelete = (id: number) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No se podrá eliminar si tiene empleados asignados.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/departments/${id}`);
                    Swal.fire('Eliminado', 'El departamento ha sido borrado.', 'success');
                    fetchDepartments();
                } catch (error: any) {
                    Swal.fire('Error', error.response?.data?.message || 'No se pudo eliminar', 'error');
                }
            }
        });
    };

    if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaBuilding className="text-purple-600" /> Gestión de Departamentos
                    </h1>
                    <p className="text-gray-500 text-sm">Administración de áreas</p>
                </div>

                {/* SOLO ADMIN PUEDE VER EL BOTÓN CREAR */}
                {user?.role === 'admin' && (
                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md flex items-center gap-2 font-medium"
                    >
                        <FaPlus /> Nuevo Departamento
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 border-b">ID</th>
                            <th className="px-6 py-4 border-b">Nombre</th>
                            <th className="px-6 py-4 border-b">Descripción</th>
                            {/* Solo mostramos columna Acciones si es Admin */}
                            {user?.role === 'admin' && <th className="px-6 py-4 border-b text-center">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {departments.map((dept) => (
                            <tr key={dept.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-500">#{dept.id}</td>
                                <td className="px-6 py-4 font-semibold text-gray-800">{dept.name}</td>
                                <td className="px-6 py-4 text-gray-500">{dept.description || '-'}</td>

                                {/* SOLO ADMIN PUEDE VER BOTONES DE ACCIÓN */}
                                {user?.role === 'admin' && (
                                    <td className="px-6 py-4 flex justify-center gap-3">
                                        <button onClick={() => handleEdit(dept)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"><FaEdit /></button>
                                        <button onClick={() => handleDelete(dept.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><FaTrash /></button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Departments;