import { useRef } from 'react'
import PasswordInput from '../../../components/forms/PasswordInput.jsx'
import ErrorMessage from '../../../components/common/ErrorMessage.jsx'
import { useChangePassword } from '../profile.hooks.js'

function ChangePasswordSection() {
  const { isSaving, error, success, save } = useChangePassword()
  const formRef = useRef(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    await save({
      current_password: formData.get('current_password'),
      new_password: formData.get('new_password'),
      confirm_new_password: formData.get('confirm_new_password'),
    })
    formRef.current?.reset()
  }

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Change Password</h2>

      <form ref={formRef} onSubmit={handleSubmit} className="max-w-sm space-y-4">
        {error && <ErrorMessage message={error} />}
        {success && !error && (
          <div className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
            Password changed successfully.
          </div>
        )}

        <PasswordInput
          id="current_password"
          name="current_password"
          label="Current Password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
        <PasswordInput
          id="new_password"
          name="new_password"
          label="New Password"
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={8}
          required
          helperText="Must be at least 8 characters."
        />
        <PasswordInput
          id="confirm_new_password"
          name="confirm_new_password"
          label="Confirm New Password"
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={8}
          required
        />

        <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-60">
          {isSaving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}

export default ChangePasswordSection
