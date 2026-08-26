import { Car, Train } from 'lucide-react'

const routes = [
  { icon: Car, label: 'Parking', value: 'Street parking available near the market entrance' },
  { icon: Train, label: 'Public transport', value: 'Autos and shared taxis stop right outside TDA Market' },
]

export function GettingHere() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {routes.map(({ icon: Icon, label, value }) => (
        <li key={label} className="border-3 border-ink bg-paper-200 p-4 shadow-brut-sm">
          <p className="flex items-center gap-2 font-mono text-2xs font-bold uppercase tracking-wider">
            <Icon className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
            {label}
          </p>
          <p className="mt-2.5 text-xs font-medium leading-relaxed text-ink-800">{value}</p>
        </li>
      ))}
    </ul>
  )
}
