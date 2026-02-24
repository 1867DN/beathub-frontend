import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { productsAPI, brandsAPI } from '../../api/services'
import { useCartStore } from '../../stores/cartStore'
import { useToastStore } from '../../stores/toastStore'
import { formatARS } from '../../utils/format'

function ProductCard({ product, brandById, navigate, addItem, addToast }) {
  const hasDiscount = product.discount_percent > 0
  return (
    <div
      onClick={() => navigate(`/product/${product.id_key}`)}
      className="bg-white rounded-xl shadow hover:shadow-lg transition-all cursor-pointer group overflow-hidden border border-gray-100"
    >
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 aspect-square flex items-center justify-center overflow-hidden">
        {product.image_path ? (
          <img
            src={`/products/${product.image_path}`}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="text-5xl group-hover:scale-110 transition-transform">&#9835;</div>
        )}
        {product.is_new === 'true' && (
          <span className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Nuevo
          </span>
        )}
        {hasDiscount && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            -{product.discount_percent}%
          </span>
        )}
      </div>

      <div className="p-3">
        {product.brand_id && brandById[product.brand_id] && (
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            {brandById[product.brand_id].name}
          </span>
        )}
        <h3 className="font-bold text-sm text-secondary mt-0.5 leading-snug">{product.name}</h3>

        <div className="mt-2">
          {hasDiscount && (
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-gray-400 line-through text-xs">
                {product.price_list ? formatARS(product.price_list * (1 + product.discount_percent / 100)) : ''}
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
            {product.stock > 0 ? (product.stock === 1 ? 'Ultimo!' : `${product.stock} u.`) : 'Sin stock'}
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
}

function SectionHeader({ title, subtitle, linkTo, linkLabel }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-2xl font-extrabold text-secondary tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <Link
        to={linkTo}
        className="text-sm font-semibold text-primary hover:underline whitespace-nowrap ml-4"
      >
        {linkLabel} →
      </Link>
    </div>
  )
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { addItem } = useCartStore()
  const { addToast } = useToastStore()

  useEffect(() => {
    Promise.all([productsAPI.getAll(), brandsAPI.getAll()])
      .then(([pRes, bRes]) => {
        setProducts(pRes.data || [])
        setBrands(bRes.data || [])
      })
      .catch(err => console.error('Error fetching data:', err))
      .finally(() => setLoading(false))
  }, [])

  const brandById = useMemo(() => {
    const map = {}
    brands.forEach(b => { map[b.id_key] = b })
    return map
  }, [brands])

  const activeProducts = useMemo(
    () => products.filter(p => p.is_active !== 'false'),
    [products]
  )

  const newProducts = useMemo(
    () => activeProducts.filter(p => p.is_new === 'true').slice(0, 8),
    [activeProducts]
  )

  const discountProducts = useMemo(
    () => activeProducts.filter(p => p.discount_percent > 0).slice(0, 8),
    [activeProducts]
  )

  const cardProps = { brandById, navigate, addItem, addToast }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin text-5xl mb-4">&#9835;</div>
        <p className="text-gray-500 text-lg">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-16">

      {/* ── NUEVOS ──────────────────────────────────────────── */}
      {newProducts.length > 0 && (
        <section>
          <SectionHeader
            title="Lo Nuevo"
            subtitle="Los últimos productos que llegaron al catálogo"
            linkTo="/nuevo"
            linkLabel="Ver más productos nuevos"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {newProducts.map(p => (
              <ProductCard key={p.id_key} product={p} {...cardProps} />
            ))}
          </div>
        </section>
      )}

      {/* ── DESCUENTOS ─────────────────────────────────────── */}
      {discountProducts.length > 0 && (
        <section>
          <SectionHeader
            title="En Descuento"
            subtitle="Precios especiales por tiempo limitado"
            linkTo="/descuentos"
            linkLabel="Ver más productos en descuento"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {discountProducts.map(p => (
              <ProductCard key={p.id_key} product={p} {...cardProps} />
            ))}
          </div>
        </section>
      )}

      {/* Fallback si no hay nada en ninguna sección */}
      {newProducts.length === 0 && discountProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No hay productos disponibles</p>
        </div>
      )}

    </div>
  )
}
