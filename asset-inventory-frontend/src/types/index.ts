// 1. Usuario (lo que devuelve el login)
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'jefe' | 'auditor';
    is_active: boolean;
}

// 2. Respuesta del Login (Token + Usuario)
export interface AuthResponse {
    message: string;
    user: User;
    authorization: {
        token: string;
        type: string;
        expires_in: number;
    };
}

// 3. Departamento
export interface Department {
    id: number;
    name: string;
    description?: string;
}

// 4. Empleado
export interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    department_id: number;
    department?: Department;
    status: 'activo' | 'inactivo';
}

// 5. Categoría
export interface Category {
    id: number;
    name: string;
}

// 6. Activo (El Inventario)
export interface Asset {
    id: number;
    inventory_code: string;
    category_id: number;
    category?: Category;
    employee_id: number;
    employee?: Employee;
    brand: string;
    model: string;
    serial_number?: string;
    status: 'operativo' | 'en_reparacion' | 'obsoleto' | 'baja' | 'disponible';
    specifications?: Record<string, any>;
    comments?: string;
    created_at?: string;
}

// 7. Estadísticas (Dashboard)
export interface DashboardSummary {
    total_assets: number;
    total_employees: number;
    total_departments: number;
    assets_by_status: {
        operativo: number;
        reparacion: number;
        disponible: number;
    };
    recent_assets: Asset[];
}