import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/images/home/logo.png'
import userIcon from '../assets/images/home/user.png'
import cartIcon from '../assets/images/home/cart.png'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import { brandsAPI } from '../api/services'
import BrandSlider from './BrandSlider'
import BrandSliderReverse from './BrandSliderReverse'
import FeaturedCarousel from './FeaturedCarousel'
import Toast from './Toast'

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuView, setMenuView] = useState('main') // 'main' | 'brands'
  const [brands, setBrands] = useState([])
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [headerHeight, setHeaderHeight] = useState(88)
  const userDropdownRef = useRef(null)
  const headerRef = useRef(null)
  const { isAuthenticated, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const cartItems = useCartStore((state) => state.items)

  // Medir el header real para posicionar el sidebar correctamente
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [])

  // Cargar marcas para el menú
  useEffect(() => {
    brandsAPI.getAll()
      .then(res => setBrands(res.data))
      .catch(() => {})
      .finally(() => setBrandsLoading(false))
  }, [])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cerrar menú + ir arriba al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false)
    setMenuView('main')
    setUserDropdownOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/productos?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMenuOpen(false)
    }
  }

  // Logo: si estoy en home scrollea arriba, si no navega al home
  const handleLogoClick = () => {
    setMenuOpen(false)
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  const menuItems = [
    { label: 'Productos', href: '/productos' },
    { label: 'Descuentos', href: '/descuentos' },
    { label: 'Marcas', href: '/' },
    { label: 'Lo nuevo', href: '/nuevo' },
    { label: 'Zona Relax', href: isAuthenticated ? '/relax' : '/login' },
    { label: 'About', href: '/about' },
    { label: 'Contacto', href: '/contact' },
  ]

  return (
    <div className={`flex flex-col min-h-screen ${location.pathname === '/about' ? '' : 'bg-gray-50'}`}>
      <Toast />

      {/* ── HEADER STICKY ── */}
      <header ref={headerRef} className="sticky top-0 z-50 shadow-lg" style={{ background: 'linear-gradient(to bottom, #4d1869, #5f247e)' }}>
        <div className="px-4 md:px-6 py-6 flex items-center relative">

          {/* LEFT — burger + buscador */}
          <div className="flex items-center gap-3 z-10">
            <button
              onClick={() => { setMenuOpen(!menuOpen); setUserDropdownOpen(false) }}
              className="text-xl font-bold w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-lg transition text-white"
              title="Menú"
            >
              {menuOpen ? '✕' : '☰'}
            </button>

            <div className="hidden md:flex items-center bg-white/20 rounded-lg px-3 py-1.5 w-44">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                className="bg-transparent w-full outline-none text-sm text-white placeholder-white/60"
              />
            </div>
          </div>

          {/* CENTER — logo centrado absolutamente */}
          <div className="absolute left-0 right-0 flex justify-center" style={{ pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'auto' }}>
            <button
              onClick={handleLogoClick}
              className="hover:scale-105 transition"
              title="Inicio"
            >
              <img src={logo} alt="BeatHub" className="h-20 w-auto object-contain" />
            </button>
          </div>
          </div>

          {/* RIGHT — usuario + carrito */}
          <div className="flex items-center gap-1 ml-auto z-10">
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition p-1"
                title="Usuario"
              >
                <img src={userIcon} alt="Usuario" className="w-full h-full object-contain" />
              </button>

              {userDropdownOpen && (
                <div className="absolute top-full mt-1 right-0 w-44 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        className="block px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100 text-purple-700 font-semibold"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          Panel Admin
                        </Link>
                      )}
                      <button
                        onClick={() => { handleLogout(); setUserDropdownOpen(false) }}
                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm"
                      >
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Ingresar
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2.5 hover:bg-gray-50 text-sm"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Icono carrito */}
            <Link
              to="/cart"
              className="relative w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition p-1"
              title="Carrito"
            >
              <img src={cartIcon} alt="Carrito" className="w-full h-full object-contain" />
              {cartItems.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>

        </div>
        {/* Línea divisora con degradado verde */}
        <div style={{ height: '5px', background: 'linear-gradient(to right, #a5efa2, #79edd6)' }} />
      </header>

      {/* ── MENU DESPLEGABLE — flota sobre el contenido, no lo empuja ── */}

      {/* Overlay semitransparente detrás del sidebar */}
      <div
        className="fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.45)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Sidebar — ancho modificable en: width (px abajo) */}
      <div
        className="fixed left-0 z-40 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col"
        style={{
          top: `${headerHeight}px`,
          height: `calc(100vh - ${headerHeight}px)`,
          width: '350px',           /* ← ANCHO DEL MENÚ — cambiá este valor */
          transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      >
        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto">
          {/* Vista principal */}
          {menuView === 'main' && (
            <nav className="py-3">
              {menuItems.map((item, idx) =>
                item.label === 'Marcas' ? (
                  <button
                    key={idx}
                    onClick={() => setMenuView('brands')}
                    className="w-full text-left flex items-center justify-between px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-primary/10 hover:text-primary border-b border-gray-100 transition"
                  >
                    {item.label}
                    <span className="text-gray-400">›</span>
                  </button>
                ) : (
                  <Link
                    key={idx}
                    to={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-primary/10 hover:text-primary border-b border-gray-100 last:border-0 transition"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          )}

          {/* Vista de marcas */}
          {menuView === 'brands' && (
            <div>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
                <button
                  onClick={() => setMenuView('main')}
                  className="text-gray-500 hover:text-gray-800 transition"
                >
                  ‹
                </button>
                <span className="font-bold text-sm tracking-widest text-gray-700">MARCAS</span>
              </div>
              <nav>
                {brandsLoading ? (
                  <p className="px-5 py-4 text-sm text-gray-400">Cargando marcas...</p>
                ) : brands.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-gray-400">No hay marcas disponibles.</p>
                ) : (
                  brands.map((brand) => (
                    <Link
                      key={brand.id_key}
                      to={`/brand/${brand.id_key}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-primary/10 hover:text-primary border-b border-gray-100 last:border-0 transition"
                    >
                      {brand.name}
                    </Link>
                  ))
                )}
              </nav>
            </div>
          )}
        </div>

        {/* Promo — siempre al fondo */}
        <div className="flex-shrink-0 mx-4 my-4 text-white p-3 rounded-lg text-center" style={{ background: 'linear-gradient(to bottom, #79edd6, #a5efa2)' }}>
          <p className="text-xs font-bold text-gray-800">Hasta 3 cuotas sin interés</p>
          <p className="text-xs mt-0.5 text-gray-700">En compras &gt; $2M</p>
        </div>
      </div>

      {/* ── BRAND SLIDER (bajo el header) ── */}
      <BrandSlider />

      {/* ── FEATURED CAROUSEL + SLIDERS MARCO (solo en home) ── */}
      {location.pathname === '/' && (
        <div className="w-full" style={{ backgroundColor: '#000' }}>
          <FeaturedCarousel />
          <BrandSliderReverse />
        </div>
      )}

      {/* ── CONTENIDO ── */}
      <main className={location.pathname === '/about'
        ? 'flex-1 w-full overflow-hidden'
        : 'flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8'
      }>
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className={`bg-secondary text-white py-10 w-full ${location.pathname === '/about' ? 'mt-0' : 'mt-16'}`}>
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-8">

          {/* Brand */}
          <div className="text-center">
            <h3 className="font-bold text-2xl tracking-tight">BeatHub<span className="text-primary">.ar</span></h3>
            <p className="text-sm text-gray-400 mt-1">Tu tienda de instrumentos musicales premium.</p>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-4">
            <Link to="/descuentos" className="px-5 py-2 rounded-full border border-gray-500 text-sm font-semibold hover:bg-white hover:text-secondary transition">
              Descuentos
            </Link>
            <Link to="/contact" className="px-5 py-2 rounded-full border border-gray-500 text-sm font-semibold hover:bg-white hover:text-secondary transition">
              Contacto
            </Link>
            <Link to="/about" className="px-5 py-2 rounded-full border border-gray-500 text-sm font-semibold hover:bg-white hover:text-secondary transition">
              About
            </Link>
          </div>

          {/* Contact info */}
          <div className="text-center text-sm text-gray-300 space-y-1">
            <p>📞 +549 (3772) 584894</p>
            <p>📍 Mendoza, Argentina</p>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 pt-5 w-full text-center text-xs text-gray-500">
            © 2025 BeatHub.ar. Todos los derechos reservados.
          </div>

        </div>
      </footer>

    </div>
  )
}
