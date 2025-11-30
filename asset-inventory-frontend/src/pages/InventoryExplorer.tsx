import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Department } from '../types';
import { FaBuilding, FaArrowRight, FaSearchLocation } from 'react-icons/fa';

const InventoryExplorer = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/departments').then(res => setDepartments(res.data));
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <FaSearchLocation className="text-blue-600" /> Explorador Visual
                </h1>
                <p className="text-gray-500">Navega por las tarjetas para ver el inventario</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                    <div
                        key={dept.id}
                        onClick={() => navigate(`/explorer/${dept.id}`)} // <--- OJO A LA RUTA
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FaBuilding className="text-9xl transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl">
                                <FaBuilding />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">{dept.name}</h3>
                        <p className="text-gray-500 text-sm mb-6 h-10 overflow-hidden relative z-10">
                            {dept.description || 'Sin descripción'}
                        </p>
                        <div className="flex items-center text-blue-600 font-medium text-sm group-hover:underline relative z-10">
                            Ver Categorías <FaArrowRight className="ml-2 text-xs" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default InventoryExplorer;