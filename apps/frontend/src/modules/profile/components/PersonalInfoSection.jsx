import { User, Mail, Phone, Shield } from 'lucide-react'
import { ROLE_LABELS } from '../../../core/constants/app.constants.js'
import FormInput from '../../../components/forms/FormInput.jsx'
import ErrorMessage from '../../../components/common/ErrorMessage.jsx'
import { useProfileForm } from '../profile.hooks.js'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-4 last:border-b-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value || '—'}</p>
      </div>
    </div>
  )
}

function PersonalInfoSection() {
  const { user, isEditing, setIsEditing, isSaving, error, save } = useProfileForm()

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    save({
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      mobile_number: formData.get('mobile_number'),
    })
  }

  if (!user) return null

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Personal Info</h2>
        {!isEditing && (
          <button type="button" onClick={() => setIsEditing(true)} className="btn-outline">
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorMessage message={error} />}

          <FormInput
            id="full_name"
            name="full_name"
            label="Full Name"
            icon={User}
            defaultValue={user.full_name ?? ''}
            required
          />
          <FormInput
            id="email"
            name="email"
            type="email"
            label="Email"
            icon={Mail}
            defaultValue={user.email ?? ''}
            required
          />
          <FormInput
            id="mobile_number"
            name="mobile_number"
            type="tel"
            label="Phone Number"
            icon={Phone}
            defaultValue={user.mobile_number ?? ''}
            required
          />

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-60">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <InfoRow icon={User} label="Full Name" value={user.full_name} />
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Phone} label="Phone Number" value={user.mobile_number} />
          <InfoRow icon={Shield} label="Role" value={ROLE_LABELS[user.role]} />
        </div>
      )}
    </div>
  )
}

export default PersonalInfoSection
