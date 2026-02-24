import { useState, useEffect } from 'react'
import { ordersAPI } from '../../api/services'
import { formatARS } from '../../utils/format'

const STATUS_MAP = {
  PENDING:          { label: 'En proceso',     color: 'bg-yellow-100 text-yellow-800',   icon: '🕐' },
  APPROVED:         { label: 'Aprobado',        color: 'bg-green-100 text-green-800',     icon: '✅' },
  IN_PROGRESS:      { label: 'En camino',       color: 'bg-blue-100 text-blue-800',       icon: '🚚' },
  DELIVERED:        { label: 'Entregado',       color: 'bg-emerald-100 text-emerald-800', icon: '📦' },
  CANCELED:         { label: 'Cancelado',       color: 'bg-red-100 text-red-800',         icon: '❌' },
  RETURN_REQUESTED: { label: 'Dev. solicitada', color: 'bg-orange-100 text-orange-800',   icon: '↩️' },
}

const PAYMENT_LABELS = {
  CASH: 'Efectivo', CARD: 'Tarjeta', DEBIT: 'Débito',
  CREDIT: 'Crédito', BANK_TRANSFER: 'Transferencia',
  MERCADOPAGO: 'MercadoPago', PAYPAL: 'PayPal',
}

const NEXT_STATUS = {
  APPROVED:    { value: 'IN_PROGRESS', label: '🚚 Marcar en camino', cls: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  IN_PROGRESS: { value: 'DELIVERED',   label: '📦 Marcar entregado', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.PENDING
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${s.color}`}>
      {s.icon} {s.label}
    </span>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [expandedId, setExpandedId] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [actionFeedback, setActionFeedback] = useState({})

  useEffect(() => {
    ordersAPI.adminGetAll()
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const setFeedback = (orderId, type, msg) => {
    setActionFeedback(prev => ({ ...prev, [orderId]: { type, msg } }))
    setTimeout(() => setActionFeedback(prev => {
      const n = { ...prev }
      delete n[orderId]
      return n
    }), 5000)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setActionLoadingId(orderId)
    try {
      await ordersAPI.adminUpdateStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      setFeedback(orderId, 'success', 'Estado actualizado correctamente.')
    } catch (err) {
      setFeedback(orderId, 'error', err.response?.data?.detail || 'Error al actualizar el estado.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleContactReturn = async (orderId) => {
    setActionLoadingId(orderId)
    try {
      await ordersAPI.adminContactReturn(orderId)
      setFeedback(orderId, 'success', '✉️ Email de instrucciones enviado al usuario.')
    } catch (err) {
      setFeedback(orderId, 'error', err.response?.data?.detail || 'Error al enviar el email.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const visible = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus)

  if (loading) return (
    <div className="text-center py-20"><div className="animate-spin text-5xl">⚙️</div></div>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">📦 Gestión de Órdenes</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {[{ value: 'ALL', label: `Todas (${orders.length})` }, ...Object.entries(STATUS_MAP).map(([val, s]) => ({
          value: val,
          label: `${s.icon} ${s.label} (${orders.filter(o => o.status === val).length})`
        }))].map(f => (
          <button key={f.value} onClick={() => setFilterStatus(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filterStatus === f.value ? 'bg-secondary text-white shadow' : 'bg-white border hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No hay órdenes</div>
      ) : (
        <div className="space-y-3">
          {visible.map(order => {
            const isExpanded = expandedId === order.id
            const feedback = actionFeedback[order.id]
            const nextStep = NEXT_STATUS[order.status]
            const isLoading = actionLoadingId === order.id

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div
                  className="flex flex-wrap items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                      {STATUS_MAP[order.status]?.icon || '📋'}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">
                        {order.client?.name}
                        <span className="font-normal text-gray-400 ml-1.5 text-xs">{order.client?.email}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Pedido <span className="font-mono font-semibold text-gray-600">#{order.id}</span>
                        {order.bill_number && <><span className="mx-1">·</span><span className="font-mono">{order.bill_number}</span></>}
                        <span className="mx-1">·</span>
                        {order.date ? new Date(order.date).toLocaleDateString('es-AR') : '—'}
                        <span className="mx-1">·</span>
                        {(order.items || []).length} producto{(order.items || []).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-primary text-sm shrink-0">{formatARS(order.total)}</span>
                  <StatusBadge status={order.status} />
                  <span className="text-gray-300 text-sm">{isExpanded ? '▲' : '▼'}</span>
                </div>

                {isExpanded && (
                  <div className="border-t bg-gray-50 px-6 pt-6 pb-6">
                    <div className="grid md:grid-cols-2 gap-5 mb-5">
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

                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Resumen</p>
                        <div className="bg-white rounded-xl border p-4 space-y-2.5">
                          {(() => {
                            const sub = order.subtotal ?? (order.total / 1.21)
                            const iva = order.iva ?? (order.total - sub)
                            return (
                              <>
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>Subtotal (sin IVA)</span><span>{formatARS(sub)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>IVA (21%)</span><span>{formatARS(iva)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t">
                                  <span>Total</span>
                                  <span className="text-primary">{formatARS(order.total)}</span>
                                </div>
                              </>
                            )
                          })()}
                          <div className="flex justify-between text-xs text-gray-500 pt-1">
                            <span>Pago</span>
                            <span className="font-semibold">{PAYMENT_LABELS[order.payment_type] || order.payment_type}</span>
                          </div>
                          {order.bill_number && (
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Factura</span>
                              <span className="font-mono">{order.bill_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {feedback && (
                      <p className={`mb-3 text-sm rounded-lg px-4 py-2 ${
                        feedback.type === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {feedback.msg}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {nextStep && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleStatusChange(order.id, nextStep.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition disabled:opacity-50 ${nextStep.cls}`}
                        >
                          {isLoading ? 'Procesando...' : nextStep.label}
                        </button>
                      )}
                      {order.status === 'RETURN_REQUESTED' && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleContactReturn(order.id)}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition disabled:opacity-50"
                        >
                          {isLoading ? 'Enviando...' : '✉️ Contactar usuario'}
                        </button>
                      )}
                      {!nextStep && order.status !== 'RETURN_REQUESTED' && (
                        <p className="text-xs text-gray-400 italic py-2">
                          {order.status === 'DELIVERED' && 'Pedido completado. No hay acciones disponibles.'}
                          {order.status === 'CANCELED' && 'Pedido cancelado. No hay acciones disponibles.'}
                          {order.status === 'PENDING' && 'Esperando aprobación automática del sistema.'}
                        </p>
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
