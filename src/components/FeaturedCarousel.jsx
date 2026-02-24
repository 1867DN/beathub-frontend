import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsAPI, brandsAPI } from '../api/services'
import { formatARS } from '../utils/format'

const VISIBLE = 3

export default function FeaturedCarousel() {
  const [products, setProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  // trackIdx: position in the extended track (starts at VISIBLE to show real[0..2])
  const [trackIdx, setTrackIdx] = useState(VISIBLE)
  const [animated, setAnimated] = useState(true)
  const lockRef = useRef(false)
  const autoRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([productsAPI.getAll(), brandsAPI.getAll()])
      .then(([pRes, bRes]) => {
        const featured = (pRes.data || []).filter(
          p => p.is_featured === 'true' && p.is_active !== 'false'
        )
        setProducts(featured)
        setBrands(bRes.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const brandById = useMemo(() => {
    const map = {}
    brands.forEach(b => { map[b.id_key] = b })
    return map
  }, [brands])

  // Extended track: [last VISIBLE clones, ...all products, first VISIBLE clones]
  // This enables seamless infinite looping
  const track = useMemo(() => {
    if (products.length === 0) return []
    const pre  = products.slice(-VISIBLE)
    const post = products.slice(0, VISIBLE)
    return [...pre, ...products, ...post]
  }, [products])

  const n = products.length

  // Which real product index is at the leftmost visible position
  const realIdx = n > 0 ? (trackIdx - VISIBLE + n * 100) % n : 0

  const slide = useCallback((newIdx) => {
    if (lockRef.current) return
    lockRef.current = true
    setAnimated(true)
    setTrackIdx(newIdx)
  }, [])

  const startAuto = useCallback(() => {
    clearInterval(autoRef.current)
    if (n <= VISIBLE) return
    autoRef.current = setInterval(() => {
      if (!lockRef.current) {
        lockRef.current = true
        setAnimated(true)
        setTrackIdx(i => i + 1)
      }
    }, 5000)
  }, [n])

  const next = useCallback(() => { slide(trackIdx + 1); startAuto() }, [slide, trackIdx, startAuto])
  const prev = useCallback(() => { slide(trackIdx - 1); startAuto() }, [slide, trackIdx, startAuto])

  // After CSS transition ends: snap back from clone zone to real equivalent (no animation)
  const handleTransitionEnd = useCallback(() => {
    lockRef.current = false
    if (n === 0) return
    if (trackIdx < VISIBLE) {
      setAnimated(false)
      setTrackIdx(trackIdx + n)
    } else if (trackIdx > n + VISIBLE - 1) {
      setAnimated(false)
      setTrackIdx(trackIdx - n)
    }
  }, [trackIdx, n])

  // Auto-scroll every 5s — starts on mount, resets on manual nav
  useEffect(() => {
    startAuto()
    return () => clearInterval(autoRef.current)
  }, [startAuto])

  // ── LOADING ──
  if (loading || (n > 0 && track.length === 0)) {
    return (
      <div className="w-full h-[calc(100vh-9.5rem)] flex items-center justify-center select-none" style={{ backgroundColor: '#000' }}>
        <div className="animate-spin text-5xl">🎵</div>
      </div>
    )
  }

  // ── EMPTY ──
  if (!loading && n === 0) {
    return (
      <div className="w-full h-[calc(100vh-9.5rem)] flex items-center justify-center text-white select-none" style={{ backgroundColor: '#000' }}>
        <div className="text-center px-4">
          <p className="text-7xl mb-5">🎸</p>
          <p className="text-2xl font-black tracking-tight mb-2">Próximamente en cartelera</p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            Desde el panel admin marcá productos con 🌟 para exhibirlos acá
          </p>
        </div>
      </div>
    )
  }

  // Each item is 1/VISIBLE of the viewport; the track is track.length/VISIBLE viewports wide
  // translateX as % of the track's own width = -(trackIdx / track.length) * 100%
  const translatePct = -(trackIdx / track.length) * 100

  return (
    <div className="relative w-full h-[calc(100vh-9.5rem)] overflow-hidden select-none" style={{ backgroundColor: '#000' }}>

      {/* ── SLIDING TRACK ── */}
      <div
        onTransitionEnd={handleTransitionEnd}
        style={{
          display: 'flex',
          height: '100%',
          width: `${(track.length / VISIBLE) * 100}%`,
          transform: `translateX(${translatePct}%)`,
          transition: animated ? 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          willChange: 'transform',
        }}
      >
        {track.map((product, i) => {
          const hasDiscount = product.discount_percent > 0
          const brand = brandById[product.brand_id]
          const itemW = 100 / track.length   // % of the track width per item
          return (
            <div
              key={`${product.id_key}-${i}`}
              style={{ width: `${itemW}%`, flexShrink: 0 }}
              className="relative overflow-hidden cursor-pointer group"
              onClick={() => navigate(`/product/${product.id_key}`)}
            >
              {/* Column divider */}
              {i > 0 && (
                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/20 z-10 pointer-events-none" />
              )}

              {/* Image */}
              {product.image_path ? (
                <img
                  src={`/products/${product.image_path}`}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <span className="text-9xl opacity-20">🎵</span>
                </div>
              )}

              {/* Dark gradient overlay — only bottom half */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

              {/* Badges — top */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                {product.is_new === 'true' && (
                  <span className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow">
                    Nuevo
                  </span>
                )}
              </div>
              {hasDiscount && (
                <span className="absolute top-4 right-4 z-10 bg-red-500 text-white text-sm font-black px-3 py-1 rounded-lg shadow">
                  -{product.discount_percent}%
                </span>
              )}

              {/* Info — bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-white">
                {brand && (
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-1">
                    {brand.name}
                  </p>
                )}
                <h2 className="text-xl md:text-2xl font-black leading-tight mb-3 line-clamp-2 drop-shadow-lg">
                  {product.name}
                </h2>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    {hasDiscount && product.price_list && (
                      <p className="text-xs text-gray-400 line-through mb-0.5">
                        {formatARS(product.price_list)}
                      </p>
                    )}
                    <p className="text-2xl md:text-3xl font-black text-primary drop-shadow">
                      {formatARS(product.price)}
                    </p>
                  </div>
                  <span className="shrink-0 bg-white text-black text-xs font-bold px-4 py-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                    Ver más →
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── ARROWS (only if more products than visible slots) ── */}
      {n > VISIBLE && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white w-11 h-11 rounded-full flex items-center justify-center text-3xl leading-none transition-colors duration-200 backdrop-blur-sm shadow-lg"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white w-11 h-11 rounded-full flex items-center justify-center text-3xl leading-none transition-colors duration-200 backdrop-blur-sm shadow-lg"
          >
            ›
          </button>
        </>
      )}

      {/* ── DOTS ── */}
      {n > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                lockRef.current = false
                setAnimated(true)
                setTrackIdx(i + VISIBLE)
                startAuto()
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === realIdx ? 'bg-white w-6' : 'bg-white/40 w-1.5'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
