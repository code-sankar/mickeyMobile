import {
  Smartphone,
  BatteryCharging,
  Droplets,
  Cable,
  Layers,
  Camera,
} from 'lucide-react'

/**
 * Repair catalogue.
 * `prices` are the walk-in rates for a genuine/OEM-grade part, in INR.
 * The estimator applies a grade multiplier on top (see `partsGrades`).
 */

export const issues = [
  {
    id: 'screen',
    name: 'Cracked or dead screen',
    short: 'Screen',
    icon: Smartphone,
    blurb: 'Glass, digitiser and LCD/OLED assembly replaced as one unit.',
    turnaround: '45–90 minutes',
    sameDay: true,
    warranty: '90 days',
    gradable: true,
    symptoms: ['Spider cracks', 'Black or green lines', 'Ghost touch', 'Dead zones'],
    includes: [
      'Full display assembly swap',
      'True Tone / face-unlock recalibration',
      'New adhesive seal + screen protector fitted',
    ],
  },
  {
    id: 'battery',
    name: 'Battery replacement',
    short: 'Battery',
    icon: BatteryCharging,
    blurb: 'Cells below 80% health swapped for a new, cycle-tested pack.',
    turnaround: '30–45 minutes',
    sameDay: true,
    warranty: '180 days',
    gradable: true,
    symptoms: ['Drains by lunchtime', 'Random shutdowns', 'Swollen back', 'Service message'],
    includes: [
      'New battery with 0 cycles',
      'Health + charge-rate report',
      'Charging port cleaned free',
    ],
  },
  {
    id: 'water',
    name: 'Water / liquid damage',
    short: 'Water damage',
    icon: Droplets,
    blurb: 'Ultrasonic board cleaning and corrosion treatment in-house.',
    turnaround: '24–48 hours',
    sameDay: false,
    warranty: '30 days',
    gradable: false,
    symptoms: ['Dropped in water', 'No power', 'Speaker crackle', 'Fogged camera'],
    includes: [
      'Teardown + ultrasonic bath',
      'Corrosion treatment and board-level repair',
      'Data-recovery attempt at no extra cost',
    ],
  },
  {
    id: 'charging',
    name: 'Charging port',
    short: 'Charging port',
    icon: Cable,
    blurb: 'Flex or port assembly replaced, connector re-tinned.',
    turnaround: '60–90 minutes',
    sameDay: true,
    warranty: '90 days',
    gradable: true,
    symptoms: ['Wiggle to charge', 'Slow charging', 'No data transfer', 'Loose cable'],
    includes: ['New port flex assembly', 'Fast-charge handshake test', 'Accessory compatibility check'],
  },
  {
    id: 'back',
    name: 'Back glass / housing',
    short: 'Back glass',
    icon: Layers,
    blurb: 'Laser-separated rear glass with wireless charging intact.',
    turnaround: '2–4 hours',
    sameDay: true,
    warranty: '90 days',
    gradable: true,
    symptoms: ['Shattered rear panel', 'Wireless charging failing', 'Frame dents'],
    includes: ['Laser glass removal', 'Colour-matched rear panel', 'Wireless charging + IP reseal'],
  },
  {
    id: 'camera',
    name: 'Camera module',
    short: 'Camera',
    icon: Camera,
    blurb: 'Rear or front module replacement, lens glass included.',
    turnaround: '90 min – 3 hours',
    sameDay: true,
    warranty: '90 days',
    gradable: true,
    symptoms: ['Blurry photos', 'Shaking viewfinder', 'Black preview', 'Cracked lens'],
    includes: ['Module swap + lens glass', 'Focus and OIS calibration', 'Sample-shot verification'],
  },
]

/** Part grades the customer can toggle between on gradable repairs. */
export const partsGrades = [
  {
    id: 'oem',
    name: 'Genuine OEM',
    multiplier: 1,
    warrantyDays: 180,
    note: 'Manufacturer-sourced part, identical to factory spec.',
  },
  {
    id: 'premium',
    name: 'Premium aftermarket',
    multiplier: 0.68,
    warrantyDays: 90,
    note: 'Tier-1 supplier part. Same brightness and touch response, lower cost.',
  },
]

