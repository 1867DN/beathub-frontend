import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
      <p className="text-gray-500 mb-8">Bienvenido, {user?.name}. Gestioná tu tienda desde acá.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/products"
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg border-l-4 border-primary transition group"
        >
          <div className="text-2xl mb-2">📦</div>
          <h2 className="font-bold text-xl group-hover:text-primary transition">Productos</h2>
          <p className="text-sm text-gray-500 mt-1">Editar stock, ocultar y eliminar productos</p>
        </Link>

        <Link
          to="/admin/categories"
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg border-l-4 border-purple-500 transition group"
        >
          <div className="text-2xl mb-2">🗂️</div>
          <h2 className="font-bold text-xl group-hover:text-purple-600 transition">Categorías</h2>
          <p className="text-sm text-gray-500 mt-1">Agregar y ver categorías del catálogo</p>
        </Link>

        <Link
          to="/admin/orders"
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg border-l-4 border-blue-500 transition group"
        >
          <div className="text-2xl mb-2">📋</div>
          <h2 className="font-bold text-xl group-hover:text-blue-500 transition">Órdenes</h2>
          <p className="text-sm text-gray-500 mt-1">Ver y gestionar pedidos de clientes</p>
        </Link>

        <Link
          to="/admin/users"
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg border-l-4 border-green-500 transition group"
        >
          <div className="text-2xl mb-2">👥</div>
          <h2 className="font-bold text-xl group-hover:text-green-600 transition">Usuarios</h2>
          <p className="text-sm text-gray-500 mt-1">Ver clientes y administrar roles</p>
        </Link>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <strong>Recordatorio:</strong> Los cambios de stock y visibilidad se aplican inmediatamente en la tienda.
      </div>
    </div>
  )
}
