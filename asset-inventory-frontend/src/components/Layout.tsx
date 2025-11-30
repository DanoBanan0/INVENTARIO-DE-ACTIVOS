// src/components/Layout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Menú Lateral Fijo */}
            <Sidebar />

            {/* Contenido Principal (Se mueve a la derecha para no quedar debajo del menú) */}
            <div className="flex-1 ml-64 p-8 overflow-x-hidden">
                <div className="max-w-7xl mx-auto">
                    {/* Aquí se renderizarán las páginas (Dashboard, Assets, etc.) */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;