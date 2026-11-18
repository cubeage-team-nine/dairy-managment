import { useEffect, useState } from 'react'
import { Camera, RefreshCw, Save } from 'lucide-react'
import api from '../../../core/services/api'
import { useAuth } from '../../../core/hooks/useAuth'
import { getMyDoctorProfile, getMyDoctorPhoto, updateMyDoctorProfile, updateMyDoctorAvailability, uploadMyDoctorPhoto } from '../doctors.service'
import { showErrorToast, showSuccessToast } from '../../../core/services/toastNotifications'

const fields = [
  ['full_name','Doctor Name'], ['email','Email Address'], ['mobile_number','Mobile Number'],
  ['qualification','Qualification'], ['specialization','Specialization'], ['experience_years','Experience (years)'],
  ['registration_number','Registration Number'], ['address','Address'], ['village','Village'], ['district','District'], ['state','State'],
]
const input = 'mt-1 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-green-700'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [photoUrl, setPhotoUrl] = useState('')
  const [password, setPassword] = useState({ current_password:'', new_password:'', confirm_new_password:'' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availabilitySaving, setAvailabilitySaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await getMyDoctorProfile()
      setProfile(data); setForm(data)
      if (data.profile_photo) {
        const photo = await getMyDoctorPhoto()
        const nextUrl = URL.createObjectURL(photo.data)
        setPhotoUrl((old) => { if (old) URL.revokeObjectURL(old); return nextUrl })
      }
    } catch (err) { setError(err.response?.data?.detail || 'Unable to load your doctor profile.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load(); return () => { if (photoUrl) URL.revokeObjectURL(photoUrl) } }, [])

  const saveProfile = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('')
    const payload = { ...form, experience_years: form.experience_years === '' ? null : Number(form.experience_years) }
    delete payload.id; delete payload.profile_photo; delete payload.account_status; delete payload.is_verified; delete payload.is_available
    try { const { data } = await updateMyDoctorProfile(payload); setProfile(data); setForm(data); updateUser({ ...user, name: data.full_name, full_name: data.full_name, email: data.email, mobile_number: data.mobile_number }); setNotice('Profile updated.') }
    catch (err) { setError(err.response?.data?.detail || 'Unable to save your profile.') }
    finally { setSaving(false) }
  }
  const toggleAvailability = async () => {
    if (availabilitySaving || !profile) return
    const nextAvailability = !profile.is_available
    setAvailabilitySaving(true)
    try {
      const { data } = await updateMyDoctorAvailability(nextAvailability)
      setProfile(data)
      setForm((current) => ({ ...current, is_available: data.is_available }))
      showSuccessToast(`You are now ${data.is_available ? 'Available' : 'Unavailable'}.`)
    } catch (err) {
      showErrorToast(err.response?.data?.detail || 'Unable to update availability.')
    } finally {
      setAvailabilitySaving(false)
    }
  }
  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError(''); setNotice('')
    try {
      const { data } = await uploadMyDoctorPhoto(file); setProfile(data); setForm((current) => ({ ...current, profile_photo: data.profile_photo }))
      const photo = await getMyDoctorPhoto(); const nextUrl = URL.createObjectURL(photo.data)
      setPhotoUrl((old) => { if (old) URL.revokeObjectURL(old); return nextUrl }); setNotice('Profile photo updated.')
    } catch (err) { setError(err.response?.data?.detail || 'Unable to upload profile photo.') }
    event.target.value = ''
  }
  const changePassword = async (event) => {
    event.preventDefault(); setError(''); setNotice(''); setSaving(true)
    try { await api.post('/auth/change-password', password); setPassword({ current_password:'', new_password:'', confirm_new_password:'' }); setNotice('Password changed successfully.') }
    catch (err) { setError(err.response?.data?.detail || 'Unable to change password.') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center p-16"><RefreshCw className="animate-spin text-green-700"/></div>
  return <div className="mx-auto max-w-5xl space-y-6 p-5 text-slate-800 md:p-7">
    <header><h1 className="text-2xl font-bold">Doctor Profile</h1><p className="mt-1 text-sm text-slate-500">Your professional information and account settings.</p></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
    <section className="rounded-xl border bg-white p-5"><div className="mb-5 flex flex-wrap items-center gap-4"><div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-green-50 text-2xl font-bold text-green-800">{photoUrl ? <img src={photoUrl} alt="Doctor profile" className="h-full w-full object-cover"/> : profile?.full_name?.[0] || 'D'}</div><div><p className="font-semibold">Profile Photo</p><label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Camera size={15}/> Upload photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadPhoto} className="sr-only"/></label><p className="mt-1 text-xs text-slate-500">JPEG, PNG, or WebP. Maximum 5 MB.</p></div></div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
        <div><h2 className="text-sm font-semibold">Availability Status</h2><p className="mt-0.5 text-xs text-slate-500">Choose whether farmers can see you for new appointments.</p></div>
        <button type="button" onClick={toggleAvailability} disabled={availabilitySaving}
          aria-pressed={Boolean(profile?.is_available)}
          className={`min-w-32 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow disabled:cursor-wait disabled:opacity-60 ${profile?.is_available ? 'bg-green-700 hover:bg-green-800' : 'bg-red-600 hover:bg-red-700'}`}>
          {availabilitySaving ? 'Updating…' : profile?.is_available ? 'Available' : 'Unavailable'}
        </button>
      </div>
      <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">{fields.map(([name,label]) => <label key={name} className="text-sm font-medium">{label}<input type={name === 'email' ? 'email' : name === 'experience_years' ? 'number' : 'text'} min={name === 'experience_years' ? '0' : undefined} value={form[name] ?? ''} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className={input}/></label>)}
        <div className="flex justify-end sm:col-span-2"><button disabled={saving} className="flex items-center gap-2 rounded-lg bg-green-800 px-4 py-2.5 text-sm text-white disabled:opacity-50"><Save size={15}/>{saving ? 'Saving...' : 'Save Profile'}</button></div>
      </form>
    </section>
    <section className="rounded-xl border bg-white p-5"><h2 className="mb-4 font-semibold">Change Password</h2><form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-3">{[['current_password','Current password'],['new_password','New password'],['confirm_new_password','Confirm new password']].map(([name,label]) => <label key={name} className="text-sm font-medium">{label}<input required type="password" minLength="8" value={password[name]} onChange={(e) => setPassword({ ...password, [name]: e.target.value })} className={input}/></label>)}<div className="flex justify-end sm:col-span-3"><button disabled={saving} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Update Password</button></div></form></section>
  </div>
}
