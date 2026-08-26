import { useCallback, useMemo, useState } from 'react'
import { isOldEnough, ageFrom } from '../../../lib/studentDiscount'
import { MINIMUM_AGE, deviceAgeOptions } from '../../../data/students'
import { waLink, waMessage } from '../../../lib/whatsapp'

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
  else if (!isOldEnough(values.dob)) errors.dob = `Must be ${MINIMUM_AGE}+`

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
 * There is no backend, so "submitting" means handing the completed
 * registration to WhatsApp with everything filled in — see
 * `waMessage.studentRegistration`. The hook returns that link rather than
 * navigating itself, so the view decides how it opens.
 */
export function useStudentRegistration() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)

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

  const submit = useCallback(
    (event) => {
      event?.preventDefault()
      const found = validate(values)
      setErrors(found)
      if (Object.keys(found).length) {
        // Send focus to the first problem so a long form does not strand
        // someone at the bottom wondering what failed.
        const first = document.querySelector('[data-invalid="true"]')
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        first?.focus?.({ preventScroll: true })
        return null
      }

      const label = deviceAgeOptions.find((o) => o.id === values.deviceAge)?.label
      const link = waLink(waMessage.studentRegistration(values, label))
      setSubmitted({ values, link })
      return link
    },
    [values],
  )

  const reset = useCallback(() => {
    setValues(EMPTY)
    setErrors({})
    setSubmitted(null)
  }, [])

  return { values, errors, age, submitted, set, submit, reset }
}
