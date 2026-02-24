import { useToastStore } from '../stores/toastStore'

export default function Toast() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-slide-in bg-white border border-gray-200 shadow-2xl rounded-xl flex items-center gap-3 px-4 py-3 w-72 pointer-events-auto"
        >
          {/* Imagen del producto */}
          {toast.image_path ? (
            <img
              src={`/products/${toast.image_path}`}
              alt=""
              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
              &#9835;
            </div>
          )}

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-gray-800 leading-tight line-clamp-2">{toast.name}</p>
            <p className="text-[11px] text-green-600 font-semibold mt-1 flex items-center gap-1">
              <span className="text-base leading-none">&#10003;</span> Agregado al carrito
            </p>
          </div>

          {/* Cerrar */}
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-300 hover:text-gray-500 text-xl ml-1 flex-shrink-0 leading-none"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}
