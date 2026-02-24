import { useState, useEffect, useMemo } from 'react'
import { productsAPI } from '../../api/services'

// Strip relationship/computed fields before PUT — only send actual DB columns
const sanitize = ({ id_key, category, reviews, order_details, ...rest }) => rest

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingStock, setEditingStock] = useState({})
  const [editingName, setEditingName] = useState({})
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name-asc')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [saving, setSaving] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', price: '', price_list: '', stock: '0', description: '', category_id: '', discount_percent: '0' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await productsAPI.getAllAdmin()
      setProducts(res.data)
    } catch {
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const categories = useMemo(() => {
    const map = {}
    products.forEach(p => {
      if (p.category) map[p.category.id_key] = p.category.name
    })
    return Object.entries(map).sort((a, b) => a[1].localeCompare(b[1]))
  }, [products])

  const handleSaveStock = async (product) => {
    const newStock = parseInt(editingStock[product.id_key], 10)
    if (isNaN(newStock) || newStock < 0) return
    try {
      setSaving(prev => ({ ...prev, [product.id_key]: true }))
      await productsAPI.update(product.id_key, { ...sanitize(product), stock: newStock })
      setEditingStock(prev => { const n = { ...prev }; delete n[product.id_key]; return n })
      fetchProducts()
    } catch {
      setError('Error al actualizar stock')
    } finally {
      setSaving(prev => ({ ...prev, [product.id_key]: false }))
    }
  }

  const handleSaveName = async (product) => {
    const newName = editingName[product.id_key]?.trim()
    if (!newName || newName === product.name) {
      setEditingName(prev => { const n = { ...prev }; delete n[product.id_key]; return n })
      return
    }
    try {
      setSaving(prev => ({ ...prev, [product.id_key]: true }))
      await productsAPI.update(product.id_key, { ...sanitize(product), name: newName })
      setEditingName(prev => { const n = { ...prev }; delete n[product.id_key]; return n })
      fetchProducts()
    } catch {
      setError('Error al actualizar nombre')
    } finally {
      setSaving(prev => ({ ...prev, [product.id_key]: false }))
    }
  }

  const handleToggleActive = async (product) => {
    const newActive = product.is_active === 'false' ? 'true' : 'false'
    try {
      setSaving(prev => ({ ...prev, [product.id_key]: true }))
      await productsAPI.update(product.id_key, { ...sanitize(product), is_active: newActive })
      fetchProducts()
    } catch {
      setError('Error al cambiar visibilidad')
    } finally {
      setSaving(prev => ({ ...prev, [product.id_key]: false }))
    }
  }

  const handleToggleNew = async (product) => {
    const newVal = product.is_new === 'true' ? 'false' : 'true'
    try {
      setSaving(prev => ({ ...prev, [product.id_key]: true }))
      await productsAPI.update(product.id_key, { ...sanitize(product), is_new: newVal })
      fetchProducts()
    } catch {
      setError('Error al cambiar estado de Lo nuevo')
    } finally {
      setSaving(prev => ({ ...prev, [product.id_key]: false }))
    }
  }

  const handleToggleFeatured = async (product) => {
    const willFeature = product.is_featured !== 'true'
    if (willFeature) {
      const featuredCount = products.filter(p => p.is_featured === 'true').length
      if (featuredCount >= 6) {
        setError('Máximo 6 productos en cartelera. Quitá uno antes de agregar otro.')
        return
      }
    }
    const newVal = willFeature ? 'true' : 'false'
    try {
      setSaving(prev => ({ ...prev, [product.id_key]: true }))
      await productsAPI.update(product.id_key, { ...sanitize(product), is_featured: newVal })
      fetchProducts()
    } catch {
      setError('Error al cambiar cartelera')
    } finally {
      setSaving(prev => ({ ...prev, [product.id_key]: false }))
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateError('')
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.category_id) {
      setCreateError('Nombre, precio y categoría son obligatorios.')
      return
    }
    try {
      setCreating(true)
      await productsAPI.create({
        name: newProduct.name.trim(),
        price: parseFloat(newProduct.price),
        price_list: newProduct.price_list ? parseFloat(newProduct.price_list) : null,
        stock: parseInt(newProduct.stock) || 0,
        description: newProduct.description.trim() || null,
        category_id: parseInt(newProduct.category_id),
        discount_percent: parseInt(newProduct.discount_percent) || 0,
        is_active: 'true',
        is_new: 'false',
        is_featured: 'false',
      })
      setNewProduct({ name: '', price: '', price_list: '', stock: '0', description: '', category_id: '', discount_percent: '0' })
      setShowAddForm(false)
      fetchProducts()
    } catch (err) {
      setCreateError(err.response?.data?.detail || 'Error al crear el producto.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = (product) => setConfirmDelete(product)

  const confirmDeleteProduct = async () => {
    if (!confirmDelete) return
    const product = confirmDelete
    setConfirmDelete(null)
    try {
      await productsAPI.remove(product.id_key)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.detail || 'No se puede eliminar (tiene historial de ventas)')
    }
  }

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchVis =
        filter === 'all' ? true
        : filter === 'active' ? p.is_active !== 'false'
        : p.is_active === 'false'
      const matchCat = categoryFilter === 'all' ? true : String(p.category_id) === categoryFilter
      return matchSearch && matchVis && matchCat
    })
    switch (sortBy) {
      case 'name-asc':   list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break
      case 'name-desc':  list = [...list].sort((a, b) => b.name.localeCompare(a.name)); break
      case 'price-asc':  list = [...list].sort((a, b) => a.price - b.price); break
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break
      case 'stock-asc':  list = [...list].sort((a, b) => a.stock - b.stock); break
      case 'stock-desc': list = [...list].sort((a, b) => b.stock - a.stock); break
    }
    return list
  }, [products, search, filter, categoryFilter, sortBy])

  return (
    <div>
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-2 text-gray-800">⚠️ Eliminar producto</h2>
            <p className="text-gray-600 mb-1">Estás por eliminar permanentemente:</p>
            <p className="font-semibold text-gray-800 mb-4 bg-red-50 border border-red-200 rounded px-3 py-2 truncate">
              {confirmDelete.name}
            </p>
            <p className="text-sm text-red-600 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-300 py-2 rounded font-semibold hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-1 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-5 text-gray-800">➕ Agregar producto</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre *</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Guitarra Fender Stratocaster" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Precio (efectivo) *</label>
                  <input type="number" min="0" step="0.01" className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Precio lista</label>
                  <input type="number" min="0" step="0.01" className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" value={newProduct.price_list} onChange={e => setNewProduct(p => ({ ...p, price_list: e.target.value }))} placeholder="Opcional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Categoría *</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white" value={newProduct.category_id} onChange={e => setNewProduct(p => ({ ...p, category_id: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {categories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Stock inicial</label>
                  <input type="number" min="0" className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Descripción</label>
                <textarea rows={2} className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none" value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} placeholder="Opcional" />
              </div>
              {createError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{createError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 transition text-sm">Cancelar</button>
                <button type="submit" disabled={creating} className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition text-sm disabled:opacity-50">{creating ? 'Guardando...' : 'Guardar producto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
        <div className="flex gap-2 flex-wrap">
          {[['all', 'Todos'], ['active', 'Visibles'], ['inactive', 'Ocultos']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded text-sm font-semibold border transition ${
                filter === val ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setShowAddForm(true); setCreateError('') }}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition shrink-0"
        >
          ➕ Agregar producto
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="name-asc">Nombre A→Z</option>
          <option value="name-desc">Nombre Z→A</option>
          <option value="price-asc">Precio menor→mayor</option>
          <option value="price-desc">Precio mayor→menor</option>
          <option value="stock-asc">Stock menor→mayor</option>
          <option value="stock-desc">Stock mayor→menor</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 font-bold ml-4">✕</button>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No se encontraron productos.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const isInactive = p.is_active === 'false'
            const stockVal = editingStock[p.id_key] !== undefined ? editingStock[p.id_key] : p.stock
            const isEditingStock = editingStock[p.id_key] !== undefined
            const isEditingName = editingName[p.id_key] !== undefined
            return (
              <div
                key={p.id_key}
                className={`bg-white p-3 rounded shadow flex flex-col gap-3 transition ${isInactive ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 shrink-0 rounded bg-gray-100 flex items-center justify-center overflow-hidden border">
                    {p.image_path ? (
                      <img
                        src={`/products/${p.image_path}`}
                        alt={p.name}
                        className="w-full h-full object-contain"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <span className="text-2xl">🎸</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditingName ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={editingName[p.id_key]}
                          onChange={e => setEditingName(prev => ({ ...prev, [p.id_key]: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveName(p)
                            if (e.key === 'Escape') setEditingName(prev => { const n = { ...prev }; delete n[p.id_key]; return n })
                          }}
                          autoFocus
                          className="flex-1 px-2 py-1 border-2 border-primary rounded text-sm focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveName(p)}
                          disabled={saving[p.id_key]}
                          className="bg-primary text-white px-3 py-1 rounded text-sm font-semibold hover:bg-green-600 disabled:bg-gray-400 transition shrink-0"
                        >
                          {saving[p.id_key] ? '...' : '✓'}
                        </button>
                        <button
                          onClick={() => setEditingName(prev => { const n = { ...prev }; delete n[p.id_key]; return n })}
                          className="text-gray-400 hover:text-gray-700 text-lg px-1 shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div
                        className="font-semibold text-sm cursor-pointer hover:text-primary group flex items-center gap-1"
                        title="Clic para editar nombre"
                        onClick={() => setEditingName(prev => ({ ...prev, [p.id_key]: p.name }))}
                      >
                        <span className="line-clamp-2 leading-tight">{p.name}</span>
                        <span className="text-gray-300 group-hover:text-primary shrink-0 text-xs">✏️</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-2">
                      <span>${p.price?.toLocaleString('es-AR')}</span>
                      {p.discount_percent > 0 && (
                        <span className="text-green-600">−{p.discount_percent}%</span>
                      )}
                      <span className="text-gray-400">ID:{p.id_key}</span>
                      {p.category && <span className="text-gray-400">{p.category.name}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Stock:</span>
                  <input
                    type="number"
                    min="0"
                    value={stockVal}
                    onChange={e => setEditingStock(prev => ({ ...prev, [p.id_key]: e.target.value }))}
                    className={`w-20 px-2 py-1 border rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary ${
                      Number(stockVal) === 0 ? 'border-red-300 bg-red-50' : ''
                    }`}
                  />
                  {Number(stockVal) === 0 && !isEditingStock && (
                    <span className="text-xs text-red-500 font-semibold">Sin stock</span>
                  )}
                  {isEditingStock && (
                    <button
                      onClick={() => handleSaveStock(p)}
                      disabled={saving[p.id_key]}
                      className="bg-primary text-white px-3 py-1 rounded text-sm font-semibold hover:bg-green-600 disabled:bg-gray-400 transition"
                    >
                      {saving[p.id_key] ? '...' : 'Guardar'}
                    </button>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      disabled={saving[p.id_key]}
                      title={p.is_featured === 'true' ? 'Quitar de cartelera' : 'Poner en cartelera (máx. 6)'}
                      className={`px-3 py-1.5 rounded text-sm font-semibold transition disabled:opacity-50 ${
                        p.is_featured === 'true'
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {p.is_featured === 'true' ? '🌟 Exhibir' : '🌟'}
                    </button>
                    <button
                      onClick={() => handleToggleNew(p)}
                      disabled={saving[p.id_key]}
                      title={p.is_new === 'true' ? 'Quitar de Lo nuevo' : 'Marcar como Lo nuevo'}
                      className={`px-3 py-1.5 rounded text-sm font-semibold transition disabled:opacity-50 ${
                        p.is_new === 'true'
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {p.is_new === 'true' ? '✨ Nuevo' : '✨'}
                    </button>
                    <button
                      onClick={() => handleToggleActive(p)}
                      disabled={saving[p.id_key]}
                      title={isInactive ? 'Mostrar en catálogo' : 'Ocultar del catálogo'}
                      className={`px-3 py-1.5 rounded text-sm font-semibold transition disabled:opacity-50 ${
                        isInactive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      {isInactive ? '👁️ Mostrar' : '🙈 Ocultar'}
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="bg-red-100 text-red-600 px-3 py-1.5 rounded text-sm font-semibold hover:bg-red-200 transition"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-4 text-sm text-gray-400">{filtered.length} de {products.length} productos</p>
    </div>
  )
}
