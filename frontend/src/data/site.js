/**
 * Single source of truth for business identity.
 *
 * The name and address match the Google listing. Everything else here is
 * still a placeholder and must be confirmed before launch: the phone number,
 * the WhatsApp number, the mickeymobile.in domain the email and canonical URL
 * assume, and the map coordinates (town-level only — see the comment on
 * `geo` in index.html). `google.cid` is independently verified — it comes
 * from the real listing.
 */
export const site = {
  name: 'Mickey Mobile',
  tagline: 'Sales · Repair · Accessories',
  phoneDisplay: '+91 98765 43210',
  phoneHref: 'tel:+919876543210',
  /**
   * WhatsApp number in wa.me form: country code, no +, no spaces.
   * Every WhatsApp link on the site is built from this one value by
   * `src/lib/whatsapp.js` — there are no hardcoded wa.me URLs anywhere else.
   */
  whatsappNumber: '919876543210',
  email: 'hello@mickeymobile.in',
  address: {
    line1: '2nd Floor, Shop No 258',
    line2: 'TDA Market',
    city: 'Tinsukia',
    region: 'Assam',
    postal: '786125',
  },
  directionsHref: 'https://maps.google.com/?cid=2721419290466753029',

  /**
   * Google Business Profile.
   *
   * `cid` is decoded from the listing URL (0x25c46c6d0d2a9a05) and needs no
   * API key — it is what the "see us on Google" and directions links point at.
   * The live review fetch additionally needs a Place ID, which is supplied
   * through VITE_GOOGLE_PLACE_ID rather than committed here. See README.
   */
  google: {
    cid: '2721419290466753029',
    mapsUrl: 'https://maps.google.com/?cid=2721419290466753029',
  },

  /**
   * SAMPLE figures — not a real Google rating.
   *
   * Shown only until the live Places integration is configured, and never
   * labelled as coming from Google while `useGoogleReviews` reports the
   * sample source. Delete this block once the profile is connected.
   */
  sampleRating: { value: 4.9, count: 612 },
  stats: [
    { value: 11400, suffix: '+', label: 'Devices repaired' },
    { value: 45, suffix: ' min', label: 'Average screen swap' },
    { value: 90, suffix: '-day', label: 'Repair warranty' },
    { value: 4.9, suffix: '★', label: 'Average rating', decimals: 1, fromReviews: true },
  ],
}

/** 0 = Sunday, matching Date.prototype.getDay(). */
export const hours = [
  { day: 'Sunday', short: 'Sun', dayIndex: 0, open: '11:00', close: '18:00' },
  { day: 'Monday', short: 'Mon', dayIndex: 1, open: '10:00', close: '20:30' },
  { day: 'Tuesday', short: 'Tue', dayIndex: 2, open: '10:00', close: '20:30' },
  { day: 'Wednesday', short: 'Wed', dayIndex: 3, open: '10:00', close: '20:30' },
  { day: 'Thursday', short: 'Thu', dayIndex: 4, open: '10:00', close: '20:30' },
  { day: 'Friday', short: 'Fri', dayIndex: 5, open: '10:00', close: '20:30' },
  { day: 'Saturday', short: 'Sat', dayIndex: 6, open: '10:00', close: '21:00' },
]

export const navLinks = [
  { label: 'Repairs', to: '/repairs' },
  { label: 'Shop', to: '/shop' },
  { label: 'Accessories', to: '/accessories' },
  { label: 'Students', to: '/students' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Visit us', to: '/visit' },
]

/** Brands serviced — rendered as the ticker under the hero. */
export const servicedBrands = [
  'Apple', 'Samsung', 'Google Pixel', 'OnePlus', 'Nothing', 'Xiaomi', 'Vivo', 'Oppo', 'Motorola', 'Realme',
]
