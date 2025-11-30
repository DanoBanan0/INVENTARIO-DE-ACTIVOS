// src/components/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaHome,
    FaBuilding,
    FaUsers,
    FaLaptop,
    FaTags,
    FaHistory,
    FaSignOutAlt,
    FaSearchLocation
} from 'react-icons/fa';

const Sidebar = () => {
    const { logout, user } = useAuth();

    // Definimos los links del menú
    const menuItems = [
        { path: '/dashboard', name: 'Inicio', icon: <FaHome /> },
        
        // La nueva pestaña visual
        { path: '/explorer', name: 'Explorar', icon: <FaSearchLocation /> }, 
        
        // Las pestañas de administración (Tablas)
        { path: '/departments', name: 'Departamentos', icon: <FaBuilding /> },
        { path: '/employees', name: 'Empleados', icon: <FaUsers /> },
        { path: '/assets', name: 'Inventario Activos', icon: <FaLaptop /> },
        { path: '/categories', name: 'Categorías', icon: <FaTags /> },
    ];

    return (
        <div className="w-64 bg-slate-900 text-white h-screen flex flex-col shadow-xl fixed left-0 top-0">
            {/* 1. Logo / Título */}
            <div className="p-6 border-b border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
                    K
                </div>
                <h1 className="text-xl font-bold tracking-wide">Kairos Inv</h1>
            </div>

            {/* 2. Información del Usuario (Pequeña tarjeta) */}
            <div className="p-4 bg-slate-800/50 mb-2">
                <p className="text-sm text-gray-400">Bienvenido,</p>
                <p className="font-semibold truncate">{user?.name}</p>
                <span className="text-xs px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded-full uppercase font-bold tracking-wider">
                    {user?.role}
                </span>
            </div>

            {/* 3. Menú de Navegación */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <span className="text-lg group-hover:scale-110 transition-transform">
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}

                {/* Link de Auditoría (Solo visible para Admin y Auditor) */}
                {['admin', 'auditor'].includes(user?.role || '') && (
                    <NavLink
                        to="/audit-logs"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mt-6 ${isActive
                                ? 'bg-amber-600/20 text-amber-500'
                                : 'text-gray-400 hover:bg-slate-800 hover:text-amber-500'
                            }`
                        }
                    >
                        <span className="text-lg"><FaHistory /></span>
                        <span className="font-medium">Auditoría</span>
                    </NavLink>
                )}
            </nav>

            {/* 4. Botón Cerrar Sesión (Abajo del todo) */}
            <div className="p-4 border-t border-slate-700">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                >
                    <FaSignOutAlt />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;