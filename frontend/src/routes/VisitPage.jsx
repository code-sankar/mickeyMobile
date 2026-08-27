import { useMemo } from 'react'
import { VisitHero } from '../features/visit/components/VisitHero'
import { MapPanel } from '../features/visit/components/MapPanel'
import { HoursCard } from '../features/visit/components/HoursCard'
import { ContactCard } from '../features/visit/components/ContactCard'
import { GettingHere } from '../features/visit/components/GettingHere'
import { Reveal } from '../components/ui/Reveal'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useStructuredData } from '../hooks/useStructuredData'
import { breadcrumbSchema } from '../lib/seo'

export function VisitPage() {
  useDocumentTitle(
    'Visit the store',
    'Second floor, Shop No 258, TDA Market, Tinsukia. Open seven days — live opening hours, parking and directions.',
  )

  const schema = useMemo(() => breadcrumbSchema([{ name: 'Visit us', path: '/visit' }]), [])

  useStructuredData(schema)

  return (
    <>
      <VisitHero />

      {/* Three standing columns: where we are, when we're open, how to reach us. */}
      <div className="container-x section-y">
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <Reveal>
            <MapPanel title="Find our store" />
          </Reveal>

          <Reveal delay={80}>
            <HoursCard />
          </Reveal>

          <Reveal delay={160}>
            <div className="flex flex-col gap-6">
              <ContactCard />
              <GettingHere />
            </div>
          </Reveal>
        </div>
      </div>
    </>
  )
}
