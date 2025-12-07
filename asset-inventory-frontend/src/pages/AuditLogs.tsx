import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaHistory, FaUserClock, FaSpinner, FaSearch } from 'react-icons/fa';

interface AuditLog {
    id: number;
    user: { name: string; email: string; role: string } | null;
    action: string;
    table_name: string;
    description: string;
    ip_address: string;
    created_at: string;
}

const AuditLogs = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchLogs = async () => {
        try {
            const response = await api.get('/audit-logs');
            setLogs(response.data);
        } catch (error) {
            console.error('Error cargando logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.user?.name.toLowerCase().includes(filter.toLowerCase()) ||
        log.description.toLowerCase().includes(filter.toLowerCase())
    );

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'CREATE': return <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold border border-green-200">CREACIÓN</span>;
            case 'UPDATE': return <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">EDICIÓN</span>;
            case 'DELETE': return <span className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold border border-red-200">ELIMINACIÓN</span>;
            default: return <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-bold">{action}</span>;
        }
    };

    if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaHistory className="text-amber-600" /> Auditoría del Sistema
                    </h1>
                    <p className="text-gray-500 text-sm">Registro detallado de movimientos y seguridad</p>
                </div>

                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar movimiento..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 border-b">Fecha / Hora</th>
                            <th className="px-6 py-4 border-b">Usuario Responsable</th>
                            <th className="px-6 py-4 border-b">Acción</th>
                            <th className="px-6 py-4 border-b">Detalle del Cambio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-400">
                                    No hay registros de auditoría recientes.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                                <FaUserClock />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{log.user?.name || 'Desconocido'}</p>
                                                <p className="text-xs text-gray-500">{log.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getActionBadge(log.action)}
                                        <div className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">
                                            Tabla: {log.table_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">
                                        {log.description}
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

export default AuditLogs;