import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import lithovoltLogo from '../../assets/lithovolt-logo.png'

const menuGroups = [
  {
    label: 'Explore',
    items: [
      { name: 'Battery Models', path: '/models' },
      { name: 'Find by Vehicle', path: '/find-battery' },
    ],
  },
  {
    label: 'Company',
    items: [
      { name: 'About Lithovolt', path: '/about' },
    ],
  },
  {
    label: 'Support',
    items: [
      { name: 'Contact Us', path: '/contact' },
      { name: 'Support Center', path: '/support' },
    ],
  },
]

export default function PublicHeader({ title = 'Battery Discovery Hub' }) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDesktopGroup, setOpenDesktopGroup] = useState(null)
  const [openMobileGroup, setOpenMobileGroup] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const headerRef = useRef(null)

  const authCta = useMemo(() => {
    if (location.pathname === '/login') {
      return { label: 'Register', path: '/register' }
    }
    return { label: 'Login', path: '/login' }
  }, [location.pathname])

  const isGroupActive = (items) => items.some((item) => location.pathname === item.path)

  useEffect(() => {
    setMobileOpen(false)
    setOpenDesktopGroup(null)
    setOpenMobileGroup(null)
  }, [location.pathname])

  useEffect(() => {
    const onDocPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setOpenDesktopGroup(null)
      }
    }

    const onDocKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenDesktopGroup(null)
        setOpenMobileGroup(null)
      }
    }

    const onScroll = () => {
      setIsScrolled(window.scrollY > 12)
    }

    document.addEventListener('pointerdown', onDocPointerDown)
    document.addEventListener('keydown', onDocKeyDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown)
      document.removeEventListener('keydown', onDocKeyDown)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const toggleDesktopGroup = (label) => {
    setOpenDesktopGroup((current) => (current === label ? null : label))
  }

  const toggleMobileGroup = (label) => {
    setOpenMobileGroup((current) => (current === label ? null : label))
  }

  return (
    <header
      ref={headerRef}
      className={`public-header-shell guest-header panel-card mb-6 ${isScrolled ? 'is-scrolled' : ''}`}
    >
      <div className="flex items-center justify-between gap-3 p-4 md:p-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img src={lithovoltLogo} alt="Lithovolt" className="h-9 w-auto object-contain md:h-11" />
          <div className="min-w-0">
            <p className="truncate text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)] md:text-xs md:tracking-[0.3em]">
              Lithovolt Public
            </p>
            <h1 className="truncate text-lg text-[color:var(--accent)] neon-title md:text-2xl">{title}</h1>
          </div>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/" className={`guest-nav-chip ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>

          {menuGroups.map((group) => (
            <div key={group.label} className="public-menu-dropdown">
              <button
                type="button"
                aria-expanded={openDesktopGroup === group.label}
                className={`guest-nav-chip ${isGroupActive(group.items) ? 'active' : ''}`}
                onClick={() => toggleDesktopGroup(group.label)}
              >
                <span>{group.label}</span>
                <span
                  aria-hidden="true"
                  className={`public-menu-caret ${openDesktopGroup === group.label ? 'open' : ''}`}
                >
                  ▾
                </span>
              </button>
              {openDesktopGroup === group.label ? (
                <div className="public-submenu panel-card">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="public-submenu-link"
                      onClick={() => setOpenDesktopGroup(null)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          <Link to={authCta.path} className="guest-nav-chip guest-nav-chip-login">
            {authCta.label}
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          className="guest-nav-chip guest-mobile-toggle lg:hidden"
          onClick={() => setMobileOpen((open) => !open)}
        >
          Menu
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[color:var(--border)] px-4 pb-4 pt-3 lg:hidden">
          <div className="grid gap-2">
            <Link to="/" className={`guest-nav-chip w-full justify-start ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              Home
            </Link>

            {menuGroups.map((group) => (
              <div key={group.label} className="public-mobile-group">
                <button
                  type="button"
                  aria-expanded={openMobileGroup === group.label}
                  className={`guest-nav-chip w-full justify-start ${isGroupActive(group.items) ? 'active' : ''}`}
                  onClick={() => toggleMobileGroup(group.label)}
                >
                  <span>{group.label}</span>
                  <span
                    aria-hidden="true"
                    className={`public-menu-caret ml-auto ${openMobileGroup === group.label ? 'open' : ''}`}
                  >
                    ▾
                  </span>
                </button>
                {openMobileGroup === group.label ? (
                  <div className="mt-2 grid gap-2 pl-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`guest-nav-chip w-full justify-start ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => {
                          setMobileOpen(false)
                          setOpenMobileGroup(null)
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            <Link
              to={authCta.path}
              className="guest-nav-chip guest-nav-chip-login w-full justify-start"
              onClick={() => setMobileOpen(false)}
            >
              {authCta.label}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
