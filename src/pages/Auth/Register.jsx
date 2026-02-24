import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { authAPI } from '../../api/services'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [userData, setUserData] = useState({
    name: '',
    lastname: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (userData.password !== userData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (userData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    try {
      setLoading(true)
      setError('')
      const res = await authAPI.register({
        name: userData.name,
        lastname: userData.lastname,
        email: userData.email,
        telephone: userData.telephone || undefined,
        password: userData.password,
      })
      // After register, auto-login
      const loginRes = await authAPI.login(userData.email, userData.password)
      login(loginRes.data.user, loginRes.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">🎵 BeatHub</h1>
        <h2 className="text-2xl font-bold mb-6">Crear Cuenta</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nombre"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              required
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Apellido"
              value={userData.lastname}
              onChange={(e) => setUserData({ ...userData, lastname: e.target.value })}
              required
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <input
            type="email"
            placeholder="Correo electrónico"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="tel"
            placeholder="Teléfono (opcional)"
            value={userData.telephone}
            onChange={(e) => setUserData({ ...userData, telephone: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña (mín. 6 caracteres)"
              value={userData.password}
              onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirmar contraseña"
            value={userData.confirmPassword}
            onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded font-bold hover:bg-green-600 transition disabled:bg-gray-400"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
