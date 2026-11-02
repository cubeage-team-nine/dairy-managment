// Form validation rules for the Milk Centers module

/**
 * Validates a milk center form payload.
 * Returns an errors object: { field: 'message' } — empty object means valid.
 */
export function validateMilkCenter(form) {
  const errors = {}

  if (!form.name?.trim())
    errors.name = 'Center name is required.'

  if (!form.code?.trim())
    errors.code = 'Center code is required.'
  else if (!/^MC\d{3,}$/i.test(form.code.trim()))
    errors.code = 'Code must be in format MC001.'

  if (!form.location?.trim())
    errors.location = 'Location is required.'

  if (!form.manager?.trim())
    errors.manager = 'Manager name is required.'

  if (!form.contact?.trim())
    errors.contact = 'Contact number is required.'
  else if (!/^\d{10}$/.test(form.contact.trim()))
    errors.contact = 'Contact must be a 10-digit number.'

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Enter a valid email address.'

  if (!form.capacity || Number(form.capacity) <= 0)
    errors.capacity = 'Capacity must be greater than 0.'

  return errors
}

/** Returns true if the form has no validation errors */
export const isValid = (form) => Object.keys(validateMilkCenter(form)).length === 0
