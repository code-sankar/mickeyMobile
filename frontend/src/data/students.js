/**
 * The student repair discount, as data.
 *
 * Every rule the page states to a visitor is read from here, so changing the
 * offer is an edit to this file rather than a hunt through copy.
 */

/**
 * Discount bands.
 *
 * The brief said "10-15%" without saying what decides which. Splitting it on
 * bill size is the assumption baked in here: it rewards the larger repairs
 * without giving 15% away on a Rs 1,100 battery swap. Change the numbers here
 * and the offer page, the calculator and the eligibility copy all follow.
 */
export const discountTiers = [
  {
    id: 'standard',
    percent: 10,
    min: 1000,
    max: 4999,
    label: 'Standard',
    blurb: 'Screen protectors, batteries, charging ports and most single-part jobs.',
  },
  {
    id: 'major',
    percent: 15,
    min: 5000,
    max: null,
    label: 'Major repair',
    blurb: 'Display assemblies, board-level work and water-damage recovery.',
  },
]

/** Below this, the offer does not apply at all. */
export const MINIMUM_SPEND = 1000

/** The offer is for adults only — this also keeps minors' data out of the system. */
export const MINIMUM_AGE = 18

export const eligibility = [
  {
    id: 'age',
    title: '18 or older',
    detail: 'Verified from your date of birth at registration. Under-18s cannot register.',
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
