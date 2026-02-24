import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { brandsAPI } from '../../api/services'

export default function BrandsPage() {
  const navigate = useNavigate()
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    brandsAPI.getAll()
      .then(res => setBrands((res.data || []).sort((a, b) => a.name.localeCompare(b.name, 'es'))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4 animate-spin">🎵</div>
      <p className="text-gray-500">Cargando marcas...</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 flex-wrap">
        <Link to="/" className="hover:text-primary transition">Inicio</Link>
        <span className="text-gray-400">|</span>
        <Link to="/productos" className="hover:text-primary transition">Productos</Link>
        <span className="text-gray-400">|</span>
        <span className="text-gray-800 font-medium">Marcas</span>
      </nav>

      <h1 className="text-3xl font-black uppercase tracking-tight text-secondary mb-8">
        Marcas
      </h1>

      {brands.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No hay marcas disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {brands.map(brand => (
            <div
              key={brand.id_key}
              onClick={() => navigate(`/brand/${brand.id_key}`)}
              className="bg-white rounded-xl shadow hover:shadow-lg transition-all cursor-pointer group overflow-hidden border border-gray-100"
            >
              {/* Logo area */}
              <div className="bg-black h-36 flex items-center justify-center overflow-hidden p-4">
                {brand.logo_path ? (
                  <img
                    src={`/brands/${brand.logo_path}`}
                    alt={brand.name}
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                ) : (
                  <span className="text-white text-2xl font-black tracking-wider uppercase">
                    {brand.name.slice(0, 3)}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="px-3 py-3 text-center">
                <p className="font-bold text-secondary text-sm uppercase tracking-wide group-hover:text-primary transition">
                  {brand.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