export const brands = [
  {
    id: 'apple',
    name: 'Apple',
    accent: '#93C5FD',
    blurb: 'iPhone 8 through iPhone 15 Pro Max',
    models: [
      {
        id: 'iphone-15-pro-max',
        name: 'iPhone 15 Pro Max',
        year: 2023,
        display: '6.7" Super Retina XDR',
        prices: { screen: 32900, battery: 6900, water: 4500, charging: 4900, back: 9900, camera: 14900 },
      },
      {
        id: 'iphone-15',
        name: 'iPhone 15',
        year: 2023,
        display: '6.1" Super Retina XDR',
        prices: { screen: 24900, battery: 6500, water: 4200, charging: 4200, back: 7900, camera: 11500 },
      },
      {
        id: 'iphone-14-pro',
        name: 'iPhone 14 Pro',
        year: 2022,
        display: '6.1" ProMotion XDR',
        prices: { screen: 27900, battery: 6500, water: 4200, charging: 4200, back: 8900, camera: 13500 },
      },
      {
        id: 'iphone-13',
        name: 'iPhone 13',
        year: 2021,
        display: '6.1" Super Retina XDR',
        prices: { screen: 18900, battery: 5900, water: 3900, charging: 3600, back: 6900, camera: 9900 },
      },
      {
        id: 'iphone-12',
        name: 'iPhone 12',
        year: 2020,
        display: '6.1" Super Retina XDR',
        prices: { screen: 15900, battery: 5500, water: 3900, charging: 3200, back: 6500, camera: 8900 },
      },
      {
        id: 'iphone-se-3',
        name: 'iPhone SE (3rd gen)',
        year: 2022,
        display: '4.7" Retina HD',
        prices: { screen: 9900, battery: 4500, water: 3500, charging: 2600, back: 4500, camera: 6500 },
      },
    ],
  },
  {
    id: 'samsung',
    name: 'Samsung',
    accent: '#60A5FA',
    blurb: 'Galaxy S, Z Fold/Flip and A series',
    models: [
      {
        id: 'galaxy-s24-ultra',
        name: 'Galaxy S24 Ultra',
        year: 2024,
        display: '6.8" QHD+ AMOLED 2X',
        prices: { screen: 28900, battery: 5900, water: 4200, charging: 3400, back: 7900, camera: 12500 },
      },
      {
        id: 'galaxy-s23',
        name: 'Galaxy S23',
        year: 2023,
        display: '6.1" FHD+ AMOLED 2X',
        prices: { screen: 19900, battery: 4900, water: 3900, charging: 2900, back: 5900, camera: 8900 },
      },
      {
        id: 'galaxy-z-flip-5',
        name: 'Galaxy Z Flip 5',
        year: 2023,
        display: '6.7" foldable AMOLED',
        prices: { screen: 38900, battery: 6500, water: 4900, charging: 3900, back: 8900, camera: 9900 },
      },
      {
        id: 'galaxy-s22',
        name: 'Galaxy S22',
        year: 2022,
        display: '6.1" FHD+ AMOLED 2X',
        prices: { screen: 17500, battery: 4500, water: 3900, charging: 2700, back: 5500, camera: 7900 },
      },
      {
        id: 'galaxy-a55',
        name: 'Galaxy A55 5G',
        year: 2024,
        display: '6.6" FHD+ Super AMOLED',
        prices: { screen: 8900, battery: 3200, water: 3200, charging: 2200, back: 3500, camera: 5200 },
      },
      {
        id: 'galaxy-a14',
        name: 'Galaxy A14 5G',
        year: 2023,
        display: '6.6" FHD+ PLS LCD',
        prices: { screen: 5400, battery: 2600, water: 2900, charging: 1800, back: 2600, camera: 3600 },
      },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    accent: '#6EE7B7',
    blurb: 'Pixel 6 through Pixel 8 Pro',
    models: [
      {
        id: 'pixel-8-pro',
        name: 'Pixel 8 Pro',
        year: 2023,
        display: '6.7" LTPO Super Actua',
        prices: { screen: 22900, battery: 5400, water: 4200, charging: 3200, back: 6900, camera: 11900 },
      },
      {
        id: 'pixel-8',
        name: 'Pixel 8',
        year: 2023,
        display: '6.2" Actua OLED',
        prices: { screen: 18900, battery: 4900, water: 3900, charging: 2900, back: 5900, camera: 9500 },
      },
      {
        id: 'pixel-7-pro',
        name: 'Pixel 7 Pro',
        year: 2022,
        display: '6.7" LTPO OLED',
        prices: { screen: 20900, battery: 5200, water: 4000, charging: 3100, back: 6500, camera: 10900 },
      },
      {
        id: 'pixel-7a',
        name: 'Pixel 7a',
        year: 2023,
        display: '6.1" OLED 90Hz',
        prices: { screen: 12900, battery: 4200, water: 3500, charging: 2600, back: 4500, camera: 7200 },
      },
      {
        id: 'pixel-6a',
        name: 'Pixel 6a',
        year: 2022,
        display: '6.1" OLED 60Hz',
        prices: { screen: 10900, battery: 3900, water: 3400, charging: 2400, back: 3900, camera: 6400 },
      },
    ],
  },
]

/** Bookable drop-off slots. */
export const timeSlots = [
  '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM',
]

export const serviceModes = [
  { id: 'walkin', label: 'Walk in & wait', note: 'Lounge, Wi-Fi and coffee while we work' },
  { id: 'dropoff', label: 'Drop off', note: 'We text you the moment it is ready' },
  { id: 'pickup', label: 'Free pickup', note: 'Within 8 km of TDA Market' },
]
