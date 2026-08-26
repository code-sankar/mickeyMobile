import { ArrowRight, BadgeCheck, Mail } from 'lucide-react'
import { OfferTiers } from '../features/students/components/OfferTiers'
import { SavingsCalculator } from '../features/students/components/SavingsCalculator'
import { RegistrationForm } from '../features/students/components/RegistrationForm'
import { PrivacyNotice } from '../features/students/components/PrivacyNotice'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionHeading } from '../components/ui/SectionHeading'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Reveal } from '../components/ui/Reveal'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { discountTiers, MINIMUM_SPEND, MINIMUM_AGE } from '../data/students'
import { money } from '../lib/utils'

const percents = discountTiers.map((t) => t.percent)

const STEPS = [
  {
    id: 'register',
    title: 'Register once',
    detail: 'Fill the form below with your details and the phone you want looked after.',
  },
  {
    id: 'verify',
    title: 'Send your student ID',
    detail: 'Attach a photo of your card in the chat that opens. We check it and confirm.',
  },
  {
    id: 'claim',
    title: 'Claim at the counter',
    detail: `Bring the registered phone in. Any bill over ${money(MINIMUM_SPEND)} gets the discount taken off before you pay.`,
  },
]

export function StudentsPage() {
  useDocumentTitle(
    'Student repair discount',
    `Students ${MINIMUM_AGE}+ get ${percents[0]}–${percents[percents.length - 1]}% off repair bills over ${money(MINIMUM_SPEND)} at Mickey Mobile, Tinsukia. Register once with your student ID.`,
  )

  return (
    <>
      <PageHeader
        eyebrow="Student portal"
        title={
          <>
            {percents[0]}–{percents[percents.length - 1]}% off
            <br />
            when you study
          </>
        }
        description={`Register your student ID and your handset once. Every repair bill over ${money(MINIMUM_SPEND)} comes down by ${percents[0]}–${percents[percents.length - 1]}% from then on — no coupon, no expiry, nothing to remember at the counter.`}
        crumbs={[{ label: 'Students' }]}
        tone="grape"
      >
        <Button href="#register" variant="accent" size="lg">
          Register now
          <ArrowRight className="h-4 w-4" strokeWidth={3} />
        </Button>
      </PageHeader>

      {/* ---------- The offer ---------- */}
      <section className="section-y border-b-3 border-ink">
        <div className="container-x">
          <SectionHeading
            eyebrow="The offer"
            title="Two bands, one registration"
            description="How much comes off depends on the size of the bill. Both bands need the same one-time registration — after that it is automatic."
          />
          <div className="mt-10">
            <OfferTiers />
          </div>
        </div>
      </section>

      {/* ---------- How it works + calculator ---------- */}
      <section className="section-y border-b-3 border-ink bg-paper-200">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-12">
            <div>
              <SectionHeading eyebrow="How it works" title="Three steps, then forget about it" />

              <ol className="mt-8 space-y-5">
                {STEPS.map((step, i) => (
                  <Reveal key={step.id} delay={i * 80} as="li">
                    <Card className="flex gap-4 p-5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center border-3 border-ink bg-grape font-display text-sm text-paper-50">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="font-display text-sm uppercase">{step.title}</h3>
                        <p className="mt-1.5 text-xs font-medium leading-relaxed text-ink-800 sm:text-sm">
                          {step.detail}
                        </p>
                      </div>
                    </Card>
                  </Reveal>
                ))}
              </ol>
            </div>

            <Reveal delay={120}>
              <SavingsCalculator />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Register ---------- */}
      <section className="section-y border-b-3 border-ink">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start lg:gap-10">
            <RegistrationForm />

            <div className="space-y-6 lg:sticky lg:top-28">
              <PrivacyNotice />

              <Card surface="acid" className="p-5">
                <p className="flex items-center gap-2 font-mono text-2xs font-bold uppercase tracking-wider">
                  <Mail className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  About the monthly email
                </p>
                <p className="mt-3 text-xs font-medium leading-relaxed text-ink-800">
                  If you opt in, we email roughly once a month when cases, batteries or screens for
                  your registered model come into stock — plus anything worth knowing if you are
                  thinking about upgrading. It is a separate tick box, and saying no changes nothing
                  about your discount.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Close ---------- */}
      <section className="section-y">
        <div className="container-x">
          <Reveal>
            <Card
              surface="ink"
              shadow="lg"
              className="flex flex-col items-start gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center border-3 border-paper-100 bg-lime text-ink">
                  <BadgeCheck className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-lg uppercase leading-tight text-paper-50 sm:text-xl">
                    Not sure what the repair costs yet?
                  </h2>
                  <p className="mt-2.5 max-w-xl text-xs font-medium leading-relaxed text-paper-300 sm:text-sm">
                    Get a free estimate first — the student discount comes off whatever that number
                    turns out to be.
                  </p>
                </div>
              </div>

              <Button to="/repairs" variant="accent" size="lg" className="w-full shrink-0 lg:w-auto">
                Price my repair
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </Button>
            </Card>
          </Reveal>
        </div>
      </section>
    </>
  )
}
