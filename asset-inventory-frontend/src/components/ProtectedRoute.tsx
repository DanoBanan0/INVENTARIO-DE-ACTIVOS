import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    // 1. Si estamos verificando el token todavía, mostramos un cargando simple
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-xl font-semibold text-blue-600 animate-pulse">
                    Cargando sistema...
                </div>
            </div>
        );
    }

    // 2. Si terminó de cargar y NO está autenticado, lo mandamos al Login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 3. Si todo está bien, renderizamos el contenido protegido (El Dashboard, etc.)
    return <Outlet />;
};