import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { brandsAPI, categoriesAPI } from '../../api/services'
import { useCartStore } from '../../stores/cartStore'
import { useToastStore } from '../../stores/toastStore'
import { formatARS } from '../../utils/format'

export default function BrandPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCartStore()
  const { addToast } = useToastStore()

  const [brand, setBrand] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [panelOpen, setPanelOpen] = useState(false)
  const [openSection, setOpenSection] = useState(null)

  const [sortBy, setSortBy] = useState('alpha_asc')
  const [filterCategories, setFilterCategories] = useState(new Set())
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [appliedPriceMin, setAppliedPriceMin] = useState(null)
  const [appliedPriceMax, setAppliedPriceMax] = useState(null)

  useEffect(() => {
    Promise.all([
      brandsAPI.getById(id),
      brandsAPI.getProducts(id),
      categoriesAPI.getAll(),
    ]).then(([brandRes, productsRes, catRes]) => {
      setBrand(brandRes.data)
      setProducts(productsRes.data)
      setCategories(catRes.data || [])
    }).catch(err => {
      console.error('Error fetching brand:', err)
      setError('No se pudo cargar la marca.')
    }).finally(() => setLoading(false))
  }, [id])

  const maxPrice = useMemo(() => {
    if (!products.length) return 0
    return Math.max(...products.map(p => p.price_list || p.price || 0))
  }, [products])

  const catCount = useMemo(() => {
    const map = {}
    products.forEach(p => { if (p.category_id) map[p.category_id] = (map[p.category_id] || 0) + 1 })
    return map
  }, [products])

  const displayed = useMemo(() => {
    let r = [...products]
    if (filterCategories.size > 0) r = r.filter(p => filterCategories.has(p.category_id))
    if (appliedPriceMin != null) r = r.filter(p => (p.price || 0) >= appliedPriceMin)
    if (appliedPriceMax != null) r = r.filter(p => (p.price || 0) <= appliedPriceMax)
    switch (sortBy) {
      case 'alpha_asc': r.sort((a, b) => a.name.localeCompare(b.name, 'es')); break
      case 'alpha_desc': r.sort((a, b) => b.name.localeCompare(a.name, 'es')); break
      case 'price_asc': r.sort((a, b) => (a.price || 0) - (b.price || 0)); break
      case 'price_desc': r.sort((a, b) => (b.price || 0) - (a.price || 0)); break
    }
    return r
  }, [products, filterCategories, appliedPriceMin, appliedPriceMax, sortBy])

  const toggleCat = (cid) => setFilterCategories(prev => { const n = new Set(prev); n.has(cid) ? n.delete(cid) : n.add(cid); return n })
  const toggleSection = (s) => setOpenSection(prev => prev === s ? null : s)

  const clearFilters = () => {
    setFilterCategories(new Set())
    setPriceMin(''); setPriceMax('')
    setAppliedPriceMin(null); setAppliedPriceMax(null)
    setSortBy('alpha_asc')
  }

  const activeFilterCount = filterCategories.size + (appliedPriceMin != null ? 1 : 0) + (appliedPriceMax != null ? 1 : 0)
  const sortLabel = { alpha_asc: 'A - Z', alpha_desc: 'Z - A', price_asc: 'Menor precio', price_desc: 'Mayor precio' }

  if (loading) return (
    <div className="text-center py-20">
      <div className="animate-spin text-5xl mb-4">&#9835;</div>
      <p className="text-gray-500 text-lg">Cargando marca...</p>
    </div>
  )

  if (error || !brand) return (
    <div className="text-center py-20">
      <p className="text-gray-500 text-lg">{error || 'Marca no encontrada'}</p>
      <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">Volver al inicio</button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 flex-wrap">
        <Link to="/" className="hover:text-primary transition">Inicio</Link>
        <span>&rsaquo;</span>
        <Link to="/productos" className="hover:text-primary transition">Productos</Link>
        <span>&rsaquo;</span>
        <Link to="/marcas" className="hover:text-primary transition">Marcas</Link>
        <span>&rsaquo;</span>
        <span className="text-gray-800 font-medium">{brand.name}</span>
      </nav>

      {/* Header row */}
      <div className="flex items-end justify-between mb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-secondary">
          {brand.name}
        </h1>
        <button
          onClick={() => setPanelOpen(true)}
          className="text-sm font-bold uppercase underline underline-offset-2 tracking-wider hover:text-primary transition"
        >
          Filtrar y Ordenar
          {activeFilterCount > 0 && (
            <span className="ml-1.5 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 no-underline">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {[...filterCategories].map(cid => {
            const c = categories.find(x => x.id_key === cid)
            return c ? (
              <span key={cid} className="flex items-center gap-1 bg-gray-100 text-xs font-semibold px-3 py-1 rounded-full">
                {c.name}<button onClick={() => toggleCat(cid)} className="ml-0.5 hover:text-red-500">&times;</button>
              </span>
            ) : null
          })}
          {(appliedPriceMin != null || appliedPriceMax != null) && (
            <span className="flex items-center gap-1 bg-gray-100 text-xs font-semibold px-3 py-1 rounded-full">
              Precio {appliedPriceMin != null ? formatARS(appliedPriceMin) : '$0'} - {appliedPriceMax != null ? formatARS(appliedPriceMax) : 'max'}
              <button onClick={() => { setAppliedPriceMin(null); setAppliedPriceMax(null); setPriceMin(''); setPriceMax('') }} className="ml-0.5 hover:text-red-500">&times;</button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-red-500 font-semibold hover:underline">Limpiar todo</button>
        </div>
      )}

      {/* Result count */}
      <p className="text-xs text-gray-400 mb-4 uppercase tracking-wide">
        {displayed.length} resultado{displayed.length !== 1 ? 's' : ''} &middot; Ordenado: {sortLabel[sortBy]}
      </p>

      {/* Products Grid */}
      {displayed.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">&#128230;</div>
          <p className="text-gray-500 text-lg mb-3">
            {products.length === 0 ? 'No hay productos para esta marca todavia.' : 'No hay productos con esos filtros.'}
          </p>
          {activeFilterCount > 0 && <button onClick={clearFilters} className="text-primary font-semibold hover:underline">Limpiar filtros</button>}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayed.map(product => {
            const hasDiscount = product.discount_percent > 0
            return (
              <div
                key={product.id_key}
                onClick={() => navigate(`/product/${product.id_key}`)}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all cursor-pointer group overflow-hidden border border-gray-100"
              >
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 aspect-square flex items-center justify-center overflow-hidden">
                  {product.image_path ? (
                    <img src={`/products/${product.image_path}`} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="text-5xl group-hover:scale-110 transition-transform">&#9835;</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm text-secondary line-clamp-2 mt-0.5 min-h-[2.5rem] leading-snug">{product.name}</h3>
                  <div className="mt-2">
                    {hasDiscount && (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-gray-400 line-through text-xs">{product.price_list ? formatARS(product.price_list * (1 + product.discount_percent / 100)) : ''}</span>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-{product.discount_percent}%</span>
                      </div>
                    )}
                    <p className="text-base font-bold text-primary">{formatARS(product.price)}</p>
                    {product.price_list && <p className="text-[11px] text-gray-500">Lista: {formatARS(product.price_list)}</p>}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
          })}
        </div>
      )}

      {/* Filter/Sort Drawer */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.45)', opacity: panelOpen ? 1 : 0, pointerEvents: panelOpen ? 'auto' : 'none' }}
        onClick={() => setPanelOpen(false)}
      />
      <div
        className="fixed right-0 top-0 z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col"
        style={{ width: '350px', height: '100vh', transform: panelOpen ? 'translateX(0)' : 'translateX(100%)', pointerEvents: panelOpen ? 'auto' : 'none' }}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-end px-5 py-4 border-b border-gray-100">
            <button onClick={() => setPanelOpen(false)} className="text-2xl font-light text-gray-400 hover:text-gray-700 transition leading-none">&times;</button>
          </div>

          {/* Ordenar */}
          <div className="border-b border-gray-100">
            <button className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-primary/10 hover:text-primary transition" onClick={() => toggleSection('sort')}>
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-widest">Ordenar Por</span>
              <span className="text-gray-400">&rsaquo;</span>
            </button>
            {openSection === 'sort' && (
              <div className="px-5 pb-3 space-y-2 bg-gray-50">
                {[{ value: 'alpha_asc', label: 'A - Z' }, { value: 'alpha_desc', label: 'Z - A' }, { value: 'price_asc', label: 'Menor precio primero' }, { value: 'price_desc', label: 'Mayor precio primero' }].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer py-1.5">
                    <input type="radio" name="brandSort" checked={sortBy === opt.value} onChange={() => setSortBy(opt.value)} className="accent-black" />
                    <span className="text-sm font-semibold text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Categorias */}
          <div className="border-b border-gray-100">
            <button className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-primary/10 hover:text-primary transition" onClick={() => toggleSection('categories')}>
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-widest">Categorias</span>
              <span className="text-gray-400">&rsaquo;</span>
            </button>
            {openSection === 'categories' && (
              <div className="px-5 pb-3 space-y-2 bg-gray-50">
                {categories.filter(c => (catCount[c.id_key] || 0) > 0).sort((a, b) => a.name.localeCompare(b.name, 'es')).map(cat => (
                  <label key={cat.id_key} className="flex items-center gap-3 cursor-pointer py-1.5">
                    <input type="checkbox" checked={filterCategories.has(cat.id_key)} onChange={() => toggleCat(cat.id_key)} className="accent-black rounded" />
                    <span className="text-sm font-semibold text-gray-700">{cat.name} <span className="text-gray-400 font-normal">({catCount[cat.id_key] || 0})</span></span>
                  </label>
                ))}
                {categories.filter(c => (catCount[c.id_key] || 0) > 0).length === 0 && <p className="text-xs text-gray-400 py-2">Sin categorias disponibles</p>}
              </div>
            )}
          </div>

          {/* Precio */}
          <div className="border-b border-gray-100">
            <button className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-primary/10 hover:text-primary transition" onClick={() => toggleSection('price')}>
              <span className={`text-sm font-semibold uppercase tracking-widest ${appliedPriceMin != null || appliedPriceMax != null ? 'text-primary' : 'text-gray-700'}`}>Precio</span>
              <span className="text-gray-400">&rsaquo;</span>
            </button>
            {openSection === 'price' && (
              <div className="px-5 pb-4 bg-gray-50">
                <div className="flex gap-3 mb-3 pt-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Desde</label>
                    <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Hasta</label>
                    <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder={maxPrice ? maxPrice.toFixed(0) : ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <button onClick={() => { setAppliedPriceMin(priceMin !== '' ? Number(priceMin) : null); setAppliedPriceMax(priceMax !== '' ? Number(priceMax) : null) }} className="w-full bg-black text-white text-sm font-bold py-2 rounded-lg hover:bg-gray-800 transition">Aplicar</button>
              </div>
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100">
            <button onClick={() => { clearFilters(); setPanelOpen(false) }} className="w-full border border-black text-black text-sm font-bold py-2.5 rounded-lg hover:bg-gray-100 transition">
              Limpiar filtros ({activeFilterCount})
            </button>
          </div>
        )}
        <div className="flex-shrink-0 mx-4 my-4 p-3 rounded-lg text-center" style={{ background: 'linear-gradient(to bottom, #79edd6, #a5efa2)' }}>
          <p className="text-xs font-bold text-gray-800">Hasta 3 cuotas sin interes</p>
          <p className="text-xs mt-0.5 text-gray-700">En compras &gt; $2M</p>
        </div>
      </div>

    </div>
  )
}
