import { useCallback, useMemo, useState } from 'react'
import { isAgeEligible, ageFrom } from '../../../lib/studentDiscount'
import { MINIMUM_AGE, MAXIMUM_AGE, deviceAgeOptions } from '../../../data/students'
import { waLink, waMessage } from '../../../lib/whatsapp'
import { api } from '../../../lib/api'

const EMPTY = {
  name: '',
  dob: '',
  institution: '',
  phone: '',
  email: '',
  address: '',
  deviceBrand: '',
  deviceModel: '',
  deviceAge: '',
  issue: '',
  verification: false,
  marketing: false,
}

// Deliberately loose: enough to catch a typo, not so strict it rejects a
// valid address that happens to be unusual.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(values) {
  const errors = {}

  if (values.name.trim().length < 2) errors.name = 'Required'

  if (!values.dob) errors.dob = 'Required'
  else if (ageFrom(values.dob) === null) errors.dob = 'Not a date'
  // Two separate messages: "too old" and "too young" are different problems,
  // and a single "check your age" leaves someone re-typing a correct date.
  else if (!isAgeEligible(values.dob)) {
    errors.dob =
      ageFrom(values.dob) < MINIMUM_AGE ? `Must be ${MINIMUM_AGE}+` : `Offer ends at ${MAXIMUM_AGE}`
  }

  if (values.institution.trim().length < 2) errors.institution = 'Required'
  if (!/^[6-9]\d{9}$/.test(values.phone.replace(/\D/g, ''))) errors.phone = '10-digit mobile'
  if (!EMAIL.test(values.email.trim())) errors.email = 'Check this'
  if (values.address.trim().length < 10) errors.address = 'Full address'
  if (!values.deviceBrand) errors.deviceBrand = 'Pick one'
  if (values.deviceModel.trim().length < 2) errors.deviceModel = 'Required'
  if (!values.deviceAge) errors.deviceAge = 'Pick one'

  // The only consent that gates submission. Marketing is optional by design.
  if (!values.verification) errors.verification = 'Required to register'

  return errors
}

/**
 * Registration form state.
 *
 * Submitting records the registration through the API and, either way, hands
 * the student a prefilled WhatsApp message so they can attach their ID card —
 * the card is never uploaded to the website, so that last step is a chat no
 * matter what the API does.
 *
 * If the API is unreachable the WhatsApp message becomes the whole submission,
 * which is what it was before there was an API. `submitted.stored` says which
 * happened, because the confirmation screen makes a promise about what is held
 * and that promise has to match what actually occurred.
 */
export function useStudentRegistration() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const set = useCallback(
    (key) => (event) => {
      const raw = event?.target
        ? event.target.type === 'checkbox'
          ? event.target.checked
          : event.target.value
        : event
      setValues((v) => ({ ...v, [key]: raw }))
      setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
    },
    [],
  )

  const age = useMemo(() => ageFrom(values.dob), [values.dob])

  /** Focus the first bad field so a long form does not strand someone. */
  const focusFirstError = () => {
    const first = document.querySelector('[data-invalid="true"]')
    first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    first?.focus?.({ preventScroll: true })
  }

  const submit = useCallback(
    async (event) => {
      event?.preventDefault()
      if (submitting) return null

      const found = validate(values)
      setErrors(found)
      if (Object.keys(found).length) {
        focusFirstError()
        return null
      }

      const label = deviceAgeOptions.find((o) => o.id === values.deviceAge)?.label
      const link = waLink(waMessage.studentRegistration(values, label))

      setSubmitting(true)
      try {
        // The form's own `values` are posted unreshaped — the API takes the
        // same flat field names the form renders, and returns 422 details
        // keyed to them.
        const registration = await api.registerStudent(values)
        setSubmitted({ values, link, stored: true, id: registration.registrationId })
      } catch (error) {
        // A field the server rejected is the student's to fix — show it and
        // stay on the form rather than sending them to WhatsApp with a
        // registration we already know is wrong.
        if (error.isValidation && error.details) {
          setErrors(error.details)
          focusFirstError()
          return null
        }
        // Anything else is ours. WhatsApp carries the whole registration, as
        // it did before the API existed.
        setSubmitted({ values, link, stored: false, id: null })
      } finally {
        setSubmitting(false)
      }

      return link
    },
    [values, submitting],
  )

  const reset = useCallback(() => {
    setValues(EMPTY)
    setErrors({})
    setSubmitted(null)
    setSubmitting(false)
  }, [])

  return { values, errors, age, submitted, submitting, set, submit, reset }
}
