import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import type { Asset, Category, Department } from '../../types';
import { FaArrowLeft, FaBoxOpen } from 'react-icons/fa';

const AssetDrilldown = () => {
    const { deptId, catId } = useParams();
    const navigate = useNavigate();

    const [assets, setAssets] = useState<Asset[]>([]);
    const [info, setInfo] = useState<{dept?: Department, cat?: Category}>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAssets = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/assets?department_id=${deptId}&category_id=${catId}`);
                setAssets(response.data);

                const deptRes = await api.get(`/departments/${deptId}`);
                const catRes = await api.get(`/categories/${catId}`);
                setInfo({ dept: deptRes.data, cat: catRes.data });

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadAssets();
    }, [deptId, catId]);

    return (
        <div>
            <button onClick={() => navigate(`/explorer/${deptId}`)} className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
                <FaArrowLeft className="mr-2" /> Volver a Categorías
            </button>

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {info.cat?.name} en {info.dept?.name}
                    </h1>
                    <p className="text-gray-500">Listado de asignaciones y detalles</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold">
                    Total: {assets.length}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-3">Código</th>
                            <th className="px-6 py-3">Marca / Modelo</th>
                            <th className="px-6 py-3">Asignado A</th>
                            <th className="px-6 py-3">Especificaciones</th>
                            <th className="px-6 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {assets.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <FaBoxOpen className="text-4xl mb-2 opacity-30" />
                                        No se encontraron activos de este tipo en este departamento.
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            assets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-blue-600">{asset.inventory_code}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800">{asset.brand}</div>
                                        <div className="text-xs text-gray-500">{asset.model}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800">
                                            {asset.employee?.first_name} {asset.employee?.last_name}
                                        </div>
                                        <div className="text-xs text-gray-400">{asset.employee?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-600">
                                        {/* Renderizado rápido de specs */}
                                        {asset.specifications && Object.entries(asset.specifications).map(([key, val]) => (
                                            <div key={key}><span className="font-semibold">{key}:</span> {val}</div>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            asset.status === 'operativo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {asset.status}
                                        </span>
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

export default AssetDrilldown;