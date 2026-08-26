import { Link } from 'react-router-dom'
import { ArrowUpRight, Facebook, Instagram, MessageCircle } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { CtaBand } from '../../features/marketing/components/CtaBand'
import { site } from '../../data/site'
import { listCategories, listIssues } from '../../data/selectors'
import { waLink, waMessage } from '../../lib/whatsapp'

const columns = [
  {
    title: 'Repairs',
    links: listIssues()
      .slice(0, 5)
      .map((i) => ({ label: i.name, to: '/repairs' })),
  },
  {
    title: 'Shop',
    links: listCategories()
      .filter((c) => c.id !== 'all')
      .map((c) => ({ label: c.label, to: `/shop?category=${c.id}` })),
  },
  {
    title: 'Store',
    links: [
      { label: 'How it works', to: '/repairs#process' },
      { label: 'Student discount', to: '/students' },
      { label: 'Accessories', to: '/accessories' },
      { label: 'Reviews', to: '/reviews' },
      { label: 'Visit us', to: '/visit' },
      { label: 'Everything in stock', to: '/shop' },
    ],
  },
]

const socials = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: MessageCircle, label: 'WhatsApp', href: waLink(waMessage.general()) },
]

export function SiteFooter() {
  return (
    <footer className="border-t-3 border-ink bg-paper-200">
      <div className="container-x py-14">
        <CtaBand />

        {/* ---------- Link grid ---------- */}
        <div className="mt-14 grid gap-10 border-t-3 border-ink pt-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-xs font-medium leading-relaxed text-ink-800">
              An independent repair bench and phone shop in {site.address.line2}, {site.address.city}. Same
              technicians since 2016.
            </p>

            <div className="mt-6 flex gap-2.5">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="press grid h-10 w-10 place-items-center border-3 border-ink bg-paper-50 shadow-brut-xs"
                >
                  <Icon className="h-4 w-4" strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="border-b-3 border-ink pb-2 font-mono text-2xs font-bold uppercase tracking-[0.18em]">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center gap-1.5 text-xs font-bold transition-colors hover:bg-acid"
                    >
                      {link.label}
                      <ArrowUpRight
                        className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* ---------- Legal bar ---------- */}
      <div className="border-t-3 border-ink bg-ink text-paper-300">
        <div className="container-x flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-2xs font-bold uppercase tracking-wider">
            © {new Date().getFullYear()} {site.name} · {site.address.line2}, {site.address.city}{' '}
            {site.address.postal}
          </p>
          <p className="font-mono text-2xs uppercase tracking-wider text-paper-400">
            Independent repair provider · brands are trademarks of their owners
          </p>
        </div>
      </div>
    </footer>
  )
}
