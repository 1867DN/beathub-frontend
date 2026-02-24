import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ordersAPI } from '../../api/services'
import { useAuthStore } from '../../stores/authStore'
import { formatARS } from '../../utils/format'

const STATUS_MAP = {
  PENDING:          { label: 'En proceso',        color: 'bg-yellow-100 text-yellow-800',  icon: '🕐' },
  APPROVED:         { label: 'Aprobado',           color: 'bg-green-100 text-green-800',    icon: '✅' },
  IN_PROGRESS:      { label: 'En camino',          color: 'bg-blue-100 text-blue-800',      icon: '🚚' },
  DELIVERED:        { label: 'Entregado',          color: 'bg-emerald-100 text-emerald-800', icon: '📦' },
  CANCELED:         { label: 'Cancelado',          color: 'bg-red-100 text-red-800',        icon: '❌' },
  RETURN_REQUESTED: { label: 'Devolución solicitada', color: 'bg-orange-100 text-orange-800', icon: '↩️' },
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

export default function Seguimiento() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  // State passed from Checkout on success
  const orderSuccess = location.state?.orderSuccess
  const newOrderId = location.state?.orderId
  const newBillNumber = location.state?.billNumber

  // Initial fetch
  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    ordersAPI.getMyOrders()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : []
        setOrders(data)
        if (orderSuccess && newOrderId) setExpandedId(newOrderId)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate, orderSuccess, newOrderId])

  // Auto-poll for the new order until it leaves PENDING (instant-approval flow)
  useEffect(() => {
    if (!orderSuccess || !newOrderId) return
    let attempts = 0
    const MAX_ATTEMPTS = 14 // ~35 seconds total, covers 30s BANK_TRANSFER delay
    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await ordersAPI.getMyOrders()
        const updated = Array.isArray(res.data) ? res.data : []
        setOrders(updated)
        const newOrder = updated.find(o => o.id === newOrderId)
        if (!newOrder || newOrder.status !== 'PENDING' || attempts >= MAX_ATTEMPTS) {
          clearInterval(interval)
        }
      } catch (_) {
        clearInterval(interval)
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [orderSuccess, newOrderId])

  const handleCancel = async (orderId) => {
    if (!window.confirm('¿Estás seguro que querés cancelar este pedido?')) return
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

  const handleReturn = async (orderId) => {
    if (!window.confirm('¿Querés solicitar la devolución de este pedido? Nos pondremos en contacto a la brevedad.')) return
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-5xl animate-pulse mb-4">📦</div>
          <p className="text-gray-500">Cargando tus órdenes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Mis Compras</h1>
      <p className="text-gray-500 mb-8">Revisá el estado de tus pedidos</p>

      {/* Success banner */}
      {orderSuccess && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="text-4xl">🎉</div>
          <div>
            <p className="font-bold text-green-800 text-lg">¡Pedido realizado con éxito!</p>
            <p className="text-green-700 text-sm mt-0.5">
              Tu pedido <strong>#{newOrderId}</strong> fue registrado.
              {newBillNumber && <> Número de factura: <strong>{newBillNumber}</strong>.</>} Recibirás un correo de confirmación cuando tu pago sea aprobado.
            </p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛍️</div>
          <p className="text-gray-500 text-lg">Todavía no realizaste ninguna compra.</p>
          <button onClick={() => navigate('/productos')}
            className="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition"
          >
            Ir a la tienda
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = STATUS_MAP[order.status] || STATUS_MAP.PENDING
            const isExpanded = expandedId === order.id
            const isNew = order.id === newOrderId && orderSuccess

            return (
              <div key={order.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition ${isNew ? 'ring-2 ring-green-400' : ''}`}>
                {/* Header row */}
                <div
                  className="flex flex-wrap items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => { setExpandedId(isExpanded ? null : order.id); setActionError(null) }}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${status.color}`}>
                    {status.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">Pedido #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {order.date ? new Date(order.date).toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' }) : '—'}
                      {order.bill_number && <> · Factura: <span className="font-mono">{order.bill_number}</span></>}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <p className="font-bold text-primary text-lg">{formatARS(order.total)}</p>
                    <p className="text-xs text-gray-400">{(order.items || []).length} producto{(order.items || []).length !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Status badge */}
                  <StatusBadge status={order.status} />

                  <span className="text-gray-300 text-sm">{isExpanded ? '▲' : '▼'}</span>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t px-5 pb-6 pt-4 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Items */}
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Productos</p>
                        <div className="space-y-2">
                          {(order.items || []).map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                              <span className="font-medium">{formatARS(item.unit_price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary */}
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Resumen</p>
                        <div className="space-y-1.5 text-sm">
                          {order.subtotal != null && (
                            <div className="flex justify-between text-gray-600">
                              <span>Subtotal</span>
                              <span>{formatARS(order.subtotal)}</span>
                            </div>
                          )}
                          {order.iva != null && (
                            <div className="flex justify-between text-gray-600">
                              <span>IVA (21%)</span>
                              <span>{formatARS(order.iva)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-primary border-t pt-1.5">
                            <span>Total</span>
                            <span>{formatARS(order.total)}</span>
                          </div>
                          {order.payment_type && (
                            <div className="flex justify-between text-gray-500 pt-1">
                              <span>Método de pago</span>
                              <span>{PAYMENT_LABELS[order.payment_type] || order.payment_type}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {actionError && (
                      <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{actionError}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-3">
                      {['PENDING', 'APPROVED', 'IN_PROGRESS'].includes(order.status) && (
                        <button
                          disabled={actionLoadingId === order.id}
                          onClick={() => handleCancel(order.id)}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition disabled:opacity-50"
                        >
                          {actionLoadingId === order.id ? 'Procesando...' : '❌ Cancelar pedido'}
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
  )
}
