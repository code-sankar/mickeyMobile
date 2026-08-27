import { useMemo, useState } from 'react'
import { CalendarDays, Check, CircleAlert, PartyPopper, Phone, User } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { WhatsAppButton } from '../../../components/ui/WhatsAppButton'
import { Chip, Field, FieldError, TextArea, TextInput } from '../../../components/ui/Field'
import { timeSlots, serviceModes } from '../../../data/repairs'
import { waMessage } from '../../../lib/whatsapp'
import { api } from '../../../lib/api'
import { cx, money, ticketId } from '../../../lib/utils'

const EMPTY = { name: '', phone: '', date: '', slot: '', mode: 'walkin', notes: '' }

function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function validate(values) {
  const errors = {}
  if (values.name.trim().length < 2) errors.name = 'Who do we ask for?'
  if (!/^[6-9]\d{9}$/.test(values.phone.replace(/\D/g, ''))) errors.phone = '10-digit mobile'
  if (!values.date) errors.date = 'Pick a day'
  else if (values.date < todayISO()) errors.date = 'Already passed'
  if (!values.slot) errors.slot = 'Choose a slot'
  return errors
}

/**
 * Booking form for a quote produced by the estimator. Rendered once by
 * `BookingProvider`, so every CTA on every route drives this same dialog.
 *
 * Submitting books a real slot through the API, which allocates a unique
 * ticket number and stores the quote as the server priced it. If the API is
 * unreachable — down, cold, or simply not deployed — the form falls back to
 * what it always did: a locally-issued ticket handed to WhatsApp as a
 * prefilled message. The shop runs on WhatsApp either way, so the fallback is
 * a working submission rather than an error state, and the confirmation screen
 * says which of the two happened.
 */
