// src/pages/Employees.tsx
import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Employee, Department } from '../types';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaSpinner, FaCircle } from 'react-icons/fa';

const Employees = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    // Reemplaza la función fetchData anterior con esta versión depurada:
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Intentamos cargar Departamentos
            try {
                const deptRes = await api.get('/departments');
                console.log("Departamentos recibidos:", deptRes.data); // <--- MIRA LA CONSOLA
                setDepartments(deptRes.data);
            } catch (err) {
                console.error("Error cargando departamentos:", err);
            }

            // 2. Intentamos cargar Empleados
            try {
                const empRes = await api.get('/employees');
                setEmployees(empRes.data);
            } catch (err) {
                console.error("Error cargando empleados:", err);
            }

        } catch (error) {
            console.error('Error general', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper para generar las opciones del HTML Select de Departamentos
    const getDepartmentsOptions = (selectedId?: number) => {
        if (departments.length === 0) return '<option value="" disabled>No hay departamentos creados</option>';

        return departments.map(dept =>
            `<option value="${dept.id}" ${dept.id === selectedId ? 'selected' : ''}>${dept.name}</option>`
        ).join('');
    };

    // --- CREAR EMPLEADO ---
    const handleCreate = async () => {
        // Validamos que haya departamentos antes de abrir el formulario
        if (departments.length === 0) {
            return Swal.fire('Alto', 'Primero debes crear departamentos para asignar empleados.', 'warning');
        }

        const { value: formValues } = await Swal.fire({
            title: 'Nuevo Empleado',
            html:
                '<input id="swal-name" class="swal2-input" placeholder="Nombre">' +
                '<input id="swal-lastname" class="swal2-input" placeholder="Apellido">' +
                '<input id="swal-email" class="swal2-input" placeholder="Email Corporativo">' +
                '<label class="block text-left text-sm text-gray-600 mt-4 ml-4">Departamento:</label>' +
                `<select id="swal-dept" class="swal2-select" style="width: 85%; margin-top: 5px;">
                    ${getDepartmentsOptions()}
                </select>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            preConfirm: () => {
                return {
                    first_name: (document.getElementById('swal-name') as HTMLInputElement).value,
                    last_name: (document.getElementById('swal-lastname') as HTMLInputElement).value,
                    email: (document.getElementById('swal-email') as HTMLInputElement).value,
                    department_id: (document.getElementById('swal-dept') as HTMLSelectElement).value,
                    status: 'activo' // Por defecto al crear
                };
            }
        });

        if (formValues) {
            if (!formValues.first_name || !formValues.last_name || !formValues.department_id) {
                return Swal.fire('Error', 'Nombre, Apellido y Departamento son obligatorios', 'error');
            }

            try {
                await api.post('/employees', formValues);
                Swal.fire('¡Registrado!', 'El empleado ha sido creado.', 'success');
                fetchData();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
            }
        }
    };

    // --- EDITAR EMPLEADO ---
    const handleEdit = async (emp: Employee) => {
        const { value: formValues } = await Swal.fire({
            title: 'Editar Empleado',
            html:
                `<input id="swal-name" class="swal2-input" placeholder="Nombre" value="${emp.first_name}">` +
                `<input id="swal-lastname" class="swal2-input" placeholder="Apellido" value="${emp.last_name}">` +
                `<input id="swal-email" class="swal2-input" placeholder="Email" value="${emp.email || ''}">` +
                '<label class="block text-left text-sm text-gray-600 mt-4 ml-4">Departamento:</label>' +
                `<select id="swal-dept" class="swal2-select" style="width: 85%; margin-top: 5px;">
                    ${getDepartmentsOptions(emp.department_id)}
                </select>` +
                '<label class="block text-left text-sm text-gray-600 mt-2 ml-4">Estado:</label>' +
                `<select id="swal-status" class="swal2-select" style="width: 85%; margin-top: 5px;">
                    <option value="activo" ${emp.status === 'activo' ? 'selected' : ''}>Activo</option>
                    <option value="inactivo" ${emp.status === 'inactivo' ? 'selected' : ''}>Inactivo</option>
                </select>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            preConfirm: () => {
                return {
                    first_name: (document.getElementById('swal-name') as HTMLInputElement).value,
                    last_name: (document.getElementById('swal-lastname') as HTMLInputElement).value,
                    email: (document.getElementById('swal-email') as HTMLInputElement).value,
                    department_id: (document.getElementById('swal-dept') as HTMLSelectElement).value,
                    status: (document.getElementById('swal-status') as HTMLSelectElement).value
                };
            }
        });

        if (formValues) {
            try {
                await api.put(`/employees/${emp.id}`, formValues);
                Swal.fire('¡Actualizado!', 'Datos modificados correctamente.', 'success');
                fetchData();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'Error al actualizar', 'error');
            }
        }
    };

    // --- ELIMINAR EMPLEADO ---
    const handleDelete = (id: number) => {
        Swal.fire({
            title: '¿Eliminar empleado?',
            text: "Si tiene activos asignados, no se podrá eliminar.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, borrar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/employees/${id}`);
                    Swal.fire('Eliminado', 'El empleado ha sido borrado.', 'success');
                    fetchData();
                } catch (error: any) {
                    Swal.fire('No se pudo eliminar', error.response?.data?.message || 'Error desconocido', 'error');
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
                        <FaUsers className="text-green-600" /> Directorio de Empleados
                    </h1>
                    <p className="text-gray-500 text-sm">Gestiona el personal y sus asignaciones</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2 transition-transform hover:scale-105 font-medium"
                >
                    <FaPlus /> Nuevo Empleado
                </button>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 border-b">Nombre Completo</th>
                            <th className="px-6 py-4 border-b">Email</th>
                            <th className="px-6 py-4 border-b">Departamento</th>
                            <th className="px-6 py-4 border-b">Estado</th>
                            <th className="px-6 py-4 border-b text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-400">
                                    No hay empleados registrados.
                                </td>
                            </tr>
                        ) : (
                            employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {emp.first_name} {emp.last_name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{emp.email || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                                            {emp.department?.name || 'Sin Depto'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <FaCircle className={`text-[10px] ${emp.status === 'activo' ? 'text-green-500' : 'text-red-500'}`} />
                                            <span className={`text-sm ${emp.status === 'activo' ? 'text-green-700' : 'text-red-700'}`}>
                                                {emp.status === 'activo' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center gap-3">
                                        <button
                                            onClick={() => handleEdit(emp)}
                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-2 rounded-full transition"
                                            title="Editar"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(emp.id)}
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

export default Employees;