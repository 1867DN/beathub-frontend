import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../../api/services'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
    } catch {
      setError('Ocurrió un error. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">🎵 BeatHub</h1>
        <h2 className="text-2xl font-bold mb-2">Recuperar contraseña</h2>
        <p className="text-gray-500 text-sm mb-6">
          Ingresá tu email y te enviamos un enlace para crear una nueva contraseña.
        </p>

        {sent ? (
          <div className="bg-green-50 border border-green-300 rounded-lg p-5 text-center">
            <p className="text-2xl mb-2">📬</p>
            <p className="font-bold text-green-800">¡Email enviado!</p>
            <p className="text-green-700 text-sm mt-1">
              Si <strong>{email}</strong> está registrado, vas a recibir un email con el enlace en los próximos minutos.
            </p>
            <p className="text-xs text-gray-400 mt-3">Revisá también la carpeta de spam.</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 rounded font-bold hover:bg-green-600 transition disabled:bg-gray-400"
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
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
