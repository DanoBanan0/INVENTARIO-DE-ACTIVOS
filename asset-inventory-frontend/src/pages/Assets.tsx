import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Asset, Category, Employee } from '../types';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { FaLaptop, FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner, FaBoxOpen } from 'react-icons/fa';

const Assets = () => {
    const { user } = useAuth();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async (search = '') => {
        try {
            const url = search ? `/assets?search=${search}` : '/assets';
            const [assetsRes, catRes, empRes] = await Promise.all([
                api.get(url),
                api.get('/categories'),
                api.get('/employees')
            ]);

            setAssets(assetsRes.data);
            if (!search) {
                setCategories(catRes.data);
                setEmployees(empRes.data);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setTimeout(() => fetchData(e.target.value), 500);
    };

    const getCategoryOptions = (sel?: number) => categories.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.name}</option>`).join('');
    const getEmployeeOptions = (sel?: number) => employees.map(e => `<option value="${e.id}" ${e.id === sel ? 'selected' : ''}>${e.first_name} ${e.last_name} (${e.department?.name})</option>`).join('');

    const handleOpenForm = async (asset?: Asset) => {
        const isEdit = !!asset;
        const defaults = asset || {
            inventory_code: '', brand: '', model: '', serial_number: '', status: 'operativo', comments: '',
            specifications: { sistema_operativo: '', ram: '', almacenamiento: '' }
        };

        const { value: formValues } = await Swal.fire({
            title: isEdit ? 'Editar Activo' : 'Nuevo Activo',
            width: '700px',
            html: `
                <div class="grid grid-cols-2 gap-4 text-left">
                    <div class="space-y-3">
                        <label class="font-bold text-sm text-blue-600">Datos Generales</label>
                        <input id="swal-code" class="swal2-input m-0 w-full" placeholder="Código" value="${defaults.inventory_code}">
                        <input id="swal-brand" class="swal2-input m-0 w-full" placeholder="Marca" value="${defaults.brand}">
                        <input id="swal-model" class="swal2-input m-0 w-full" placeholder="Modelo" value="${defaults.model}">
                        <input id="swal-serial" class="swal2-input m-0 w-full" placeholder="Serie" value="${defaults.serial_number || ''}">
                    </div>
                    <div class="space-y-3">
                        <label class="font-bold text-sm text-blue-600">Asignación</label>
                        <select id="swal-cat" class="swal2-select m-0 w-full text-base"><option value="" disabled ${!isEdit ? 'selected' : ''}>Categoría</option>${getCategoryOptions(asset?.category_id)}</select>
                        <select id="swal-emp" class="swal2-select m-0 w-full text-base"><option value="" disabled ${!isEdit ? 'selected' : ''}>Empleado</option>${getEmployeeOptions(asset?.employee_id)}</select>
                        <select id="swal-status" class="swal2-select m-0 w-full text-base">
                            <option value="operativo" ${defaults.status === 'operativo' ? 'selected' : ''}>🟢 Operativo</option>
                            <option value="en_reparacion" ${defaults.status === 'en_reparacion' ? 'selected' : ''}>🟡 En Reparación</option>
                            <option value="obsoleto" ${defaults.status === 'obsoleto' ? 'selected' : ''}>🟠 Obsoleto</option>
                            <option value="baja" ${defaults.status === 'baja' ? 'selected' : ''}>🔴 De Baja</option>
                        </select>
                    </div>
                </div>
                <div class="mt-6 border-t pt-4 text-left">
                    <label class="font-bold text-sm text-purple-600 mb-2 block">Specs (Opcional)</label>
                    <div class="grid grid-cols-3 gap-2">
                        <input id="swal-os" class="swal2-input m-0 text-sm" placeholder="OS" value="${defaults.specifications?.sistema_operativo || ''}">
                        <input id="swal-ram" class="swal2-input m-0 text-sm" placeholder="RAM" value="${defaults.specifications?.ram || ''}">
                        <input id="swal-storage" class="swal2-input m-0 text-sm" placeholder="Disco" value="${defaults.specifications?.almacenamiento || ''}">
                    </div>
                </div>
                <div class="mt-4"><textarea id="swal-comments" class="swal2-textarea m-0 w-full h-20" placeholder="Comentarios...">${defaults.comments || ''}</textarea></div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            preConfirm: () => {
                return {
                    inventory_code: (document.getElementById('swal-code') as HTMLInputElement).value,
                    brand: (document.getElementById('swal-brand') as HTMLInputElement).value,
                    model: (document.getElementById('swal-model') as HTMLInputElement).value,
                    serial_number: (document.getElementById('swal-serial') as HTMLInputElement).value,
                    category_id: (document.getElementById('swal-cat') as HTMLSelectElement).value,
                    employee_id: (document.getElementById('swal-emp') as HTMLSelectElement).value,
                    status: (document.getElementById('swal-status') as HTMLSelectElement).value,
                    comments: (document.getElementById('swal-comments') as HTMLTextAreaElement).value,
                    specifications: {
                        sistema_operativo: (document.getElementById('swal-os') as HTMLInputElement).value,
                        ram: (document.getElementById('swal-ram') as HTMLInputElement).value,
                        almacenamiento: (document.getElementById('swal-storage') as HTMLInputElement).value,
                    }
                };
            }
        });

        if (formValues) {
            try {
                if (isEdit) await api.put(`/assets/${asset.id}`, formValues);
                else await api.post('/assets', formValues);
                Swal.fire('¡Éxito!', 'Guardado.', 'success');
                fetchData(searchTerm);
            } catch (error: any) { Swal.fire('Error', error.response?.data?.message || 'Error', 'error'); }
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({ title: '¿Dar de baja?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí' })
            .then(async (result) => {
                if (result.isConfirmed) {
                    try { await api.delete(`/assets/${id}`); Swal.fire('Baja Exitosa', '', 'success'); fetchData(searchTerm); }
                    catch (e) { Swal.fire('Error', '', 'error'); }
                }
            });
    };

    if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;

    return (
        <div>
            <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FaLaptop className="text-blue-600" /> Inventario</h1>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative w-full lg:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400" /></div>
                        <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={handleSearch} />
                    </div>
                    {user?.role === 'admin' && (
                        <button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md flex items-center gap-2 font-medium whitespace-nowrap">
                            <FaPlus /> Agregar Activo
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-4 py-3 border-b">Código</th>
                            <th className="px-4 py-3 border-b">Detalle</th>
                            <th className="px-4 py-3 border-b">Specs</th>
                            <th className="px-4 py-3 border-b">Asignado</th>
                            <th className="px-4 py-3 border-b">Estado</th>
                            {user?.role === 'admin' && <th className="px-4 py-3 border-b text-center">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {assets.map((asset) => (
                            <tr key={asset.id} className="hover:bg-blue-50/30">
                                <td className="px-4 py-3 font-bold text-blue-600">{asset.inventory_code}</td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold">{asset.brand} {asset.model}</div>
                                    <div className="text-xs text-gray-500">{asset.category?.name}</div>
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-xs">
                                    {asset.specifications && Object.values(asset.specifications).some(x => x) ? (
                                        <ul className="list-disc list-inside">
                                            {Object.entries(asset.specifications).map(([k, v]) => v && <li key={k}>{k}: {v}</li>)}
                                        </ul>
                                    ) : '-'}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium">{asset.employee?.first_name} {asset.employee?.last_name}</div>
                                    <div className="text-xs text-gray-500">{asset.employee?.department?.name}</div>
                                </td>
                                <td className="px-4 py-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{asset.status}</span></td>
                                {user?.role === 'admin' && (
                                    <td className="px-4 py-3 flex justify-center gap-2">
                                        <button onClick={() => handleOpenForm(asset)} className="text-blue-500 hover:bg-blue-100 p-1.5 rounded"><FaEdit /></button>
                                        <button onClick={() => handleDelete(asset.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded"><FaTrash /></button>
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

export default Assets;