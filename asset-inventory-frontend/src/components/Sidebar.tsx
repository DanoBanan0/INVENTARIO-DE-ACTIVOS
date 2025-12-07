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
    FaSearchLocation,
    FaUserShield
} from 'react-icons/fa';

const Sidebar = () => {
    const { logout, user } = useAuth();

    const allMenuItems = [
        {
            path: '/dashboard',
            name: 'Inicio',
            icon: <FaHome />,
            allowedRoles: ['admin', 'jefe', 'auditor']
        },
        {
            path: '/explorer',
            name: 'Explorar',
            icon: <FaSearchLocation />,
            allowedRoles: ['admin', 'jefe', 'auditor']
        },
        {
            path: '/departments',
            name: 'Departamentos',
            icon: <FaBuilding />,
            allowedRoles: ['admin']
        },
        {
            path: '/employees',
            name: 'Empleados',
            icon: <FaUsers />,
            allowedRoles: ['admin']
        },
        {
            path: '/assets',
            name: 'Activos',
            icon: <FaLaptop />,
            allowedRoles: ['admin']
        },
        {
            path: '/categories',
            name: 'Categorías',
            icon: <FaTags />,
            allowedRoles: ['admin']
        },
        {
            path: '/users',
            name: 'Usuarios',
            icon: <FaUserShield />,
            allowedRoles: ['admin']
        },
        {
            path: '/audit-logs',
            name: 'Auditoría',
            icon: <FaHistory />,
            allowedRoles: ['admin', 'auditor']
        },
    ];

    const visibleMenuItems = allMenuItems.filter(item =>
        item.allowedRoles.includes(user?.role || '')
    );

    return (
        <div className="w-64 bg-slate-900 text-white h-screen flex flex-col shadow-xl fixed left-0 top-0">
            <div className="p-6 border-b border-slate-700 flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-wide">Inventario</h1>
            </div>

            <div className="p-4 bg-slate-800/50 mb-2">
                <p className="text-sm text-gray-400">Bienvenido,</p>
                <p className="font-semibold truncate">{user?.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                        user?.role === 'auditor' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-600/20 text-blue-400'
                    }`}>
                    {user?.role}
                </span>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {visibleMenuItems.map((item) => (
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
            </nav>

            <div className="p-4 border-t border-slate-700">
                <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors">
                    <FaSignOutAlt /> <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};
export default Sidebar;