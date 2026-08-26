import { Stethoscope, ClipboardCheck, Wrench, ShieldCheck } from 'lucide-react'

/** The four stages every ticket moves through — used by the timeline and the hero ticket card. */
export const processSteps = [
  {
    id: 'diagnosis',
    step: '01',
    title: 'Free diagnosis',
    icon: Stethoscope,
    duration: '10–15 min',
    summary: 'A technician runs a 42-point bench test while you watch, not in a back room.',
    detail: [
      'Board, battery, display and sensor tests',
      'We show you exactly what failed',
      'No charge, even if you walk away',
    ],
  },
  {
    id: 'approval',
    step: '02',
    title: 'Fixed quote & approval',
    icon: ClipboardCheck,
    duration: '2 min',
    summary: 'You see the part, the grade, the price and the warranty before anything is opened.',
    detail: [
      'Written quote on WhatsApp or paper',
      'Choose OEM or premium aftermarket parts',
      'The quote is the final bill — no surprises',
    ],
  },
  {
    id: 'repair',
    step: '03',
    title: 'Expert repair',
    icon: Wrench,
    duration: '30 min – 48 hrs',
    summary: 'Board-level work at an ESD-safe bench, by technicians who do this every day.',
    detail: [
      'ESD-safe benches and calibrated tools',
      'Micro-soldering and ultrasonic cleaning in-house',
      'Live status updates by SMS',
    ],
  },
  {
    id: 'qc',
    step: '04',
    title: 'Quality test & pickup',
    icon: ShieldCheck,
    duration: '10 min',
    summary: 'Every repair is re-tested end to end and leaves with a warranty card in the box.',
    detail: [
      'Full re-test of every function, not just the fixed one',
      'Up to 180-day warranty, honoured at the counter',
      'Screen protector refitted free',
    ],
  },
]
