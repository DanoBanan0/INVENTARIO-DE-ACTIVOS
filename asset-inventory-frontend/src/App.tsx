// ... imports
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Departments from './pages/Departments'; // <--- Nuevo Import
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Categories from './pages/Categories';
import Assets from './pages/Assets';
import AuditLogs from './pages/AuditLogs';
import InventoryExplorer from './pages/InventoryExplorer';
import DepartmentDrilldown from './pages/drilldown/DepartmentDrilldown';
import AssetDrilldown from './pages/drilldown/AssetDrilldown';
import Users from './pages/Users';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Rutas de Administración */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/users" element={<Users />} />
              <Route path="/audit-logs" element={<AuditLogs />} />

              {/* Rutas Visuales */}
              <Route path="/explorer" element={<InventoryExplorer />} />
              <Route path="/explorer/:deptId" element={<DepartmentDrilldown />} />
              <Route path="/explorer/:deptId/category/:catId" element={<AssetDrilldown />} />

            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
export default App;