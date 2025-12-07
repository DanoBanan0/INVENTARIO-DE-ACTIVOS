import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import type { Category, Department } from '../../types';
import { FaLaptop, FaArrowLeft, FaBoxOpen } from 'react-icons/fa';

const DepartmentDrilldown = () => {
    const { deptId } = useParams();
    const navigate = useNavigate();
    
    const [department, setDepartment] = useState<Department | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const deptRes = await api.get(`/departments/${deptId}`);
                setDepartment(deptRes.data);

                const catRes = await api.get('/categories');
                setCategories(catRes.data);
            } catch (error) {
                console.error(error);
            }
        };
        loadData();
    }, [deptId]);

    const handleCategoryClick = (catId: number) => {
        navigate(`/explorer/${deptId}/category/${catId}`); 
    };

    return (
        <div>
            <button onClick={() => navigate('/explorer')} className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
                <FaArrowLeft className="mr-2" /> Volver a Departamentos
            </button>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Inventario de <span className="text-blue-600">{department?.name}</span>
            </h1>
            <p className="text-gray-500 mb-8">Selecciona qué tipo de activo deseas ver</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                    <div 
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-400 cursor-pointer transition-all text-center group"
                    >
                        <div className="w-16 h-16 bg-gray-50 group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl transition-colors">
                            <FaLaptop />
                        </div>
                        <h3 className="font-bold text-gray-700 group-hover:text-blue-700">{cat.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DepartmentDrilldown;