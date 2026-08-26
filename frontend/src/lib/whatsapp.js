/**
 * WhatsApp is this shop's actual counter — there is no CRM behind the site, so
 * every enquiry ends in a chat. This module makes that chat start with the
 * context already in it.
 *
 * A visitor who taps "ask about this" on a product should not have to type out
 * which product, and the shop should not have to ask. Each builder below turns
 * page state into a message the customer can send unedited and the shop can act
 * on without a reply-and-wait round trip.
 *
 * One number, from `site.whatsappNumber`. No wa.me URL is written by hand
 * anywhere else in the codebase.
 */
import { site } from '../data/site'
import { money } from './utils'

/** wa.me caps the prefill; keep well under it so nothing is silently truncated. */
const MAX_LENGTH = 1500

const GREETING = `Hi ${site.name},`

/**
 * Joins message lines.
 *
 * A conditional line that does not apply is passed as null and dropped; an
 * empty string is a deliberate blank line between sections and is kept. That
 * distinction is why this filters on null rather than on falsiness — `Boolean`
 * would silently swallow the spacers and run every section together.
 */
function compose(...lines) {
  return lines
    .filter((line) => line !== null && line !== undefined && line !== false)
    .join('\n')
    .slice(0, MAX_LENGTH)
}

/**
 * A wa.me deep link. Opens the native app on mobile and WhatsApp Web on
 * desktop, with `message` already typed into the composer — the customer still
 * has to press send, so nothing is sent on their behalf.
 */
export function waLink(message) {
  const base = `https://wa.me/${site.whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export const waMessage = {
  /** Fallback for a generic "message us" button. */
  general: () => compose(`${GREETING} I'd like to ask about a repair.`),

  /** Store-details context: directions, hours, whether they're open now. */
  visit: () =>
    compose(`${GREETING} I'd like to visit the shop — could you confirm you're open today?`),

  /**
   * A specific product. Carries the price the customer was shown, so a stale
   * page is obvious to the shop rather than becoming an argument at the counter.
   */
  product: (product) =>
    compose(
      `${GREETING} is this in stock?`,
      '',
      `• ${product.brand} ${product.name}`,
      `• ${product.subtitle}`,
      `• Listed at ${money(product.price)}`,
      '',
      'Sent from the website.',
    ),

  /** Accessory enquiry that names the device it needs to fit. */
  accessoryFit: (product) =>
    compose(
      `${GREETING} will this fit my phone?`,
      '',
      `• ${product.brand} ${product.name}`,
      `• ${product.subtitle}`,
      '',
      'My phone is: ',
    ),

  /** A completed repair estimate, itemised the way the quote panel shows it. */
  quote: (quote) =>
    compose(
      `${GREETING} I'd like to go ahead with this repair estimate.`,
      '',
      `• Device: ${quote.brand.name} ${quote.model.name}`,
      `• Issue: ${quote.issue.short}`,
      `• Parts: ${quote.gradeLabel}`,
      `• Estimate: ${money(quote.price)}`,
      `• Ready in: ${quote.turnaround}`,
      `• Warranty: ${quote.warranty}`,
      '',
      'Sent from the website estimator.',
    ),

  /**
   * A confirmed booking. This is the one that matters most: the booking form
   * has no backend, so this message *is* the submission.
   */
  booking: (booking, quote, modeLabel) =>
    compose(
      `${GREETING} I've booked a repair slot on your website.`,
      '',
      `• Ticket: ${booking.id}`,
      `• Name: ${booking.name}`,
      `• Phone: ${booking.phone}`,
      `• When: ${booking.prettyDate} at ${booking.slot}`,
      modeLabel ? `• Handling: ${modeLabel}` : null,
      quote ? `• Device: ${quote.brand.name} ${quote.model.name}` : null,
      quote ? `• Issue: ${quote.issue.short}` : null,
      quote ? `• Estimate: ${money(quote.price)} · ready in ${quote.turnaround}` : null,
      booking.notes?.trim() ? `• Notes: ${booking.notes.trim()}` : null,
      '',
      'Please confirm the slot.',
    ),

  /** A brand the estimator does not price — the shop quotes it by hand. */
  unlistedModel: () =>
    compose(
      `${GREETING} could you quote a repair for a model that isn't on the website?`,
      '',
      '• Phone model: ',
      '• Fault: ',
    ),

  /**
   * A search that returned nothing. Sending the query itself turns the shop's
   * dead end into a stock request they can answer.
   */
  stockRequest: (query) =>
    compose(
      `${GREETING} do you have this in stock?`,
      '',
      query?.trim()
        ? `I searched your site for "${query.trim()}" and found nothing.`
        : 'I am looking for: ',
    ),

  /** Trade-in valuation from the shop page footnote. */
  valuation: () =>
    compose(
      `${GREETING} I'd like a trade-in valuation for my old phone.`,
      '',
      '• Model: ',
      '• Age / condition: ',
    ),

  /**
   * A student discount registration.
   *
   * This carries the whole form, because the chat *is* the submission — the
   * site has nowhere to store it. The ID card is deliberately not handled by
   * the website at all: the closing line asks the student to attach it here,
   * so the photo goes from their phone into an encrypted chat and never
   * touches our origin, our logs or a third-party form service.
   *
   * The marketing line is stated explicitly either way, so the shop has a
   * record of what was and was not agreed to.
   */
  studentRegistration: (form, deviceAgeLabel) =>
    compose(
      `${GREETING} I'd like to register for the student repair discount.`,
      '',
      '— STUDENT —',
      `• Name: ${form.name}`,
      `• Date of birth: ${form.dob}`,
      `• Institution: ${form.institution}`,
      `• Phone: ${form.phone}`,
      `• Email: ${form.email}`,
      `• Address: ${form.address.replace(/\s*\n\s*/g, ', ')}`,
      '',
      '— HANDSET FOR REPAIR —',
      `• Brand: ${form.deviceBrand}`,
      `• Model: ${form.deviceModel}`,
      deviceAgeLabel ? `• Owned: ${deviceAgeLabel}` : null,
      form.issue?.trim() ? `• Problem: ${form.issue.trim()}` : null,
      '',
      form.marketing
        ? '• Monthly stock emails: YES, I opt in'
        : '• Monthly stock emails: no thanks',
      '',
      'I am attaching a photo of my student ID card in this chat.',
    ),
}
