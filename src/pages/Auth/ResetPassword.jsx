import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../api/services'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="font-bold text-gray-700 text-lg">Enlace inválido</p>
          <p className="text-gray-500 text-sm mt-2">Este enlace no es válido. Solicitá uno nuevo.</p>
          <Link to="/forgot-password" className="mt-6 inline-block bg-primary text-white px-6 py-2 rounded font-bold hover:bg-green-600 transition">
            Pedir nuevo enlace
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    try {
      await authAPI.resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'El enlace es inválido o ya expiró.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">🎵 BeatHub</h1>
        <h2 className="text-2xl font-bold mb-2">Nueva contraseña</h2>
        <p className="text-gray-500 text-sm mb-6">Ingresá tu nueva contraseña.</p>

        {success ? (
          <div className="bg-green-50 border border-green-300 rounded-lg p-5 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-bold text-green-800">¡Contraseña actualizada!</p>
            <p className="text-green-700 text-sm mt-1">Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Confirmar contraseña"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 rounded font-bold hover:bg-green-600 transition disabled:bg-gray-400"
              >
                {loading ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="text-primary hover:underline">← Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  )
}
