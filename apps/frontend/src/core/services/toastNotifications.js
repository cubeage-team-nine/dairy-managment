import { toast } from 'react-toastify'

const toastOptions = (message, type) => ({
  position: 'top-right',
  autoClose: 3500,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  toastId: `${type}:${message}`,
})

export const showSuccessToast = (message) => toast.success(message, toastOptions(message, 'success'))
export const showErrorToast = (message) => toast.error(message, toastOptions(message, 'error'))
export const showWarningToast = (message) => toast.warning(message, toastOptions(message, 'warning'))
export const showInfoToast = (message) => toast.info(message, toastOptions(message, 'info'))

const messageText = (value) => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map((entry) => entry?.msg || entry?.message || String(entry)).join('; ')
  if (value && typeof value === 'object') return value.message || value.msg || ''
  return ''
}

const responseMessage = (response, fallback) =>
  messageText(response?.data?.message) || messageText(response?.data?.detail) || messageText(response?.message) || fallback

const errorMessage = (error, fallback) =>
  messageText(error?.response?.data?.detail) || messageText(error?.response?.data?.message) || fallback || error?.message || 'Something went wrong. Please try again.'

/** Show action feedback only after the request resolves or rejects. */
export const withMutationToast = (request, { success, error }) =>
  Promise.resolve(request)
    .then((response) => {
      showSuccessToast(responseMessage(response, success))
      return response
    })
    .catch((reason) => {
      showErrorToast(errorMessage(reason, error))
      throw reason
    })