export function BookingModal({ open, onClose, quote }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const min = useMemo(todayISO, [])

  const set = (key) => (event) => {
    const value = event?.target ? event.target.value : event
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setSubmitting(true)
    try {
      // The server is sent the estimator's *selection*, never its price — it
      // reprices from the live list so the ticket cannot be talked down.
      const booking = await api.createBooking({
        ...values,
        quote: quote
          ? {
              brandId: quote.brand.id,
              modelId: quote.model.id,
              issueId: quote.issue.id,
              gradeId: quote.grade.id,
            }
          : null,
      })
      setSubmitted({ ...values, id: booking.ticket, confirmed: true })
    } catch (error) {
      // A rejected field is the user's to fix, so show it rather than
      // silently booking around it.
      if (error.isValidation && error.details) {
        setErrors(error.details)
        return
      }
      // Anything else is our problem, not theirs: issue a local ticket and let
      // WhatsApp carry the booking, exactly as it did before there was an API.
      setSubmitted({ ...values, id: ticketId(), confirmed: false })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset after the close transition so the form doesn't flash empty
    setTimeout(() => {
      setValues(EMPTY)
      setErrors({})
      setSubmitted(null)
      setSubmitting(false)
    }, 250)
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="lg"
      labelledBy="booking-title"
      title={submitted ? 'Booking confirmed' : 'Book your repair slot'}
      description={
        submitted ? undefined : 'No prepayment. We confirm on WhatsApp within 15 minutes during shop hours.'
      }
    >
      {submitted ? (
        <Confirmation booking={submitted} quote={quote} onClose={handleClose} />
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {quote && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-3 border-ink bg-acid p-4">
              <div>
                <p className="font-mono text-2xs font-bold uppercase tracking-[0.16em]">Your quote</p>
                <p className="mt-1.5 font-display text-sm uppercase">
                  {quote.model.name} · {quote.issue.short}
                </p>
                <p className="mt-1 text-xs font-medium text-ink-800">
                  {quote.gradeLabel} · ready in {quote.turnaround}
                </p>
              </div>
              <p className="font-display text-2xl tabular">{money(quote.price)}</p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" error={errors.name} icon={User} htmlFor="bk-name">
              <TextInput
                id="bk-name"
                value={values.name}
                onChange={set('name')}
                autoComplete="name"
                placeholder="Ananya Bora"
                error={errors.name}
              />
            </Field>

            <Field label="Mobile number" error={errors.phone} icon={Phone} htmlFor="bk-phone">
              <TextInput
                id="bk-phone"
                value={values.phone}
                onChange={set('phone')}
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="98765 43210"
                error={errors.phone}
              />
            </Field>
          </div>

          <Field label="Preferred date" error={errors.date} icon={CalendarDays} htmlFor="bk-date">
            <TextInput
              id="bk-date"
              type="date"
              min={min}
              value={values.date}
              onChange={set('date')}
              error={errors.date}
              className="sm:max-w-xs"
            />
          </Field>

          <fieldset>
            <legend className="mb-3 flex flex-wrap items-center gap-2 font-mono text-2xs font-bold uppercase tracking-[0.16em]">
              Time slot
              {errors.slot && <FieldError>{errors.slot}</FieldError>}
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {timeSlots.map((slot) => (
                <Chip key={slot} selected={values.slot === slot} onClick={() => set('slot')(slot)}>
                  {slot}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 font-mono text-2xs font-bold uppercase tracking-[0.16em]">
              How would you like it handled?
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {serviceModes.map((mode) => {
                const selected = values.mode === mode.id
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => set('mode')(mode.id)}
                    aria-pressed={selected}
                    className={cx(
                      'flex flex-col border-3 border-ink p-4 text-left transition-all duration-150 ease-snap',
                      selected
                        ? 'translate-x-[2px] translate-y-[2px] bg-electric text-paper-50 shadow-none'
                        : 'bg-paper-50 shadow-brut-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brut-xs',
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display text-xs uppercase">{mode.label}</span>
                      <span
                        className={cx(
                          'grid h-4 w-4 shrink-0 place-items-center border-3 border-ink',
                          selected ? 'bg-acid' : 'bg-paper-200',
                        )}
                      >
                        {selected && <Check className="h-2.5 w-2.5 text-ink" strokeWidth={5} />}
                      </span>
                    </span>
                    <span
                      className={cx(
                        'mt-2 block text-xs font-medium leading-relaxed',
                        selected ? 'text-paper-200' : 'text-ink-700',
                      )}
                    >
                      {mode.note}
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <Field label="Anything we should know? (optional)" htmlFor="bk-notes">
            <TextArea
              id="bk-notes"
              value={values.notes}
              onChange={set('notes')}
              rows={3}
              placeholder="Phone still boots but the touch is dead on the left third of the screen."
            />
          </Field>

          <div className="flex flex-col-reverse gap-4 border-t-3 border-ink pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-ink-700">
              By booking you agree to our diagnosis-first policy — no work starts without your approval.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full shrink-0 sm:w-auto"
            >
              {submitting ? 'Booking…' : 'Confirm booking'}
              <Check className="h-4 w-4" strokeWidth={3} />
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

function Confirmation({ booking, quote, onClose }) {
  const pretty = new Date(`${booking.date}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const mode = serviceModes.find((m) => m.id === booking.mode)

  return (
    <div className="text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center border-3 border-ink bg-lime shadow-brut">
        <PartyPopper className="h-7 w-7" strokeWidth={2.5} />
      </div>

      <p className="mt-6 font-mono text-2xs font-bold uppercase tracking-[0.2em] text-ink-500">Ticket</p>
      <p className="mt-2 font-display text-3xl uppercase">{booking.id}</p>

      <p className="mx-auto mt-4 max-w-md text-pretty text-sm font-medium leading-relaxed text-ink-800">
        {booking.confirmed ? (
          <>
            Thanks {booking.name.split(' ')[0]} — your slot is booked and this ticket is on our
            system. We&apos;ll confirm on <span className="font-mono font-bold">{booking.phone}</span>{' '}
            within 15 minutes during shop hours.
          </>
        ) : (
          <>
            Thanks {booking.name.split(' ')[0]} — here are your details. Send them to us on WhatsApp
            to lock the slot in, and we&apos;ll confirm on{' '}
            <span className="font-mono font-bold">{booking.phone}</span>.
          </>
        )}
      </p>

      <dl className="mt-7 border-3 border-ink bg-paper-50 text-left shadow-brut-sm">
        <Row label="When" value={`${pretty} · ${booking.slot}`} first />
        {quote && <Row label="Service" value={`${quote.model.name} · ${quote.issue.short}`} />}
        {quote && <Row label="Estimate" value={`${money(quote.price)} · ready in ${quote.turnaround}`} />}
        <Row label="Handling" value={mode?.label ?? '—'} />
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <WhatsAppButton
          message={waMessage.booking({ ...booking, prettyDate: pretty }, quote, mode?.label)}
          size="lg"
          className="flex-1"
          variant={booking.confirmed ? 'paper' : undefined}
        >
          {booking.confirmed ? 'Also send on WhatsApp' : 'Send to WhatsApp'}
        </WhatsAppButton>
        <Button onClick={onClose} variant="paper" size="lg" className="flex-1">
          Done
        </Button>
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-ink-500">
        <CircleAlert className="h-3 w-3 shrink-0" strokeWidth={3} />
        {booking.confirmed
          ? 'Booked on our system. Quote your ticket number at the counter.'
          : 'We could not reach our system — WhatsApp is how this booking gets to us.'}
      </p>
    </div>
  )
}

function Row({ label, value, first = false }) {
  return (
    <div className={cx('flex items-center justify-between gap-4 px-4 py-3', !first && 'border-t-3 border-ink')}>
      <dt className="font-mono text-2xs font-bold uppercase tracking-wider text-ink-500">{label}</dt>
      <dd className="text-right text-sm font-bold">{value}</dd>
    </div>
  )
}
