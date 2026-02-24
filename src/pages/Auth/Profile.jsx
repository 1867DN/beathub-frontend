import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import apiClient from '../../api/client'
import { authAPI, ordersAPI } from '../../api/services'
import { formatARS } from '../../utils/format'

// ── Order status config ─────────────────────────────────────────────────────
const STATUS_MAP = {
  PENDING:          { label: 'En proceso',            color: 'bg-yellow-100 text-yellow-800',   icon: '🕐' },
  APPROVED:         { label: 'Aprobado',               color: 'bg-green-100 text-green-800',     icon: '✅' },
  IN_PROGRESS:      { label: 'En camino',              color: 'bg-blue-100 text-blue-800',       icon: '🚚' },
  DELIVERED:        { label: 'Entregado',              color: 'bg-emerald-100 text-emerald-800', icon: '📦' },
  CANCELED:         { label: 'Cancelado',              color: 'bg-red-100 text-red-800',         icon: '❌' },
  RETURN_REQUESTED: { label: 'Devolución solicitada',  color: 'bg-orange-100 text-orange-800',   icon: '↩️' },
}

const PAYMENT_LABELS = {
  CASH: 'Efectivo', CARD: 'Tarjeta', DEBIT: 'Débito',
  CREDIT: 'Crédito', BANK_TRANSFER: 'Transferencia',
  MERCADOPAGO: 'MercadoPago', PAYPAL: 'PayPal',
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.PENDING
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${s.color}`}>
      {s.icon} {s.label}
    </span>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, setUser } = useAuthStore()

  // State passed from Checkout on success
  const orderSuccess  = location.state?.orderSuccess
  const newOrderId    = location.state?.orderId
  const newBillNumber = location.state?.billNumber

  // Tab: 'info' | 'orders'
  const [tab, setTab] = useState(orderSuccess ? 'orders' : 'info')

  // Profile info
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [userData, setUserData] = useState({
    name: user?.name || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
  })

  // Orders
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [expandedId, setExpandedId] = useState(orderSuccess && newOrderId ? newOrderId : null)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  // ── Fetch profile + orders ──
  useEffect(() => {
    authAPI.getProfile()
      .then(res => {
        const u = res.data
        setUser(u)
        setUserData({ name: u.name || '', lastname: u.lastname || '', email: u.email || '', telephone: u.telephone || '' })
      })
      .catch(console.error)
      .finally(() => setLoadingProfile(false))

    ordersAPI.getMyOrders()
      .then(res => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoadingOrders(false))
  }, [])

  // ── Poll until new order leaves PENDING (instant-approval flow) ──
  useEffect(() => {
    if (!orderSuccess || !newOrderId) return
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await ordersAPI.getMyOrders()
        const updated = Array.isArray(res.data) ? res.data : []
        setOrders(updated)
        const ord = updated.find(o => o.id === newOrderId)
        if (!ord || ord.status !== 'PENDING' || attempts >= 14) clearInterval(interval)
      } catch { clearInterval(interval) }
    }, 2500)
    return () => clearInterval(interval)
  }, [orderSuccess, newOrderId])

  // ── Save profile ──
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaveError('')
    try {
      const res = await apiClient.put(`/clients/${user.id_key}/`, userData)
      setUser(res.data)
      setEditMode(false)
    } catch {
      setSaveError('Error al actualizar el perfil.')
    }
  }

  // ── Cancel order ──
  const handleCancel = async (orderId, orderStatus) => {
    const msg = orderStatus === 'IN_PROGRESS'
      ? '¿Confirmás que no querés recibir el paquete? El pedido se cancelará y el stock volverá a la tienda.'
      : '¿Estás seguro que querés cancelar este pedido?'
    if (!window.confirm(msg)) return
    setActionLoadingId(orderId)
    setActionError(null)
    try {
      await ordersAPI.cancel(orderId)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELED' } : o))
    } catch (err) {
      setActionError(err.response?.data?.detail || 'No se pudo cancelar el pedido.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // ── Request return ──
  const handleReturn = async (orderId) => {
    if (!window.confirm('¿Querés solicitar la devolución? Nos pondremos en contacto a la brevedad.')) return
    setActionLoadingId(orderId)
    setActionError(null)
    try {
      await ordersAPI.requestReturn(orderId)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'RETURN_REQUESTED' } : o))
    } catch (err) {
      setActionError(err.response?.data?.detail || 'No se pudo solicitar la devolución.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">👤 Mi Cuenta</h1>
        <p className="text-gray-500 mt-1">
          Hola, <span className="font-semibold text-gray-700">{user?.name} {user?.lastname}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-8">
        {[
          { id: 'info',   label: '👤 Mi Información' },
          { id: 'orders', label: `🛍️ Mis Compras${orders.length ? ` (${orders.length})` : ''}` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: MI INFORMACIÓN ──────────────────────────────────────────── */}
      {tab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Datos personales */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-5">Información Personal</h2>

            {loadingProfile ? (
              <p className="text-gray-400 text-sm animate-pulse">Cargando...</p>
            ) : editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                {saveError && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{saveError}</p>}
                {[
                  { field: 'name',      label: 'Nombre',   type: 'text' },
                  { field: 'lastname',  label: 'Apellido', type: 'text' },
                  { field: 'email',     label: 'Email',    type: 'email' },
                  { field: 'telephone', label: 'Teléfono', type: 'tel' },
                ].map(({ field, label, type }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                    <input
                      type={type}
                      value={userData[field]}
                      onChange={e => setUserData(p => ({ ...p, [field]: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition">
                    Guardar
                  </button>
                  <button type="button" onClick={() => { setEditMode(false); setSaveError('') }}
                    className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <dl className="space-y-3 text-sm">
                  {[
                    ['Nombre',   `${user?.name || ''} ${user?.lastname || ''}`.trim()],
                    ['Email',    user?.email],
                    ['Teléfono', user?.telephone || '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                      <dt className="font-semibold text-gray-500">{k}</dt>
                      <dd className="text-gray-800">{v}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between items-center">
                    <dt className="font-semibold text-gray-500">Rol</dt>
                    <dd>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user?.role === 'admin' ? '⭐ Admin' : '👤 Usuario'}
                      </span>
                    </dd>
                  </div>
                </dl>
                <button onClick={() => setEditMode(true)}
                  className="mt-5 w-full bg-primary text-white py-2 rounded-lg font-semibold text-sm hover:bg-green-600 transition">
                  Editar Perfil
                </button>
              </>
            )}
          </div>

          {/* Zona Relax */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col">
            <h2 className="text-xl font-bold mb-2">🎵 Zona Relax</h2>
            <p className="text-gray-500 text-sm mb-5 flex-1">
              Vinculá tu cuenta de Spotify y accedé a toda la música que te encanta en un solo lugar.
            </p>
            <button onClick={() => navigate('/relax')}
              className="w-full bg-[#1DB954] text-white font-bold py-2.5 rounded-lg hover:bg-[#1ed760] transition text-sm">
              🎵 Ir a Relax
            </button>
          </div>

        </div>
      )}

      {/* ── TAB: MIS COMPRAS ─────────────────────────────────────────────── */}
      {tab === 'orders' && (
        <div>

          {/* Success banner */}
          {orderSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex gap-4 items-start">
              <div className="text-3xl">🎉</div>
              <div>
                <p className="font-bold text-green-800">¡Pedido realizado con éxito!</p>
                <p className="text-green-700 text-sm mt-0.5">
                  Tu pedido <strong>#{newOrderId}</strong> fue registrado.
                  {newBillNumber && <> Factura: <strong className="font-mono">{newBillNumber}</strong>.</>}
                  {' '}Recibirás un correo de confirmación cuando tu pago sea aprobado.
                </p>
              </div>
            </div>
          )}

          {loadingOrders ? (
            <div className="text-center py-16">
              <div className="text-4xl animate-pulse mb-3">📦</div>
              <p className="text-gray-400">Cargando tus compras...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🛍️</div>
              <p className="text-gray-500 mb-4">Todavía no realizaste ninguna compra.</p>
              <button onClick={() => navigate('/productos')}
                className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition">
                Ir a la tienda
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const s = STATUS_MAP[order.status] || STATUS_MAP.PENDING
                const isExpanded = expandedId === order.id
                const isNew = order.id === newOrderId && orderSuccess

                return (
                  <div key={order.id}
                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-shadow hover:shadow-md ${isNew ? 'ring-2 ring-green-400' : ''}`}
                  >
                    {/* Row */}
                    <div
                      className="flex flex-wrap items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/70 transition"
                      onClick={() => { setExpandedId(isExpanded ? null : order.id); setActionError(null) }}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${s.color}`}>
                        {s.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">
                          Pedido <span className="font-mono text-primary">#{order.id}</span>
                          {order.bill_number && (
                            <span className="ml-2 text-xs font-normal text-gray-400 font-mono">· {order.bill_number}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.date
                            ? new Date(order.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
                            : '—'}
                          {' · '}{(order.items || []).length} producto{(order.items || []).length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <p className="font-bold text-primary shrink-0">{formatARS(order.total)}</p>

                      <StatusBadge status={order.status} />

                      <span className="text-gray-300 text-sm">{isExpanded ? '▲' : '▼'}</span>
                    </div>

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="border-t px-5 pb-6 pt-4 bg-gray-50/60">
                        <div className="grid md:grid-cols-2 gap-5 mb-5">

                          {/* Products list */}
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Productos</p>
                            <div className="space-y-2">
                              {(order.items || []).map((item, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-2.5 border">
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                    {item.image_path ? (
                                      <>
                                        <img
                                          src={`/products/${item.image_path}`}
                                          alt={item.name}
                                          className="w-full h-full object-contain"
                                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                                        />
                                        <span className="text-xl hidden items-center justify-center w-full h-full">🎵</span>
                                      </>
                                    ) : (
                                      <span className="text-xl">🎵</span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                                    <p className="text-xs text-gray-400">× {item.quantity} · {formatARS(item.unit_price)} c/u</p>
                                  </div>
                                  <p className="text-sm font-bold text-gray-700 shrink-0">{formatARS(item.unit_price * item.quantity)}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order summary */}
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Resumen</p>
                            <div className="bg-white rounded-xl border p-4 space-y-2 text-sm">
                              {order.subtotal != null && (
                                <div className="flex justify-between text-gray-600">
                                  <span>Subtotal (sin IVA)</span>
                                  <span>{formatARS(order.subtotal)}</span>
                                </div>
                              )}
                              {order.iva != null && (
                                <div className="flex justify-between text-gray-600">
                                  <span>IVA (21%)</span>
                                  <span>{formatARS(order.iva)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold text-primary border-t pt-2 text-base">
                                <span>Total</span>
                                <span>{formatARS(order.total)}</span>
                              </div>
                              {order.payment_type && (
                                <div className="flex justify-between text-gray-500 text-xs pt-1 border-t">
                                  <span>Método de pago</span>
                                  <span className="font-semibold">{PAYMENT_LABELS[order.payment_type] || order.payment_type}</span>
                                </div>
                              )}
                              {order.bill_number && (
                                <div className="flex justify-between text-gray-400 text-xs">
                                  <span>Factura</span>
                                  <span className="font-mono">{order.bill_number}</span>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* Actions */}
                        {actionError && (
                          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{actionError}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {['PENDING', 'APPROVED'].includes(order.status) && (
                            <button
                              disabled={actionLoadingId === order.id}
                              onClick={() => handleCancel(order.id, order.status)}
                              className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition disabled:opacity-50"
                            >
                              {actionLoadingId === order.id ? 'Procesando...' : '❌ Cancelar pedido'}
                            </button>
                          )}
                          {order.status === 'IN_PROGRESS' && (
                            <button
                              disabled={actionLoadingId === order.id}
                              onClick={() => handleCancel(order.id, order.status)}
                              className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition disabled:opacity-50"
                            >
                              {actionLoadingId === order.id ? 'Procesando...' : '📦 No recibir paquete'}
                            </button>
                          )}
                          {order.status === 'DELIVERED' && (
                            <button
                              disabled={actionLoadingId === order.id}
                              onClick={() => handleReturn(order.id)}
                              className="px-4 py-2 rounded-xl text-sm font-semibold bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition disabled:opacity-50"
                            >
                              {actionLoadingId === order.id ? 'Procesando...' : '↩️ Solicitar devolución'}
                            </button>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

