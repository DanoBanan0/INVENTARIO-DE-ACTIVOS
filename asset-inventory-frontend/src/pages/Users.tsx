import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { User } from '../types';
import Swal from 'sweetalert2';
import { FaUserPlus, FaEdit, FaTrash, FaUserShield, FaSpinner, FaLock } from 'react-icons/fa';

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleCreate = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Nuevo Usuario',
            html:
                '<input id="swal-name" class="swal2-input" placeholder="Nombre Completo">' +
                '<input id="swal-email" class="swal2-input" placeholder="Correo Electrónico">' +
                '<input id="swal-pass" type="password" class="swal2-input" placeholder="Contraseña">' +
                '<select id="swal-role" class="swal2-select" style="width: 85%">' +
                '  <option value="jefe">Jefe de Área (Usuario)</option>' +
                '  <option value="auditor">Auditor (Solo Lectura)</option>' +
                '  <option value="admin">Administrador</option>' +
                '</select>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Crear',
            preConfirm: () => {
                return {
                    name: (document.getElementById('swal-name') as HTMLInputElement).value,
                    email: (document.getElementById('swal-email') as HTMLInputElement).value,
                    password: (document.getElementById('swal-pass') as HTMLInputElement).value,
                    role: (document.getElementById('swal-role') as HTMLSelectElement).value
                };
            }
        });

        if (formValues) {
            if (!formValues.name || !formValues.email || !formValues.password) return Swal.fire('Error', 'Todos los campos son obligatorios', 'error');

            try {
                await api.post('/users', formValues);
                Swal.fire('¡Creado!', 'El usuario ha sido registrado y puede iniciar sesión.', 'success');
                fetchUsers();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'Error al crear', 'error');
            }
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Eliminar usuario?',
            text: "Perderá el acceso al sistema inmediatamente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/users/${id}`);
                Swal.fire('Eliminado', 'El usuario ha sido borrado.', 'success');
                fetchUsers();
            } catch (error) { Swal.fire('Error', 'No se pudo eliminar', 'error'); }
        }
    };

    if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaUserShield className="text-indigo-600" /> Gestión de Usuarios
                    </h1>
                    <p className="text-gray-500 text-sm">Administra quién tiene acceso al sistema</p>
                </div>
                <button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2 font-medium">
                    <FaUserPlus /> Crear Usuario
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 border-b">Usuario</th>
                            <th className="px-6 py-4 border-b">Rol</th>
                            <th className="px-6 py-4 border-b">Estado</th>
                            <th className="px-6 py-4 border-b text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800">{u.name}</div>
                                    <div className="text-sm text-gray-500">{u.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                            u.role === 'auditor' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {u.is_active
                                        ? <span className="text-green-600 text-sm font-medium">Activo</span>
                                        : <span className="text-red-600 text-sm font-medium">Bloqueado</span>
                                    }
                                </td>
                                <td className="px-6 py-4 flex justify-center gap-3">
                                    <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:bg-red-100 p-2 rounded transition" title="Eliminar">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;