import { AtSign, GraduationCap, IdCard, MapPin, Phone, Smartphone, User } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import {
  Checkbox,
  Field,
  SelectInput,
  TextArea,
  TextInput,
} from '../../../components/ui/Field'
import { useStudentRegistration } from '../hooks/useStudentRegistration'
import { consentPurposes, deviceAgeOptions, MINIMUM_AGE, MAXIMUM_AGE } from '../../../data/students'
import { earliestEligibleDob, latestEligibleDob } from '../../../lib/studentDiscount'
import { servicedBrands } from '../../../data/site'
import { RegistrationSent } from './RegistrationSent'

// Both ends of the window, so the picker cannot offer an ineligible date.
const maxDob = latestEligibleDob()
const minDob = earliestEligibleDob()

export function RegistrationForm({ id = 'register' }) {
  const { values, errors, age, submitted, submitting, set, submit, reset } = useStudentRegistration()

  if (submitted) return <RegistrationSent submitted={submitted} onReset={reset} id={id} />

  return (
    <Card id={id} shadow="lg" className="scroll-mt-28 overflow-hidden">
      <div className="border-b-3 border-ink bg-acid px-5 py-4 sm:px-6">
        <h2 className="font-display text-base uppercase sm:text-lg">Student portal registration</h2>
        <p className="mt-1.5 text-xs font-medium text-ink-800">
          One form, once. Bring the same phone in whenever it needs work.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="space-y-7 p-5 sm:p-6">
        {/* ---------- You ---------- */}
        <fieldset className="space-y-5">
          <legend className="mb-1 font-mono text-2xs font-bold uppercase tracking-[0.2em] text-ink-500">
            About you
          </legend>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" error={errors.name} icon={User} htmlFor="st-name">
              <TextInput
                id="st-name"
                value={values.name}
                onChange={set('name')}
                autoComplete="name"
                placeholder="Ananya Bora"
                error={errors.name}
                data-invalid={Boolean(errors.name)}
              />
            </Field>

            <Field
              label="Date of birth"
              error={errors.dob}
              icon={IdCard}
              htmlFor="st-dob"
              hint={
                age !== null && age >= MINIMUM_AGE && age <= MAXIMUM_AGE
                  ? `Age ${age} — eligible`
                  : `The offer is for ages ${MINIMUM_AGE} to ${MAXIMUM_AGE}`
              }
            >
              <TextInput
                id="st-dob"
                type="date"
                min={minDob}
                max={maxDob}
                value={values.dob}
                onChange={set('dob')}
                error={errors.dob}
                data-invalid={Boolean(errors.dob)}
              />
            </Field>
          </div>

          <Field
            label="School / college / university"
            error={errors.institution}
            icon={GraduationCap}
            htmlFor="st-institution"
          >
            <TextInput
              id="st-institution"
              value={values.institution}
              onChange={set('institution')}
              placeholder="Women's College, Tinsukia"
              error={errors.institution}
              data-invalid={Boolean(errors.institution)}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Mobile number" error={errors.phone} icon={Phone} htmlFor="st-phone">
              <TextInput
                id="st-phone"
                value={values.phone}
                onChange={set('phone')}
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="98765 43210"
                error={errors.phone}
                data-invalid={Boolean(errors.phone)}
              />
            </Field>

            <Field label="Email address" error={errors.email} icon={AtSign} htmlFor="st-email">
              <TextInput
                id="st-email"
                type="email"
                value={values.email}
                onChange={set('email')}
                autoComplete="email"
                placeholder="ananya@example.com"
                error={errors.email}
                data-invalid={Boolean(errors.email)}
              />
            </Field>
          </div>

          <Field label="Address" error={errors.address} icon={MapPin} htmlFor="st-address">
            <TextArea
              id="st-address"
              rows={3}
              value={values.address}
              onChange={set('address')}
              autoComplete="street-address"
              placeholder="House / street, locality, town, PIN"
              error={errors.address}
              data-invalid={Boolean(errors.address)}
            />
          </Field>
        </fieldset>

        {/* ---------- The handset ---------- */}
        <fieldset className="space-y-5 border-t-3 border-ink pt-6">
          <legend className="mb-1 font-mono text-2xs font-bold uppercase tracking-[0.2em] text-ink-500">
            The phone you want repaired
          </legend>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Brand" error={errors.deviceBrand} icon={Smartphone} htmlFor="st-brand">
              <SelectInput
                id="st-brand"
                value={values.deviceBrand}
                onChange={set('deviceBrand')}
                error={errors.deviceBrand}
                data-invalid={Boolean(errors.deviceBrand)}
              >
                <option value="">Choose a brand…</option>
                {servicedBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
                <option value="Other">Something else</option>
              </SelectInput>
            </Field>

            <Field
              label="Model"
              error={errors.deviceModel}
              htmlFor="st-model"
              hint="As printed on the box or in Settings › About"
            >
              <TextInput
                id="st-model"
                value={values.deviceModel}
                onChange={set('deviceModel')}
                placeholder="Galaxy S22 5G"
                error={errors.deviceModel}
                data-invalid={Boolean(errors.deviceModel)}
              />
            </Field>
          </div>

          <Field label="How long have you owned it?" error={errors.deviceAge} htmlFor="st-age">
            <SelectInput
              id="st-age"
              value={values.deviceAge}
              onChange={set('deviceAge')}
              error={errors.deviceAge}
              data-invalid={Boolean(errors.deviceAge)}
              className="sm:max-w-xs"
            >
              <option value="">Choose…</option>
              {deviceAgeOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="What's wrong with it? (optional)" htmlFor="st-issue">
            <TextArea
              id="st-issue"
              rows={2}
              value={values.issue}
              onChange={set('issue')}
              placeholder="Screen cracked after a drop, touch still works."
            />
          </Field>
        </fieldset>

        {/* ---------- Consent ---------- */}
        <fieldset className="space-y-3 border-t-3 border-ink pt-6">
          <legend className="mb-1 font-mono text-2xs font-bold uppercase tracking-[0.2em] text-ink-500">
            Your permission
          </legend>

          <Checkbox
            label={consentPurposes.verification.label}
            error={errors.verification}
            checked={values.verification}
            onChange={set('verification')}
            data-invalid={Boolean(errors.verification)}
          />
          {errors.verification && (
            <p role="alert" className="font-mono text-2xs font-bold uppercase text-flare">
              {errors.verification}
            </p>
          )}

          <Checkbox
            label={consentPurposes.marketing.label}
            detail={consentPurposes.marketing.detail}
            checked={values.marketing}
            onChange={set('marketing')}
          />
        </fieldset>

        <div className="border-t-3 border-ink pt-6">
          <Button type="submit" size="lg" disabled={submitting} className="w-full">
            {submitting ? 'Registering…' : 'Register and send my details'}
          </Button>
          <p className="mt-3 text-center text-2xs font-medium leading-relaxed text-ink-700">
            Your student ID photo is never uploaded to this website — you show it at the counter, or
            attach it in WhatsApp on the next screen.
          </p>
        </div>
      </form>
    </Card>
  )
}
