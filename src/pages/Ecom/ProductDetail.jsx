import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productsAPI, brandsAPI } from '../../api/services'
import { useCartStore } from '../../stores/cartStore'
import { useToastStore } from '../../stores/toastStore'
import { formatARS } from '../../utils/format'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [brand, setBrand] = useState(null)
  const [related, setRelated] = useState([])
  const [categoryInfo, setCategoryInfo] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()
  const { addToast } = useToastStore()

  useEffect(() => {
    setLoading(true)
    setRelated([])
    setCategoryInfo(null)
    setQuantity(1)
    productsAPI.getById(id)
      .then(async (res) => {
        const prod = res.data
        setProduct(prod)

        // Fetch brand
        if (prod.brand_id) {
          try {
            const brandRes = await brandsAPI.getById(prod.brand_id)
            setBrand(brandRes.data)
          } catch (_) {}
        }

        // Fetch all products para relacionados + nombre categoría
        try {
          const allRes = await productsAPI.getAll()
          const allActive = allRes.data.filter(p => p.id_key !== prod.id_key && p.is_active !== 'false')

          // Inferir nombre de categoría desde otros productos (prod.category puede venir null)
          if (prod.category_id) {
            const sameCatProd = allRes.data.find(p => p.category_id === prod.category_id && p.category)
            if (sameCatProd?.category) setCategoryInfo(sameCatProd.category)
            else if (prod.category) setCategoryInfo(prod.category)
          }

          // 1) Misma categoría (hasta 4)
          const sameCategory = allActive
            .filter(p => p.category_id === prod.category_id)
            .slice(0, 4)

          // 2) Si quedan slots, rellenar con similitud por nombre
          const needed = 4 - sameCategory.length
          let byName = []
          if (needed > 0) {
            const stopwords = new Set(['para', 'con', 'por', 'una', 'unos', 'unas', 'los', 'las', 'del', 'que', 'como', 'este', 'esta', 'sus', 'más', 'muy', 'cada', 'desde', 'hasta', 'entre'])
            const keywords = prod.name
              .toLowerCase()
              .replace(/[^a-záéíóúüñ\s]/g, '')
              .split(/\s+/)
              .filter(w => w.length > 3 && !stopwords.has(w))

            const usedIds = new Set(sameCategory.map(p => p.id_key))
            byName = allActive
              .filter(p => !usedIds.has(p.id_key) && p.category_id !== prod.category_id)
              .map(p => {
                const pName = p.name.toLowerCase()
                const score = keywords.filter(kw => pName.includes(kw)).length
                return { ...p, _score: score }
              })
              .filter(p => p._score > 0)
              .sort((a, b) => b._score - a._score)
              .slice(0, needed)
          }

          setRelated([...sameCategory, ...byName])
        } catch (_) {}
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    addItem({ id: product.id_key, name: product.name, price: product.price, image_path: product.image_path, stock: product.stock, quantity })
    addToast({ name: product.name, image_path: product.image_path })
  }

  if (loading) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4 animate-spin">🎵</div>
      <p className="text-gray-500">Cargando producto...</p>
    </div>
  )

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">Producto no encontrado</p>
      <button onClick={() => navigate('/')} className="text-primary hover:underline font-semibold">Volver al inicio</button>
    </div>
  )

  // Calcular precio tachado (sin descuento) = price_list * (1 + discount/100)
  const hasDiscount = product.discount_percent > 0
  const priceOriginal = hasDiscount && product.price_list
    ? product.price_list * (1 + product.discount_percent / 100)
    : null

  return (
    <div className="max-w-6xl mx-auto">

      {/* ── Breadcrumbs ── */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary transition">Inicio</Link>
        <span>›</span>
        <Link to="/productos" className="hover:text-primary transition">Productos</Link>
        <span>›</span>
        <Link to="/marcas" className="hover:text-primary transition">Marcas</Link>
        {brand && (
          <>
            <span>›</span>
            <Link to={`/brand/${brand.id_key}`} className="hover:text-primary transition">{brand.name}</Link>
          </>
        )}
        <span>›</span>
        <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">

        {/* Imagen */}
        <div className="bg-white rounded-xl aspect-square shadow-md overflow-hidden relative">
          {product.image_path ? (
            <img
              src={`/products/${product.image_path}`}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
            />
          ) : null}
          <div className={`absolute inset-0 items-center justify-center text-8xl ${product.image_path ? 'hidden' : 'flex'}`}>🎵</div>
        </div>

        {/* Info */}
        <div className="flex flex-col">

          {/* Nombre */}
          <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-1 uppercase leading-tight">
            {product.name}
          </h1>

          {/* Categoría — sutil, debajo del título */}
          {(categoryInfo || product.category) && (
            <Link
              to={`/productos?cat=${(categoryInfo || product.category).id_key}`}
              className="inline-flex items-center gap-1 self-start text-xs text-gray-400 mb-4 hover:text-primary transition"
            >
              <span>{(categoryInfo || product.category).name}</span>
              <span className="text-gray-300">›</span>
            </Link>
          )}

          {/* Precios */}
          <div className="mb-5 space-y-1.5">
            {/* Precio tachado (original sin descuento) */}
            {priceOriginal && (
              <p className="text-gray-400 line-through text-base">{formatARS(priceOriginal)}</p>
            )}

            {/* Precio transferencia — principal */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">{formatARS(product.price)}</span>
              {hasDiscount && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                  -{product.discount_percent}% OFF
                </span>
              )}
            </div>
            <p className="text-xs text-green-700 font-semibold">Transferencia/cash</p>

            {/* Precio lista */}
            {product.price_list && (
              <p className="text-sm text-gray-600">Lista: {formatARS(product.price_list)}</p>
            )}
          </div>

          {/* Stock */}
          {product.stock === 1 && (
            <p className="text-red-500 font-semibold text-sm mb-3">¡No te lo pierdas, es el último!</p>
          )}
          {product.stock > 1 && (
            <p className="text-green-600 font-semibold text-sm mb-3">{product.stock} unidades disponibles</p>
          )}
          {product.stock === 0 && (
            <p className="text-red-600 font-semibold text-sm mb-3">Sin stock</p>
          )}

          {/* Cantidad + Agregar al carrito */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-lg font-bold hover:bg-gray-100 transition"
                >−</button>
                <span className="px-4 py-2 font-semibold min-w-[2.5rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 text-lg font-bold hover:bg-gray-100 transition"
                >+</button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-black hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wide transition"
              >
                Agregar al carrito
              </button>
            </div>
          )}

          {product.stock === 0 && (
            <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-6 rounded-lg uppercase cursor-not-allowed">
              Sin stock
            </button>
          )}

        </div>
      </div>

      {/* ── Descripción ── */}
      {product.description && (
        <div className="border-t pt-10 mb-12">
          <h2 className="text-xl font-bold uppercase mb-4 text-secondary">Descripción</h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
            {product.description}
          </div>
        </div>
      )}

      {/* ── Productos Relacionados ── */}
      {related.length > 0 && (
        <div className="border-t pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold uppercase text-secondary">Productos Relacionados</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => {
              const relDiscount = p.discount_percent > 0
              return (
                <Link
                  key={p.id_key}
                  to={`/product/${p.id_key}`}
                  className="bg-white rounded-xl shadow hover:shadow-md transition group overflow-hidden flex flex-col"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden relative">
                    {p.image_path ? (
                      <img
                        src={`/products/${p.image_path}`}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🎵</div>
                    )}
                    {relDiscount && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        -{p.discount_percent}%
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 flex-1">{p.name}</p>
                    <p className="text-primary font-bold text-sm">{formatARS(p.price)}</p>
                    {p.stock === 0 && <p className="text-xs text-red-500 font-semibold mt-1">Sin stock</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
