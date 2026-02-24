export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <div className="text-center mb-12">
        <span className="text-5xl mb-4 block">🎵</span>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Contacto</h1>
        <p className="text-gray-500 text-lg">¿Tenés alguna pregunta o consulta? Estamos para ayudarte.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border shadow-sm p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 text-2xl">
            ✉️
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Email oficial</p>
            <a
              href="mailto:beathuboficial@gmail.com"
              className="text-secondary font-semibold text-base hover:underline"
            >
              beathuboficial@gmail.com
            </a>
            <p className="text-xs text-gray-400 mt-0.5">Consultas generales, pedidos, devoluciones</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-2xl">
            👤
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Desarrollador</p>
            <a
              href="mailto:leandro_mojang27@hotmail.com"
              className="text-blue-600 font-semibold text-base hover:underline"
            >
              leandro_mojang27@hotmail.com
            </a>
            <p className="text-xs text-gray-400 mt-0.5">Problemas técnicos o errores en la plataforma</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-2xl">
            📱
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Teléfono / WhatsApp</p>
            <a
              href="tel:+5493772584894"
              className="text-green-600 font-semibold text-base hover:underline"
            >
              +54 9 3772 584894
            </a>
            <p className="text-xs text-gray-400 mt-0.5">Lunes a viernes de 9:00 a 18:00 hs</p>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-gray-50 rounded-2xl border p-6 text-center">
        <p className="text-sm text-gray-500">
          Intentamos responder todas las consultas en menos de <span className="font-semibold text-gray-700">24 horas hábiles</span>.
          Para consultas sobre el estado de tu pedido, ingresá a tu cuenta y revisá la sección <span className="font-semibold text-gray-700">Mis Compras</span>.
        </p>
      </div>
    </div>
  )
}
