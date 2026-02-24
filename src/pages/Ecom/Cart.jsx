import { useNavigate, Link } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { formatARS } from '../../utils/format'

const FREE_SHIPPING_THRESHOLD = 70000
const SHIPPING_COST = 30000

export default function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-3xl font-bold mb-4 text-secondary">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-8">Explora nuestro catálogo y agrega productos</p>
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-primary to-green-600 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105"
        >
          ← Continuar comprando
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-2">🛒 Mi Carrito</h1>
        <p className="text-gray-100">{items.length} producto{items.length !== 1 ? 's' : ''} en tu carrito</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-5 flex gap-5">
              {/* Imagen del producto */}
              <div className="w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden bg-gray-100">
                {item.image_path ? (
                  <img
                    src={`/products/${item.image_path}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">&#9835;</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.id}`} className="font-bold text-base text-secondary mb-1 leading-snug hover:text-primary transition line-clamp-2 block">{item.name}</Link>
                <p className="text-gray-500 text-sm mb-3">
                  Precio unitario: <span className="font-semibold text-primary">{formatARS(item.price)}</span>
                </p>

                {/* Control de cantidad */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-semibold text-gray-700">Cantidad:</span>
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 text-primary font-bold hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.stock ?? 9999}
                      value={item.quantity}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(parseInt(e.target.value) || 1, item.stock ?? 9999))
                        updateQuantity(item.id, val)
                      }}
                      className="border-l border-r border-gray-300 px-3 py-1 w-14 text-center focus:outline-none text-sm"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= (item.stock ?? 9999)}
                      className="px-3 py-1 text-primary font-bold hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  {item.stock != null && item.quantity >= item.stock && (
                    <span className="text-xs text-orange-500 font-semibold">Máx. stock</span>
                  )}
                </div>

                {/* Eliminar */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-600 hover:underline text-xs font-semibold flex items-center gap-1 transition"
                >
                  🗑️ Eliminar del carrito
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-right flex flex-col justify-between flex-shrink-0">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Subtotal</p>
                  <p className="text-xl font-bold text-primary">{formatARS(item.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-8 sticky top-8">
            <h2 className="text-2xl font-bold mb-6 text-secondary">Resumen de Compra</h2>

            {(() => {
              const subtotal = getTotal()
              const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
              const shipping = freeShipping ? 0 : SHIPPING_COST
              const subtotalConIva = subtotal * 1.21
              const total = subtotalConIva + shipping
              return (
                <>
                  <div className="space-y-4 mb-6 border-b pb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal ({items.length} producto{items.length !== 1 ? 's' : ''}):</span>
                      <span className="font-semibold">{formatARS(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Impuestos (aprox):</span>
                      <span className="font-semibold">{formatARS(subtotal * 0.21)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Envío:</span>
                      {freeShipping
                        ? <span className="font-semibold text-green-600">Gratis 🚚</span>
                        : <span className="font-semibold text-orange-600">{formatARS(SHIPPING_COST)}</span>
                      }
                    </div>
                    {!freeShipping && (
                      <p className="text-xs text-gray-400">
                        Sumá <span className="font-semibold text-primary">{formatARS(FREE_SHIPPING_THRESHOLD - subtotal)}</span> más para obtener envío gratis
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xl font-bold mb-8 text-secondary">
                    <span>Total:</span>
                    <span className="text-3xl text-primary">{formatARS(total)}</span>
                  </div>
                </>
              )
            })()}

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-gradient-to-r from-primary to-green-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105 mb-3"
              >
                ✓ Ir a Checkout
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-primary to-green-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105 mb-3"
              >
                🔐 Inicia sesión para continuar
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full border-2 border-primary text-primary py-2 rounded-lg font-semibold hover:bg-primary/5 transition mb-3"
            >
              ← Continuar comprando
            </button>

            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) clearCart()
              }}
              className="w-full text-red-400 hover:text-red-600 hover:underline text-sm font-semibold transition"
            >
              🗑️ Vaciar carrito
            </button>

            <div className="mt-8 pt-6 border-t text-xs text-gray-500 space-y-2">
              <p>✓ Envío gratis en compras mayores a {formatARS(FREE_SHIPPING_THRESHOLD)}</p>
              <p>✓ 30 días de garantía</p>
              <p>✓ Soporte 24/7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
