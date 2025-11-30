// src/pages/Assets.tsx
import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Asset, Category, Employee } from '../types';
import Swal from 'sweetalert2';
import { FaLaptop, FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner, FaBoxOpen } from 'react-icons/fa';

const Assets = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Cargar datos iniciales
    const fetchData = async (search = '') => {
        try {
            // Si hay búsqueda, usamos el endpoint con query param
            const url = search ? `/assets?search=${search}` : '/assets';

            const [assetsRes, catRes, empRes] = await Promise.all([
                api.get(url),
                api.get('/categories'),
                api.get('/employees')
            ]);

            setAssets(assetsRes.data);
            if (!search) { // Solo recargamos listas auxiliares si no es una búsqueda
                setCategories(catRes.data);
                setEmployees(empRes.data);
            }
        } catch (error) {
            console.error('Error cargando inventario', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Manejar búsqueda con "Debounce" (esperar a que deje de escribir)
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        // Pequeño delay para no saturar el servidor
        setTimeout(() => {
            fetchData(e.target.value);
        }, 500);
    };

    // Helpers para generar opciones de Select
    const getCategoryOptions = (selectedId?: number) => {
        return categories.map(c =>
            `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.name}</option>`
        ).join('');
    };

    const getEmployeeOptions = (selectedId?: number) => {
        return employees.map(e =>
            `<option value="${e.id}" ${e.id === selectedId ? 'selected' : ''}>${e.first_name} ${e.last_name} (${e.department?.name})</option>`
        ).join('');
    };

    // --- CREAR / EDITAR ACTIVO ---
    const handleOpenForm = async (asset?: Asset) => {
        const isEdit = !!asset;
        const defaults = asset || {
            inventory_code: '', brand: '', model: '', serial_number: '', status: 'operativo', comments: '',
            specifications: { sistema_operativo: '', ram: '', almacenamiento: '' } // Valores por defecto del JSON
        };

        const { value: formValues } = await Swal.fire({
            title: isEdit ? `Editar ${asset.inventory_code}` : 'Nuevo Activo',
            width: '700px', // Hacemos el modal más ancho
            html: `
                <div class="grid grid-cols-2 gap-4 text-left">
                    <div class="space-y-3">
                        <label class="font-bold text-sm text-blue-600">Datos Generales</label>
                        <input id="swal-code" class="swal2-input m-0 w-full" placeholder="Código Inventario (C-001)" value="${defaults.inventory_code}">
                        <input id="swal-brand" class="swal2-input m-0 w-full" placeholder="Marca (Dell, HP)" value="${defaults.brand}">
                        <input id="swal-model" class="swal2-input m-0 w-full" placeholder="Modelo" value="${defaults.model}">
                        <input id="swal-serial" class="swal2-input m-0 w-full" placeholder="N° Serie" value="${defaults.serial_number || ''}">
                    </div>

                    <div class="space-y-3">
                        <label class="font-bold text-sm text-blue-600">Asignación</label>
                        <select id="swal-cat" class="swal2-select m-0 w-full text-base">
                             <option value="" disabled ${!isEdit ? 'selected' : ''}>Selecciona Categoría</option>
                             ${getCategoryOptions(asset?.category_id)}
                        </select>
                        <select id="swal-emp" class="swal2-select m-0 w-full text-base">
                             <option value="" disabled ${!isEdit ? 'selected' : ''}>Asignar a Empleado</option>
                             ${getEmployeeOptions(asset?.employee_id)}
                        </select>
                        <select id="swal-status" class="swal2-select m-0 w-full text-base">
                            <option value="operativo" ${defaults.status === 'operativo' ? 'selected' : ''}>🟢 Operativo</option>
                            <option value="en_reparacion" ${defaults.status === 'en_reparacion' ? 'selected' : ''}>🟡 En Reparación</option>
                            <option value="disponible" ${defaults.status === 'disponible' ? 'selected' : ''}>🔵 Disponible</option>
                            <option value="obsoleto" ${defaults.status === 'obsoleto' ? 'selected' : ''}>🟠 Obsoleto</option>
                            <option value="baja" ${defaults.status === 'baja' ? 'selected' : ''}>🔴 De Baja</option>
                        </select>
                    </div>
                </div>

                <div class="mt-6 border-t pt-4 text-left">
                    <label class="font-bold text-sm text-purple-600 mb-2 block">Especificaciones Técnicas (Opcional)</label>
                    <div class="grid grid-cols-3 gap-2">
                        <input id="swal-os" class="swal2-input m-0 text-sm" placeholder="Sist. Operativo" value="${defaults.specifications?.sistema_operativo || ''}">
                        <input id="swal-ram" class="swal2-input m-0 text-sm" placeholder="RAM" value="${defaults.specifications?.ram || ''}">
                        <input id="swal-storage" class="swal2-input m-0 text-sm" placeholder="Almacenamiento" value="${defaults.specifications?.almacenamiento || ''}">
                    </div>
                </div>

                <div class="mt-4">
                    <textarea id="swal-comments" class="swal2-textarea m-0 w-full h-20" placeholder="Comentarios adicionales...">${defaults.comments || ''}</textarea>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar Activo',
            preConfirm: () => {
                // Recolectar datos
                return {
                    inventory_code: (document.getElementById('swal-code') as HTMLInputElement).value,
                    brand: (document.getElementById('swal-brand') as HTMLInputElement).value,
                    model: (document.getElementById('swal-model') as HTMLInputElement).value,
                    serial_number: (document.getElementById('swal-serial') as HTMLInputElement).value,
                    category_id: (document.getElementById('swal-cat') as HTMLSelectElement).value,
                    employee_id: (document.getElementById('swal-emp') as HTMLSelectElement).value,
                    status: (document.getElementById('swal-status') as HTMLSelectElement).value,
                    comments: (document.getElementById('swal-comments') as HTMLTextAreaElement).value,
                    // Aquí construimos el objeto JSON
                    specifications: {
                        sistema_operativo: (document.getElementById('swal-os') as HTMLInputElement).value,
                        ram: (document.getElementById('swal-ram') as HTMLInputElement).value,
                        almacenamiento: (document.getElementById('swal-storage') as HTMLInputElement).value,
                    }
                };
            }
        });

        if (formValues) {
            // Validación básica
            if (!formValues.inventory_code || !formValues.brand || !formValues.category_id || !formValues.employee_id) {
                return Swal.fire('Faltan Datos', 'Código, Marca, Categoría y Empleado son obligatorios', 'warning');
            }

            try {
                if (isEdit) {
                    await api.put(`/assets/${asset.id}`, formValues);
                } else {
                    await api.post('/assets', formValues);
                }
                Swal.fire('¡Éxito!', `Activo ${isEdit ? 'actualizado' : 'registrado'} correctamente.`, 'success');
                fetchData(searchTerm);
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'Error al procesar', 'error');
            }
        }
    };

    // --- ELIMINAR (DAR DE BAJA) ---
    const handleDelete = (id: number) => {
        Swal.fire({
            title: '¿Dar de baja?',
            text: "El activo pasará a historial pero no se borrará permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, dar de baja'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/assets/${id}`);
                    Swal.fire('Baja Exitosa', 'El activo ha sido desactivado.', 'success');
                    fetchData(searchTerm);
                } catch (error: any) {
                    Swal.fire('Error', 'No se pudo dar de baja', 'error');
                }
            }
        });
    };

    if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;

    return (
        <div>
            {/* Header y Buscador */}
            <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaLaptop className="text-blue-600" /> Inventario de Activos
                    </h1>
                    <p className="text-gray-500 text-sm">Gestiona el hardware y equipo asignado</p>
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    {/* Barra de Búsqueda */}
                    <div className="relative w-full lg:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar (Código, Marca, Persona)..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <button
                        onClick={() => handleOpenForm()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md flex items-center gap-2 font-medium whitespace-nowrap"
                    >
                        <FaPlus /> Agregar Activo
                    </button>
                </div>
            </div>

            {/* Tabla de Resultados */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-4 py-3 border-b">Código</th>
                            <th className="px-4 py-3 border-b">Detalle Equipo</th>
                            <th className="px-4 py-3 border-b">Especificaciones</th>
                            <th className="px-4 py-3 border-b">Asignado A</th>
                            <th className="px-4 py-3 border-b">Estado</th>
                            <th className="px-4 py-3 border-b text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {assets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-gray-400 flex flex-col items-center">
                                    <FaBoxOpen className="text-4xl mb-2 opacity-30" />
                                    No se encontraron activos.
                                </td>
                            </tr>
                        ) : (
                            assets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-4 py-3 font-bold text-blue-600">{asset.inventory_code}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-800">{asset.brand} {asset.model}</div>
                                        <div className="text-xs text-gray-500">{asset.category?.name}</div>
                                        {asset.serial_number && <div className="text-xs text-gray-400">SN: {asset.serial_number}</div>}
                                    </td>
                                    {/* Aquí mostramos el JSON bonito */}
                                    <td className="px-4 py-3 text-gray-600">
                                        {asset.specifications && Object.values(asset.specifications).some(x => x) ? (
                                            <ul className="list-disc list-inside text-xs">
                                                {asset.specifications.sistema_operativo && <li>OS: {asset.specifications.sistema_operativo}</li>}
                                                {asset.specifications.ram && <li>RAM: {asset.specifications.ram}</li>}
                                                {asset.specifications.almacenamiento && <li>Disco: {asset.specifications.almacenamiento}</li>}
                                            </ul>
                                        ) : <span className="text-xs text-gray-400">-</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-800">
                                            {asset.employee?.first_name} {asset.employee?.last_name}
                                        </div>
                                        <div className="text-xs text-gray-500">{asset.employee?.department?.name}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold
                                            ${asset.status === 'operativo' ? 'bg-green-100 text-green-700' :
                                                asset.status === 'en_reparacion' ? 'bg-yellow-100 text-yellow-700' :
                                                    asset.status === 'disponible' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-red-100 text-red-700'
                                            }`}>
                                            {asset.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 flex justify-center gap-2">
                                        <button onClick={() => handleOpenForm(asset)} className="text-blue-500 hover:bg-blue-100 p-1.5 rounded transition">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(asset.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded transition">
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

export default Assets;