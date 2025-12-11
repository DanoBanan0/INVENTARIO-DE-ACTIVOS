import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { DashboardSummary } from '../types';
import { useAuth } from '../context/AuthContext';
import { FaLaptop, FaUsers, FaBuilding, FaSpinner } from 'react-icons/fa';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/dashboard/summary');
            setStats(response.data);
        } catch (error) {
            console.error("Error cargando dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-blue-600">
                <FaSpinner className="animate-spin text-4xl" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Panel Principal</h1>
                <p className="text-gray-500">Bienvenido de nuevo, <span className="font-semibold text-blue-600">{user?.name}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Empleados</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats?.total_employees || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl">
                        <FaUsers />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Departamentos</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats?.total_departments || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xl">
                        <FaBuilding />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Últimos Activos Registrados</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Equipo</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Fecha Ingreso</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats?.recent_assets.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                        No hay activos registrados aún.
                                    </td>
                                </tr>
                            ) : (
                                stats?.recent_assets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-blue-600">
                                            {asset.inventory_code}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-800 font-medium">{asset.brand} {asset.model}</span>
                                                <span className="text-xs text-gray-500">{asset.category?.name || 'Sin categoría'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                                ${asset.status === 'operativo' ? 'bg-green-100 text-green-700' :
                                                    asset.status === 'en_reparacion' ? 'bg-yellow-100 text-yellow-700' :
                                                        asset.status === 'disponible' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-red-100 text-red-700'
                                                }`}>
                                                {asset.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(asset.created_at!).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;