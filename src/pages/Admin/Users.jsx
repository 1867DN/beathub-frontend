import { useState, useEffect } from 'react'
import { usersAPI } from '../../api/services'

function RoleBadge({ role }) {
  const isAdmin = role === 'admin'
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
      {isAdmin ? '🛡️ Admin' : '👤 Usuario'}
    </span>
  )
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    usersAPI.adminGetAll()
      .then(res => setUsers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleToggleRole = async (user) => {
    if (!window.confirm(`¿${user.role === 'admin' ? 'Quitar permisos de admin a' : 'Hacer admin a'} ${user.name}?`)) return
    setTogglingId(user.id)
    try {
      await usersAPI.adminToggleRole(user.id)
      setUsers(prev => prev.map(u => u.id === user.id
        ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' }
        : u
      ))
    } catch {
      alert('Error al cambiar rol')
    } finally {
      setTogglingId(null)
    }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="text-center py-20 text-2xl animate-pulse">Cargando usuarios...</div>

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">👥 Gestión de Usuarios</h1>
        <span className="text-sm text-gray-500">{users.length} usuarios registrados</span>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar por nombre o email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full md:w-96 border rounded-xl px-4 py-2.5 mb-6 text-sm focus:outline-none focus:border-secondary"
      />

      {filtered.length === 0 ? (
        <p className="text-center py-16 text-gray-400">No se encontraron usuarios</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">ID</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Nombre</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Email</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold hidden md:table-cell">Teléfono</th>
                <th className="text-center px-4 py-3 text-gray-500 font-semibold">Rol</th>
                <th className="text-center px-4 py-3 text-gray-500 font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr key={user.id} className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3 font-mono text-gray-400">#{user.id}</td>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{user.telephone || '—'}</td>
                  <td className="px-4 py-3 text-center"><RoleBadge role={user.role} /></td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleRole(user)}
                      disabled={togglingId === user.id}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                        user.role === 'admin'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                      } disabled:opacity-50`}
                    >
                      {togglingId === user.id ? '...' : user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
