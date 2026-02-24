import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsAPI, brandsAPI } from '../../api/services'
import { useCartStore } from '../../stores/cartStore'
import { useToastStore } from '../../stores/toastStore'
import { formatARS } from '../../utils/format'

export default function NewArrivalsPage() {
  const navigate = useNavigate()
  const { addItem } = useCartStore()
  const { addToast } = useToastStore()

  const [products, setProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([productsAPI.getAll(), brandsAPI.getAll()])
      .then(([pRes, bRes]) => {
        const newOnes = (pRes.data || []).filter(p => p.is_new === 'true' && p.is_active !== 'false')
        setProducts(newOnes)
        setBrands(bRes.data || [])
      })
      .catch(() => setError('No se pudieron cargar los productos'))
      .finally(() => setLoading(false))
  }, [])

  const brandById = useMemo(() => {
    const map = {}
    brands.forEach(b => { map[b.id_key] = b })
    return map
  }, [brands])


  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">✨ Lo nuevo</h1>
        <p className="text-gray-500 mt-1">Los últimos productos incorporados a nuestro catálogo</p>
      </div>

      {loading && (
        <div className="text-center py-20 text-gray-400 text-lg">Cargando...</div>
      )}

      {error && (
        <div className="text-center py-20 text-red-500">{error}</div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">✨</p>
          <p className="text-lg font-medium">No hay productos nuevos por ahora</p>
          <p className="text-sm mt-2">Volvé pronto para ver las últimas incorporaciones</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(product => {
            const hasDiscount = product.discount_percent > 0
            return (
              <div
                key={product.id_key}
                onClick={() => navigate(`/product/${product.id_key}`)}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all cursor-pointer group overflow-hidden border border-gray-100"
              >
                {/* Image */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 aspect-square flex items-center justify-center overflow-hidden relative">
                  {product.image_path ? (
                    <img
                      src={`/products/${product.image_path}`}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="text-5xl group-hover:scale-110 transition-transform">🎵</div>
                  )}
                  {/* Nuevo badge */}
                  <span className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Nuevo
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  {product.brand_id && brandById[product.brand_id] && (
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                      {brandById[product.brand_id].name}
                    </span>
                  )}

                  <h3 className="font-bold text-sm text-secondary line-clamp-2 mt-0.5 min-h-[2.5rem] leading-snug">
                    {product.name}
                  </h3>

                  <div className="mt-2">
                    {hasDiscount && (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-gray-400 line-through text-xs">
                          {product.price_list ? formatARS(product.price_list * (1 + product.discount_percent / 100)) : ''}
                        </span>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          -{product.discount_percent}%
                        </span>
                      </div>
                    )}
                    <p className="text-base font-bold text-primary">{formatARS(product.price)}</p>
                    {product.price_list && (
                      <p className="text-[11px] text-gray-500">Lista: {formatARS(product.price_list)}</p>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock > 0 ? (product.stock === 1 ? 'Último!' : `${product.stock} u.`) : 'Sin stock'}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        addItem({ id: product.id_key, name: product.name, price: product.price, image_path: product.image_path, stock: product.stock, quantity: 1 })
                        addToast({ name: product.name, image_path: product.image_path })
                      }}
                      disabled={product.stock === 0}
                      className="bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition"
                    >
                      + Carrito
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
