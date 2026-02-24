import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ordersAPI } from '../../api/services'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { formatARS } from '../../utils/format'

const PAYMENT_METHODS = [
  { id: 'MERCADOPAGO', label: 'MercadoPago', icon: '💳', desc: 'Pagá con tu cuenta de MercadoPago' },
  { id: 'BANK_TRANSFER', label: 'Transferencia Bancaria', icon: '🏦', desc: 'CBU / Alias al confirmar' },
  { id: 'PAYPAL', label: 'PayPal', icon: '🅿️', desc: 'Pagá con tu cuenta de PayPal' },
  { id: 'CREDIT', label: 'Tarjeta de Crédito', icon: '💳', desc: 'Visa, Mastercard, Naranja, etc.' },
  { id: 'DEBIT', label: 'Tarjeta de Débito', icon: '🏧', desc: 'Débito bancario inmediato' },
]

const CARD_METHODS = ['CREDIT', 'DEBIT']
const IVA_RATE = 0.21

export default function Checkout() {
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('MERCADOPAGO')
  const [address, setAddress] = useState({ street: '', number: '', city: '' })
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })

  if (!isAuthenticated) { navigate('/login'); return null }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl font-bold mb-4">🛒 Tu carrito está vacío</p>
        <button onClick={() => navigate('/productos')} className="bg-primary text-white px-6 py-2 rounded hover:bg-green-600 transition">
          Ver productos
        </button>
      </div>
    )
  }

  const subtotal = getTotal()
  const iva = Math.round(subtotal * IVA_RATE * 100) / 100
  const total = Math.round((subtotal + iva) * 100) / 100
  const showCardForm = CARD_METHODS.includes(paymentMethod)

  const handleCardInput = (field, value) => {
    if (field === 'number') value = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
    if (field === 'expiry') value = value.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')
    if (field === 'cvv') value = value.replace(/\D/g, '').slice(0, 4)
    setCard(c => ({ ...c, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      setLoading(true)
      const res = await ordersAPI.placeOrder({
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity, unit_price: i.price })),
        address: { street: address.street, number: address.number, city: address.city },
        payment_type: paymentMethod,
      })
      clearCart()
      navigate('/profile', { state: { orderSuccess: true, orderId: res.data.order_id, billNumber: res.data.bill_number } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la orden. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">📋 Checkout</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {/* Dirección */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-5">📍 Dirección de Envío</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Calle *" value={address.street}
                  onChange={e => setAddress(a => ({...a, street: e.target.value}))} required
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Número" value={address.number}
                    onChange={e => setAddress(a => ({...a, number: e.target.value}))}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  <input type="text" placeholder="Ciudad *" value={address.city}
                    onChange={e => setAddress(a => ({...a, city: e.target.value}))} required
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-5">💰 Método de Pago</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {PAYMENT_METHODS.map(m => (
                  <button type="button" key={m.id} onClick={() => setPaymentMethod(m.id)}
                    className={`p-4 rounded-xl border-2 text-left transition ${
                      paymentMethod === m.id ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      <span>{m.icon}</span> {m.label}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
                  </button>
                ))}
              </div>

              {showCardForm && (
                <div className="bg-gray-50 rounded-xl p-5 space-y-4 border">
                  <p className="text-sm font-semibold text-gray-600">Datos de la Tarjeta</p>
                  <input type="text" placeholder="Número de tarjeta" value={card.number}
                    onChange={e => handleCardInput('number', e.target.value)} maxLength={19} required={showCardForm}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono tracking-widest" />
                  <input type="text" placeholder="Nombre en la tarjeta" value={card.name}
                    onChange={e => setCard(c => ({...c, name: e.target.value.toUpperCase()}))} required={showCardForm}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Vencimiento MM/AA" value={card.expiry}
                      onChange={e => handleCardInput('expiry', e.target.value)} maxLength={5} required={showCardForm}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="text" placeholder="CVV" value={card.cvv}
                      onChange={e => handleCardInput('cvv', e.target.value)} maxLength={4} required={showCardForm}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <p className="text-xs text-gray-400">🔒 Demo: podés ingresar cualquier número ficticio.</p>
                </div>
              )}
              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-sm text-blue-700">
                  <strong>Datos bancarios:</strong> Recibirás un email con el CBU / Alias al confirmar tu orden.
                </div>
              )}
              {paymentMethod === 'MERCADOPAGO' && (
                <div className="bg-sky-50 rounded-xl p-4 border border-sky-200 text-sm text-sky-700">
                  Serás redirigido a MercadoPago para completar el pago al confirmar.
                </div>
              )}
              {paymentMethod === 'PAYPAL' && (
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 text-sm text-indigo-700">
                  Serás redirigido a PayPal para completar el pago al confirmar.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — resumen */}
          <div className="bg-white rounded-xl shadow p-6 h-fit sticky top-6">
            <h2 className="text-xl font-bold mb-5">🧾 Resumen</h2>
            <div className="space-y-3 mb-4 border-b pb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="flex-1 pr-2 text-gray-700">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                  <span className="font-medium">{formatARS(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 mb-4 border-b pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal:</span><span>{formatARS(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Envío:</span><span className="text-green-600 font-medium">Gratis</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">IVA (21%):</span><span>{formatARS(iva)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total:</span><span className="text-primary">{formatARS(total)}</span>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-600 transition disabled:bg-gray-400 text-base"
            >
              {loading ? 'Procesando...' : '✅ Confirmar Orden'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">Al confirmar recibirás un email de confirmación.</p>
          </div>

        </div>
      </form>
    </div>
  )
}
