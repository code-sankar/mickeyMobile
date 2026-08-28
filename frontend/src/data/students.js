/**
 * The student repair discount, as data.
 *
 * Every rule the page states to a visitor is read from here, so changing the
 * offer is an edit to this file rather than a hunt through copy.
 */

/**
 * Discount bands.
 *
 * The percentage falls as the bill rises, which is deliberate and the opposite
 * of the usual instinct. A flat or rising percentage means the shop's largest
 * giveaway lands on its highest-value work: at 15% a Rs 32,900 flagship screen
 * costs nearly Rs 5,000 in margin, on a job whose parts cost is already the
 * least forgiving. Tapering to 7% caps the absolute rupee cost of the offer
 * while leaving the headline rate intact for the everyday repairs that bring
 * students through the door in the first place.
 *
 * One consequence to know about: because the bands are decided by bill size,
 * savings step *down* at the boundary. A Rs 14,999 bill saves Rs 1,500; a
 * Rs 15,001 bill saves Rs 1,050. Nobody pays more by spending more, so there
 * is no perverse incentive, but the counter should expect the occasional
 * question from someone just over the line.
 *
 * Change the numbers here and the offer page, the calculator, the eligibility
 * copy and the API's seed all follow.
 */
export const discountTiers = [
  {
    id: 'standard',
    percent: 10,
    min: 1000,
    max: 14999,
    label: 'Standard',
    blurb: 'Batteries, charging ports, cameras, water damage, back glass and mid-range screens.',
  },
  {
    id: 'high-value',
    percent: 7,
    min: 15000,
    max: null,
    label: 'High-value repair',
    blurb: 'Flagship and foldable display assemblies — the priciest jobs on the bench.',
  },
]

/** Below this, the offer does not apply at all. */
export const MINIMUM_SPEND = 1000

/**
 * The age window.
 *
 * The floor keeps minors' data out of the system entirely. The ceiling keeps
 * the offer pointed at the people it is meant for: without one, "any
 * institution with a photo ID card" stretches to part-time and professional
 * courses indefinitely, and a student discount that never expires stops being
 * a student discount.
 */
export const MINIMUM_AGE = 18
export const MAXIMUM_AGE = 28

export const eligibility = [
  {
    id: 'age',
    title: `Aged ${MINIMUM_AGE} to ${MAXIMUM_AGE}`,
    detail: `Verified from your date of birth at registration. Under-${MINIMUM_AGE}s cannot register, and the offer closes after ${MAXIMUM_AGE}.`,
  },
  {
    id: 'student',
    title: 'A current student',
    detail: 'School, college or university — any institution with a photo ID card that shows a valid year.',
  },
  {
    id: 'spend',
    title: `Repair bill over Rs ${MINIMUM_SPEND.toLocaleString('en-IN')}`,
    detail: 'Applies to maintenance and repair work. Parts and labour both count towards the total.',
  },
  {
    id: 'device',
    title: 'One registered handset',
    detail: 'The discount is tied to the phone you register, so we can quote and stock for it.',
  },
]

/** How long a phone has been owned — feeds the shop's stock and upgrade planning. */
export const deviceAgeOptions = [
  { id: 'under-1', label: 'Less than a year' },
  { id: '1-2', label: '1 to 2 years' },
  { id: '2-3', label: '2 to 3 years' },
  { id: 'over-3', label: 'More than 3 years' },
]

/**
 * What the shop asks for, and why.
 *
 * The "why" is not decoration: DPDP requires the purpose of each item to be
 * stated at the point of collection, and a visitor handing over an ID card
 * deserves to know what it is for before they send it.
 */
export const collectedData = [
  {
    id: 'identity',
    field: 'Name, date of birth, institution',
    purpose: 'Confirms you are a student and over 18, so the counter can honour the discount.',
  },
  {
    id: 'contact',
    field: 'Phone number and email address',
    purpose: 'Confirming your registration and telling you when a repair is ready.',
  },
  {
    id: 'address',
    field: 'Postal address',
    purpose: 'Checking you are local enough for free pickup, and for the repair invoice.',
  },
  {
    id: 'device',
    field: 'Phone brand, model and how long you have owned it',
    purpose: 'Quoting your repair accurately, and — only if you opt in — telling you when parts and accessories for that model arrive.',
  },
  {
    id: 'id-card',
    field: 'Photo of your student ID card',
    purpose: 'Proof of enrolment. Checked at the counter and not stored on this website.',
  },
]

/**
 * Consent is split by purpose. Verification is required to register at all;
 * marketing is genuinely optional and defaults to off. Bundling the two would
 * make neither of them freely given.
 */
export const consentPurposes = {
  verification: {
    id: 'verification',
    required: true,
    label:
      'I confirm the details above are mine and true, and I agree to Mickey Mobile using them to verify my student discount.',
  },
  marketing: {
    id: 'marketing',
    required: false,
    label:
      'Optional — email me about once a month when accessories, parts or new handsets for my phone come into stock.',
    detail: 'You can stop these at any time by replying to any message. Leaving this unticked does not affect your discount.',
  },
}

/** Stated to the visitor, and the rule the shop has to actually follow. */
export const retentionPolicy = {
  idCard: 'Your ID photo is checked and then deleted — it is never uploaded to this website.',
  registration: 'Your registration is kept while you are a student with us, and removed on request.',
  withdrawal: `Message or email ${'the shop'} at any time to see, correct or delete what is held.`,
}
