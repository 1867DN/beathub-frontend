import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { brandsAPI } from '../api/services'

function BrandLogo({ brand }) {
  const [imgSrc, setImgSrc] = useState(null)

  useEffect(() => {
    if (brand.logo_path) {
      setImgSrc(`/brands/${brand.logo_path}`)
    }
  }, [brand])

  return (
    <Link
      to={`/brand/${brand.id_key}`}
      className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
      style={{ margin: '0 20px' }}
      title={brand.name}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={brand.name}
          className="h-10 w-auto object-contain block"
          style={{ filter: 'brightness(0) invert(1)' }}
          onError={() => setImgSrc(null)}
        />
      ) : (
        <span className="text-white/70 font-semibold text-sm tracking-wide whitespace-nowrap">
          {brand.name}
        </span>
      )}
    </Link>
  )
}

export default function BrandSlider() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const trackRef = useRef(null)
  const rafRef = useRef(null)
  const posRef = useRef(0)
  const pausedRef = useRef(false)

  useEffect(() => {
    brandsAPI.getAll()
      .then(res => setBrands(res.data))
      .catch(err => console.error('Error fetching brands:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!trackRef.current || brands.length === 0) return

    const track = trackRef.current
    // Speed in px/frame at 60fps (~30px/s)
    const SPEED = 0.5

    const tick = () => {
      if (!pausedRef.current) {
        // singleWidth = width of ONE copy of the brands list (track has 3 copies)
        const singleWidth = track.scrollWidth / 3
        posRef.current -= SPEED
        // When we've scrolled exactly one full copy, reset to 0 — same visual content
        if (posRef.current <= -singleWidth) {
          posRef.current += singleWidth
        }
        track.style.transform = `translate3d(${posRef.current}px, 0, 0)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    // Wait one paint cycle so scrollWidth is accurate
    const id = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick)
    }, 50)

    return () => {
      clearTimeout(id)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [brands])

  if (loading || brands.length === 0) return null

  const tripled = [...brands, ...brands, ...brands]

  return (
    <div
      className="overflow-hidden"
      style={{
        background: '#000000',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <div
        ref={trackRef}
        className="flex items-center"
        style={{ width: 'max-content', willChange: 'transform' }}
      >
        {tripled.map((brand, idx) => (
          <BrandLogo key={`${brand.id_key}-${idx}`} brand={brand} />
        ))}
      </div>
    </div>
  )
}
