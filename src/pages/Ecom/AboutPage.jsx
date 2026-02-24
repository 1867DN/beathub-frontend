export default function AboutPage() {
return (
    /*
      Full-bleed full-viewport: same technique as the carousel.
      -mx-4 md:-mx-6 cancels the Layout <main> padding,
      -my-8 cancels the vertical padding,
      then we control everything inside.
    */
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: 'calc(100vh - 9.5rem)',
        width: '100%',
        background: 'linear-gradient(to bottom, #79edd6, #a5efa2)',
      }}
    >
      {/* Content: two-column layout on desktop, single column on mobile */}
      <div className="w-full max-w-6xl mx-auto px-8 md:px-16 py-12 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT — brand + intro */}
        <div>
          <h1 className="text-6xl font-extrabold tracking-tight leading-none mb-2" style={{ color: '#000000' }}>
            Beat<span style={{ color: '#328c2f' }}>Hub</span>
            <span className="text-4xl" style={{ color: '#000000' }}>.ar</span>
          </h1>
          <div className="h-1 w-20 rounded-full mb-6" style={{ background: '#0b0b0b', opacity: 0.5 }} />

          {/* ── TEXTO IZQUIERDA — editá estos párrafos a gusto ── */}
          <p className="text-lg leading-relaxed mb-4" style={{ color: '#0b0b0b' }}>
            BeatHub nació como un proyecto personal de alguien al que le gusta la música en todas sus formas:
            escuchar, descubrir, tocar y compartir.
          </p>
          <p className="text-base leading-relaxed" style={{ color: '#0b0b0b' }}>
            Lo que empezó como un ejercicio de desarrollo terminó convirtiéndose en un lugar real
            donde todo lo relacionado con el sonido se reúne en un solo sitio.
          </p>

        </div>

        {/* RIGHT — feature cards + cierre */}
        <div className="space-y-5">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 flex gap-4 items-start shadow-sm">
            <span className="text-3xl">🛒</span>
            <div>
              {/* ── CARD 1 — editá título y descripción ── */}
              <h3 className="font-bold text-base mb-1" style={{ color: '#0b0b0b' }}>Ecommerce funcional</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#0b0b0b' }}>
                Podemos encontrar merchandising, accesorios, instrumentos y todo lo que un músico o fan
                necesita — con precios en pesos argentinos y opciones de pago accesibles.
              </p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 flex gap-4 items-start shadow-sm">
            <span className="text-3xl">🎧</span>
            <div>
              {/* ── CARD 2 — editá título y descripción ── */}
              <h3 className="font-bold text-base mb-1" style={{ color: '#0b0b0b' }}>Hub Relax</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#0b0b0b' }}>
                Conectá tus cuentas de streaming, mirá estadísticas de escucha, descubrí
                recomendaciones y tené todo a mano en un solo lugar.
              </p>
            </div>
          </div>

          {/* ── CIERRE — editá este párrafo ── */}
          <p className="text-sm leading-relaxed pl-1" style={{ color: '#0b0b0b' }}>
            De ahí el nombre: <strong style={{ color: '#0b0b0b' }}>BeatHub</strong> — un hub de ritmos,
            beats y conexiones musicales. Hecho con pasión, pensado para gente que vive de la música.
          </p>
        </div>

      </div>
    </div>
  )
}
