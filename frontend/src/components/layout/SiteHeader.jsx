import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, Phone, Wrench, X } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { Button } from '../ui/Button'
import { navLinks, site } from '../../data/site'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useBooking } from '../../app/providers/bookingContext'
import { cx } from '../../lib/utils'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { openBooking } = useBooking()
  const { pathname } = useLocation()

  useLockBodyScroll(menuOpen)

  // Close the sheet on navigation and when the viewport grows past mobile
  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = (e) => e.matches && setMenuOpen(false)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const linkClass = ({ isActive }) =>
    cx(
      'border-3 border-transparent px-3 py-2 font-mono text-2xs font-bold uppercase tracking-wider transition-colors duration-150',
      isActive ? 'border-ink bg-acid' : 'hover:border-ink hover:bg-paper-200',
    )

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b-3 border-ink bg-paper-100">
        <div className="container-x">
          <nav className="flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
            <Logo />

            <ul className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className={linkClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <a
                href={site.phoneHref}
                className="press hidden items-center gap-2 border-3 border-ink bg-paper-50 px-3 py-2 font-mono text-2xs font-bold shadow-brut-xs md:inline-flex"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                {site.phoneDisplay}
              </a>

              <Button onClick={() => openBooking()} size="sm" className="hidden sm:inline-flex">
                <Wrench className="h-3.5 w-3.5" strokeWidth={3} />
                Book a repair
              </Button>

              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                className="press grid h-10 w-10 place-items-center border-3 border-ink bg-acid shadow-brut-xs lg:hidden"
              >
                {menuOpen ? <X className="h-5 w-5" strokeWidth={3} /> : <Menu className="h-5 w-5" strokeWidth={3} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        className={cx('fixed inset-0 z-40 lg:hidden', menuOpen ? 'pointer-events-auto' : 'pointer-events-none')}
        aria-hidden={!menuOpen}
      >
        <div
          className={cx(
            'absolute inset-0 bg-ink/70 transition-opacity duration-200',
            menuOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={cx(
            'absolute inset-x-4 top-20 border-3 border-ink bg-paper-100 shadow-brut-lg transition-all duration-200 ease-snap',
            menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
          )}
        >
          <ul>
            {navLinks.map((link, i) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  tabIndex={menuOpen ? 0 : -1}
                  className={({ isActive }) =>
                    cx(
                      'flex items-center justify-between border-b-3 border-ink px-5 py-4 font-display text-base uppercase transition-colors',
                      isActive ? 'bg-acid' : 'hover:bg-paper-200',
                    )
                  }
                >
                  {link.label}
                  <span className="font-mono text-2xs text-ink-500">0{i + 1}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-2 gap-3 p-4">
            <Button href={site.phoneHref} variant="paper" tabIndex={menuOpen ? 0 : -1}>
              <Phone className="h-4 w-4" strokeWidth={2.5} />
              Call
            </Button>
            <Button
              onClick={() => {
                setMenuOpen(false)
                openBooking()
              }}
              tabIndex={menuOpen ? 0 : -1}
            >
              <Wrench className="h-4 w-4" strokeWidth={2.5} />
              Book
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
