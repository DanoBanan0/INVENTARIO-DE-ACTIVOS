import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Employee, Department } from '../types';
import { useAuth } from '../context/AuthContext'; // <--- Import Auth
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaSpinner, FaCircle } from 'react-icons/fa';

const Employees = () => {
    const { user } = useAuth(); // <--- User
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    // Carga robusta por separado
    const fetchData = async () => {
        setLoading(true);
        // 1. Cargar Empleados
        try {
            const empRes = await api.get('/employees');
            setEmployees(empRes.data);
        } catch (error) { console.error('Error empleados:', error); }

        // 2. Cargar Departamentos
        try {
            const deptRes = await api.get('/departments');
            setDepartments(deptRes.data);
        } catch (error) { console.error('Error departamentos:', error); }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getDepartmentsOptions = (selectedId?: number) => {
        if (departments.length === 0) return '<option value="" disabled>No hay departamentos</option>';
        return departments.map(dept =>
            `<option value="${dept.id}" ${dept.id === selectedId ? 'selected' : ''}>${dept.name}</option>`
        ).join('');
    };

    // --- CREAR ---
    const handleCreate = async () => {
        if (departments.length === 0) return Swal.fire('Aviso', 'No hay departamentos creados.', 'warning');

        const { value: formValues } = await Swal.fire({
            title: 'Nuevo Empleado',
            html:
                '<input id="swal-name" class="swal2-input" placeholder="Nombre">' +
                '<input id="swal-lastname" class="swal2-input" placeholder="Apellido">' +
                '<input id="swal-email" class="swal2-input" placeholder="Email">' +
                '<label class="block text-left text-sm text-gray-600 mt-4 ml-4">Departamento:</label>' +
                `<select id="swal-dept" class="swal2-select" style="width: 85%; margin-top:5px">${getDepartmentsOptions()}</select>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            preConfirm: () => {
                return {
                    first_name: (document.getElementById('swal-name') as HTMLInputElement).value,
                    last_name: (document.getElementById('swal-lastname') as HTMLInputElement).value,
                    email: (document.getElementById('swal-email') as HTMLInputElement).value,
                    department_id: (document.getElementById('swal-dept') as HTMLSelectElement).value,
                    status: 'activo'
                };
            }
        });

        if (formValues) {
            try {
                await api.post('/employees', formValues);
                Swal.fire('¡Registrado!', 'Empleado creado.', 'success');
                fetchData();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
            }
        }
    };

    // --- EDITAR ---
    const handleEdit = async (emp: Employee) => {
        const { value: formValues } = await Swal.fire({
            title: 'Editar Empleado',
            html:
                `<input id="swal-name" class="swal2-input" value="${emp.first_name}" placeholder="Nombre">` +
                `<input id="swal-lastname" class="swal2-input" value="${emp.last_name}" placeholder="Apellido">` +
                `<input id="swal-email" class="swal2-input" value="${emp.email || ''}" placeholder="Email">` +
                '<label class="block text-left text-sm text-gray-600 mt-4 ml-4">Departamento:</label>' +
                `<select id="swal-dept" class="swal2-select" style="width: 85%; margin-top:5px">${getDepartmentsOptions(emp.department_id)}</select>` +
                '<label class="block text-left text-sm text-gray-600 mt-2 ml-4">Estado:</label>' +
                `<select id="swal-status" class="swal2-select" style="width: 85%; margin-top:5px">
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
                Swal.fire('¡Actualizado!', 'Datos guardados.', 'success');
                fetchData();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'Error al actualizar', 'error');
            }
        }
    };

    // --- ELIMINAR ---
    const handleDelete = (id: number) => {
        Swal.fire({
            title: '¿Eliminar?',
            text: "No se puede si tiene activos asignados.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, borrar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/employees/${id}`);
                    Swal.fire('Eliminado', 'Empleado borrado.', 'success');
                    fetchData();
                } catch (error: any) {
                    Swal.fire('Error', error.response?.data?.message || 'Error desconocido', 'error');
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
                        <FaUsers className="text-green-600" /> Directorio de Empleados
                    </h1>
                    <p className="text-gray-500 text-sm">Gestiona el personal</p>
                </div>
                {/* SOLO ADMIN */}
                {user?.role === 'admin' && (
                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md flex items-center gap-2 font-medium"
                    >
                        <FaPlus /> Nuevo Empleado
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 border-b">Nombre</th>
                            <th className="px-6 py-4 border-b">Email</th>
                            <th className="px-6 py-4 border-b">Departamento</th>
                            <th className="px-6 py-4 border-b">Estado</th>
                            {user?.role === 'admin' && <th className="px-6 py-4 border-b text-center">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {employees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{emp.first_name} {emp.last_name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{emp.email || '-'}</td>
                                <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{emp.department?.name}</span></td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <FaCircle className={`text-[10px] ${emp.status === 'activo' ? 'text-green-500' : 'text-red-500'}`} />
                                        <span className="text-sm">{emp.status}</span>
                                    </div>
                                </td>
                                {/* SOLO ADMIN */}
                                {user?.role === 'admin' && (
                                    <td className="px-6 py-4 flex justify-center gap-3">
                                        <button onClick={() => handleEdit(emp)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"><FaEdit /></button>
                                        <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><FaTrash /></button>
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

export default Employees;