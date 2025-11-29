import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border-4 border-blue-500">

        <div className="flex justify-center mb-6">
          {/* Si React Icons funciona, verás este check */}
          <FaCheckCircle className="text-green-500 text-7xl" />
        </div>

        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
          ¡Prueba de Sistema!
        </h1>

        <div className="space-y-4 text-left bg-gray-50 p-4 rounded-lg">
          <p className="flex items-center text-gray-700 font-medium">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Si el fondo es gris oscuro...
          </p>
          <p className="flex items-center text-gray-700 font-medium">
            <span className="w-3 h-3 bg-white border-2 border-blue-500 rounded-full mr-2"></span>
            Si esta tarjeta es blanca...
          </p>
          <p className="flex items-center text-gray-700 font-medium">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Si ves el ícono verde...
          </p>
        </div>

        <div className="mt-8">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition duration-300 shadow-lg transform hover:scale-105">
            ¡Todo funciona perfecto!
          </button>
          <p className="mt-4 text-xs text-gray-400">
            Sistema de Inventario v1.0
          </p>
        </div>

      </div>
    </div>
  )
}

export default App