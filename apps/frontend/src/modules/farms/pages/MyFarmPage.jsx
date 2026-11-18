
import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, Bell, X, Upload, Trash2, Plus, Pencil, LoaderCircle, MapPin } from 'lucide-react'
import {
  createFarm,
  deleteFarmPhoto,
  getFarmPhotoContent,
  getFarmPhotos,
  getFarms,
  updateFarm,
  uploadFarmPhotos,
} from '../farms.service.js'
import { createPan, deletePan, getPans, updatePan } from '../../pans/pans.service.js'

const MAX_PHOTO_SIZE = 10 * 1024 * 1024
const MAX_PHOTO_BATCH_SIZE = 50 * 1024 * 1024
const PHOTO_EXTENSIONS = /\.(jpe?g|png|webp)$/i
const emptyPenForm = {
  name: '',
  pen_number: '',
  pen_type: '',
  max_animal_capacity: '',
  location: '',
  description: '',
}

const fields = [
  ['name', 'Farm Name'],
  ['address', 'Address'],
  ['village', 'Village'],
  ['pincode', 'Pincode'],
  ['latitude', 'Latitude'],
  ['longitude', 'Longitude'],
]

const getLocation = (farm) => {
  if (!farm) return '—'

  return [
    farm.address,
    farm.village,
    farm.pincode,
  ].filter(Boolean).join(', ') || '—'
}

const getFarmForm = (farm) => ({
  name: farm?.name ?? '',
  address: farm?.address ?? '',
  village: farm?.village ?? '',
  pincode: farm?.pincode ?? '',
  latitude: farm?.latitude ?? '',
  longitude: farm?.longitude ?? '',
})

export default function FarmsPage() {
  const [farm, setFarm] = useState(null)
  const [farms, setFarms] = useState([])
  const [editingFarm, setEditingFarm] = useState(null)
  const [farmerName, setFarmerName] = useState('Farmer')
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [photos, setPhotos] = useState([])
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [photosLoading, setPhotosLoading] = useState(false)
  const [photosUploading, setPhotosUploading] = useState(false)
  const [photosError, setPhotosError] = useState('')
  const [photosSuccess, setPhotosSuccess] = useState('')
  const [deletingPhotoId, setDeletingPhotoId] = useState(null)
  const [photoInputKey, setPhotoInputKey] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false)
  const [pens, setPens] = useState([])
  const [pensLoading, setPensLoading] = useState(false)
  const [penModalOpen, setPenModalOpen] = useState(false)
  const [editingPen, setEditingPen] = useState(null)
  const [penForm, setPenForm] = useState(emptyPenForm)
  const [penSaving, setPenSaving] = useState(false)
  const [penError, setPenError] = useState('')
  const [penSuccess, setPenSuccess] = useState('')
  const galleryUrlsRef = useRef([])
  const selectedPhotoUrlsRef = useRef([])
  const galleryFarmIdRef = useRef(null)
  const galleryRequestIdRef = useRef(0)

  const refreshGallery = useCallback(async (farmId) => {
    const requestId = ++galleryRequestIdRef.current
    if (galleryFarmIdRef.current !== farmId) {
      galleryUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      galleryUrlsRef.current = []
      galleryFarmIdRef.current = farmId ?? null
      setPhotos([])
    }

    if (!farmId) {
      setPhotosError('')
      setPhotosLoading(false)
      return true
    }

    setPhotosLoading(true)
    setPhotosError('')
    const newUrls = []
    try {
      const { data } = await getFarmPhotos(farmId)
      // Load each authenticated image independently. A single missing or
      // unreadable file must not hide every other photo in the gallery.
      const loadedPhotos = await Promise.all(
        data.map(async (photo) => {
          try {
            const { data: image } = await getFarmPhotoContent(photo.content_url)
            const previewUrl = URL.createObjectURL(image)
            newUrls.push(previewUrl)
            return { ...photo, previewUrl, imageUnavailable: false }
          } catch {
            return { ...photo, previewUrl: null, imageUnavailable: true }
          }
        })
      )

      if (requestId !== galleryRequestIdRef.current) {
        newUrls.forEach((url) => URL.revokeObjectURL(url))
        return false
      }

      galleryUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      galleryUrlsRef.current = newUrls
      setPhotos(loadedPhotos)
      return true
    } catch (err) {
      newUrls.forEach((url) => URL.revokeObjectURL(url))
      if (requestId !== galleryRequestIdRef.current) return false
      setPhotosError(
        err.response?.data?.detail || 'Unable to load farm photos.'
      )
      return false
    } finally {
      if (requestId === galleryRequestIdRef.current) {
        setPhotosLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!editing && !penModalOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [editing, penModalOpen])

  const loadFarms = async () => {
    setLoading(true)
    setError('')

    try {
      const { data } = await getFarms()

      const list = Array.isArray(data)
        ? data
        : data.items ?? []

      setFarmerName(data.farmer_name || 'Farmer')

      const firstFarm = list[0] || null

      setFarms(list)
      setFarm(firstFarm)
      setForm(getFarmForm(firstFarm))
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load farm details.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFarms()
  }, [])

  useEffect(() => {
    refreshGallery(farm?.id)
  }, [farm?.id, refreshGallery])

  const loadPens = useCallback(async (farmId) => {
    if (!farmId) {
      setPens([])
      return
    }

    setPensLoading(true)
    setPenError('')
    try {
      const { data } = await getPans(farmId)
      setPens(data.items ?? [])
    } catch (err) {
      setPenError(err.response?.data?.detail || 'Unable to load pens.')
    } finally {
      setPensLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPens(farm?.id)
  }, [farm?.id, loadPens])

  useEffect(() => () => {
    galleryUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    selectedPhotoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const openAddModal = () => {
    setError('')
    setSuccess('')
    setEditingFarm(null)
    setForm(getFarmForm(null))
    setEditing(true)
  }

  const openEditModal = () => {
    setError('')
    setSuccess('')
    setEditingFarm(farm)
    setForm(getFarmForm(farm))
    setEditing(true)
  }

  const handlePhotoSelection = (selectedFiles) => {
    const files = Array.from(selectedFiles ?? [])
    if (!files.length) return

    const currentSize = selectedPhotos.reduce(
      (total, item) => total + item.file.size,
      0
    )
    if (currentSize + files.reduce((total, file) => total + file.size, 0) > MAX_PHOTO_BATCH_SIZE) {
      setPhotosError('Upload photos in batches of up to 50 MB. Each photo can be up to 10 MB.')
      return
    }

    const invalidFile = files.find((file) => !PHOTO_EXTENSIONS.test(file.name))
    if (invalidFile) {
      setPhotosError(`${invalidFile.name} is not a JPG, JPEG, PNG, or WEBP photo.`)
      return
    }
    const oversizedFile = files.find((file) => file.size > MAX_PHOTO_SIZE)
    if (oversizedFile) {
      setPhotosError(`${oversizedFile.name} exceeds the 10 MB per-photo limit.`)
      return
    }

    const newSelections = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    selectedPhotoUrlsRef.current.push(...newSelections.map((item) => item.previewUrl))
    setSelectedPhotos((current) => [...current, ...newSelections])
    setPhotosError('')
    setPhotosSuccess('')
  }

  const removeSelectedPhoto = (photoId) => {
    setSelectedPhotos((current) => {
      const removed = current.find((item) => item.id === photoId)
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl)
        selectedPhotoUrlsRef.current = selectedPhotoUrlsRef.current.filter(
          (url) => url !== removed.previewUrl
        )
      }
      return current.filter((item) => item.id !== photoId)
    })
  }

  const discardSelectedPhotos = () => {
    selectedPhotoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    selectedPhotoUrlsRef.current = []
    setSelectedPhotos([])
    setPhotoInputKey((key) => key + 1)
  }

  const closeFarmForm = () => {
    if (photosUploading) return
    setEditing(false)
    setError('')
    setForm(getFarmForm(editingFarm))
    discardSelectedPhotos()
  }

  const submitFarmPhotos = async () => {
    if (!farm?.id || !selectedPhotos.length) return

    setPhotosUploading(true)
    setUploadProgress(0)
    setPhotosError('')
    setPhotosSuccess('')
    try {
      await uploadFarmPhotos(
        farm.id,
        selectedPhotos.map((item) => item.file),
        (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100))
          }
        }
      )
      selectedPhotoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      selectedPhotoUrlsRef.current = []
      setSelectedPhotos([])
      setPhotoInputKey((key) => key + 1)
      setUploadProgress(100)
      const refreshed = await refreshGallery(farm.id)
      if (refreshed) {
        setPhotosSuccess('Farm photos uploaded successfully.')
      } else {
        setPhotosError('Photos uploaded, but the gallery could not be refreshed.')
      }
    } catch (err) {
      setPhotosError(
        err.response?.data?.detail || 'Unable to upload farm photos.'
      )
    } finally {
      setPhotosUploading(false)
    }
  }

  const openPenModal = (pen = null) => {
    setEditingPen(pen)
    setPenForm(pen ? {
      name: pen.name ?? '',
      pen_number: pen.pen_number ?? '',
      pen_type: pen.pen_type ?? '',
      max_animal_capacity: pen.max_animal_capacity ?? '',
      location: pen.location ?? '',
      description: pen.description ?? '',
    } : emptyPenForm)
    setPenError('')
    setPenSuccess('')
    setPenModalOpen(true)
  }

  const savePen = async (event) => {
    event.preventDefault()
    if (!farm?.id) return

    setPenSaving(true)
    setPenError('')
    setPenSuccess('')
    const payload = {
      name: penForm.name.trim(),
      pen_number: penForm.pen_number.trim(),
      pen_type: penForm.pen_type.trim(),
      max_animal_capacity: Number(penForm.max_animal_capacity),
      location: penForm.location.trim() || null,
      description: penForm.description.trim() || null,
    }
    try {
      if (editingPen) {
        const { data } = await updatePan(editingPen.id, payload)
        setPens((current) => current.map((pen) => pen.id === data.id ? data : pen))
        setPenSuccess('Pen details updated.')
      } else {
        const { data } = await createPan({ ...payload, farm_id: farm.id })
        setPens((current) => [data, ...current])
        setPenSuccess('Pen added successfully.')
      }
      setPenModalOpen(false)
      setEditingPen(null)
      setPenForm(emptyPenForm)
    } catch (err) {
      setPenError(err.response?.data?.detail || 'Unable to save pen details.')
    } finally {
      setPenSaving(false)
    }
  }

  const removePen = async (pen) => {
    if (!window.confirm(`Delete pen "${pen.name}"? Pens with assigned animals cannot be deleted.`)) return
    setPenError('')
    setPenSuccess('')
    try {
      await deletePan(pen.id)
      setPens((current) => current.filter((item) => item.id !== pen.id))
      setPenSuccess('Pen deleted.')
    } catch (err) {
      setPenError(err.response?.data?.detail || 'Unable to delete pen.')
    }
  }

  const removeFarmPhoto = async (photo) => {
    if (!farm?.id || !window.confirm(`Delete "${photo.filename}"?`)) return

    setDeletingPhotoId(photo.id)
    setPhotosError('')
    setPhotosSuccess('')
    try {
      await deleteFarmPhoto(farm.id, photo.id)
      const refreshed = await refreshGallery(farm.id)
      if (refreshed) setPhotosSuccess('Farm photo deleted.')
    } catch (err) {
      setPhotosError(
        err.response?.data?.detail || 'Unable to delete farm photo.'
      )
    } finally {
      setDeletingPhotoId(null)
    }
  }

  // Save farm details through the existing API
  const saveFarm = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      setError('Farm name is required.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim() || null,
        village: form.village.trim() || null,
        pincode: form.pincode.trim() || null,
        latitude:
          form.latitude === '' ? null : Number(form.latitude),
        longitude:
          form.longitude === '' ? null : Number(form.longitude),
      }

      if (
        (payload.latitude !== null &&
          !Number.isFinite(payload.latitude)) ||
        (payload.longitude !== null &&
          !Number.isFinite(payload.longitude))
      ) {
        setError('Please enter valid latitude and longitude.')
        return
      }

      const { data } = editingFarm?.id
        ? await updateFarm(editingFarm.id, payload)
        : await createFarm(payload)

      setFarm(data)
      setFarms((currentFarms) =>
        editingFarm?.id
          ? currentFarms.map((item) => item.id === data.id ? data : item)
          : [data, ...currentFarms]
      )
      setForm(getFarmForm(data))

      setSuccess(
        editingFarm?.id
          ? 'Farm details updated successfully.'
          : 'Farm created successfully.'
      )
      setEditing(false)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        (editingFarm?.id
          ? 'Unable to update farm details.'
          : 'Unable to create farm.')
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#302e2c]">
      <style>{`
        @page { size: Letter portrait; margin: .3in; }

        @media print {
          .no-print { display: none !important; }
          .farm-layout {
            grid-template-columns: 1.7fr 1fr !important;
          }
          .farm-map { height: 5in !important; }
        }
      `}</style>

      <header className="no-print flex h-[65px] items-center justify-between border-b bg-white px-5">
        <h1 className="text-xl font-bold">My Farm</h1>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 rounded-lg border bg-[#faf8f5] px-3 py-2">
            <Search size={17} />
            <input
              placeholder="Search animals, tasks, guides..."
              className="w-44 bg-transparent text-xs outline-none"
            />
          </div>

          <Bell size={20} />

          <span className="text-sm font-medium">
            {farmerName}
          </span>
        </div>
      </header>

      <main className="farm-layout grid grid-cols-1 items-start gap-4 p-4 sm:p-5 lg:grid-cols-2">
        <div className="min-w-0 space-y-4">

          {/* Farm Details */}
          <section className="min-w-0 rounded-xl border border-[#e8e1da] bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <h2 className="min-w-0 flex-1 text-lg font-bold">
                {loading
                  ? 'Loading...'
                  : farm?.name || 'My Farm'}
              </h2>

              <div className="no-print flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
                {farms.length > 1 && (
                  <select
                    value={farm?.id ?? ''}
                    disabled={selectedPhotos.length > 0 || photosUploading}
                    onChange={(event) => {
                      const selectedFarm = farms.find(
                        (item) => item.id === event.target.value
                      )
                      if (selectedFarm) {
                        setFarm(selectedFarm)
                        setForm(getFarmForm(selectedFarm))
                      }
                    }}
                    aria-label="Select farm"
                    className="rounded-lg border bg-white px-3 py-2 text-xs"
                  >
                    {farms.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                )}

                {farm && (
                  <>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={openEditModal}
                      className="rounded-lg bg-[#d8f3dc] px-4 py-2 text-xs font-semibold text-[#347356] disabled:opacity-50"
                    >
                      Edit Farm Details
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => openPenModal()}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#347356] px-4 py-2 text-xs font-semibold text-[#347356] disabled:opacity-50"
                    >
                      <Plus size={14} /> Add Pen
                    </button>
                  </>
                )}

                <button
                  type="button"
                  disabled={loading}
                  onClick={openAddModal}
                  className="rounded-lg border border-[#347356] px-4 py-2 text-xs font-semibold text-[#347356] disabled:opacity-50"
                >
                  Add Farm
                </button>
              </div>
            </div>

            {error && (
              <p className="mb-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {success && (
              <p className="mb-3 text-sm text-green-700">
                {success}
              </p>
            )}

            {loading ? (
              <p className="text-sm text-stone-500">
                Loading farm details...
              </p>
            ) : !farm ? (
              <p className="text-sm text-stone-500">
                No farm details found for your account.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                {[
                  ['LOCATION', getLocation(farm)],
                  ['FARM NAME', farm.name],
                  ['LATITUDE', farm.latitude ?? '—'],
                  ['LONGITUDE', farm.longitude ?? '—'],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <p className="mb-1 text-[10px] text-stone-400">
                      {label}
                    </p>
                    <p className="break-words text-sm leading-5 text-stone-700">
                      {value || '—'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pens */}
          <section className="min-w-0 rounded-xl border border-[#e8e1da] bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">Pens</h2>
                <p className="mt-1 text-xs text-stone-500">Manage pens for this farm and assign animals during registration.</p>
              </div>
            </div>

            {penError && <p className="mb-3 text-sm text-red-600" role="alert">{penError}</p>}
            {penSuccess && <p className="mb-3 text-sm text-green-700" role="status">{penSuccess}</p>}
            {pensLoading ? (
              <p className="text-sm text-stone-500">Loading pens...</p>
            ) : pens.length === 0 ? (
              <p className="rounded-lg border border-dashed p-5 text-center text-sm text-stone-500">
                No pens have been added to this farm.
              </p>
            ) : (
              <div className="grid min-w-0 grid-cols-1 gap-3">
                {pens.map((pen) => (
                  <article key={pen.id} className="min-w-0 rounded-xl border border-[#e8e1da] bg-[#fff] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold">{pen.name}</h3>
                        <p className="mt-1 text-xs text-stone-500">
                          Pen {pen.pen_number || '—'} · {pen.pen_type || 'Type not set'}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button type="button" onClick={() => openPenModal(pen)} aria-label={`Edit ${pen.name}`} className="rounded-md border p-2 text-[#347356] hover:bg-green-50">
                          <Pencil size={14} />
                        </button>
                        <button type="button" onClick={() => removePen(pen)} aria-label={`Delete ${pen.name}`} className="rounded-md border p-2 text-red-600 hover:bg-red-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-600">
                      <p>Capacity: {pen.max_animal_capacity ?? '—'}</p>
                      <p>Location: {pen.location || '—'}</p>
                    </div>
                    {pen.description && <p className="mt-2 text-xs text-stone-500">{pen.description}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Pasture Map */}
        <section className="flex min-w-0 flex-col self-stretch rounded-xl border border-[#e8e1da] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-bold">
            Pasture Mapping &amp; Location
          </h2>

          <div className="flex-1 overflow-hidden rounded-xl border border-[#dce7dc] bg-[#f3f7ef]">
            <div className="relative aspect-[16/7] min-h-56 w-full overflow-hidden sm:min-h-72 lg:aspect-auto lg:min-h-[420px] lg:h-full">
              <svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label={`Illustrated map for ${farm?.name || 'farm location'}`}>
                <defs>
                  <pattern id="field-lines" width="22" height="22" patternTransform="rotate(28)" patternUnits="userSpaceOnUse">
                    <path d="M0 0V22" stroke="#c6d9b4" strokeWidth="2" opacity=".55" />
                  </pattern>
                  <pattern id="field-lines-alt" width="18" height="18" patternTransform="rotate(-22)" patternUnits="userSpaceOnUse">
                    <path d="M0 0V18" stroke="#c0d6ae" strokeWidth="2" opacity=".5" />
                  </pattern>
                  <filter id="map-shadow" x="-40%" y="-40%" width="180%" height="180%">
                    <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#244c36" floodOpacity=".25" />
                  </filter>
                </defs>
                <rect width="1200" height="520" fill="#e9f0df" />
                <path d="M0 0h420l42 150-110 90L0 190z" fill="#d9e8c9" />
                <path d="M0 0h420l42 150-110 90L0 190z" fill="url(#field-lines)" />
                <path d="M490 0h400l-40 150 80 100-110 80-190-60-95-90z" fill="#dce9cf" />
                <path d="M490 0h400l-40 150 80 100-110 80-190-60-95-90z" fill="url(#field-lines-alt)" />
                <path d="M940 0h260v210l-110 45-130-70 40-100z" fill="#d4e4c4" />
                <path d="M940 0h260v210l-110 45-130-70 40-100z" fill="url(#field-lines)" />
                <path d="M0 330l145-100 160 15 80 110-60 165H0z" fill="#dce9cf" />
                <path d="M0 330l145-100 160 15 80 110-60 165H0z" fill="url(#field-lines-alt)" />
                <path d="M430 350l170-60 145 60 55 170H390z" fill="#d5e5c7" />
                <path d="M430 350l170-60 145 60 55 170H390z" fill="url(#field-lines)" />
                <path d="M900 335l140-90 160 65v210H850z" fill="#dce9cf" />
                <path d="M900 335l140-90 160 65v210H850z" fill="url(#field-lines-alt)" />
                <path d="M-40 280C180 210 280 330 460 250S760 110 930 185 1100 295 1240 220" fill="none" stroke="#d2c9a7" strokeWidth="46" strokeLinecap="round" />
                <path d="M-40 280C180 210 280 330 460 250S760 110 930 185 1100 295 1240 220" fill="none" stroke="#fffdf5" strokeWidth="34" strokeLinecap="round" />
                <path d="M735 -30C700 100 820 180 760 280S670 410 700 560" fill="none" stroke="#d2c9a7" strokeWidth="30" strokeLinecap="round" />
                <path d="M735 -30C700 100 820 180 760 280S670 410 700 560" fill="none" stroke="#fffdf5" strokeWidth="20" strokeLinecap="round" />
                <path d="M0 430C170 385 250 450 390 420s210-60 340-20 280 70 470 8" fill="none" stroke="#b8d9d6" strokeWidth="10" opacity=".9" />
                <g filter="url(#map-shadow)" transform="translate(590 232)">
                  <circle r="34" fill="#28764d" opacity=".16" />
                  <path d="M0-31c-17 0-30 13-30 30 0 22 30 53 30 53S30 21 30-1C30-18 17-31 0-31z" fill="#28764d" stroke="white" strokeWidth="5" />
                  <circle cy="-2" r="9" fill="white" />
                </g>
              </svg>
              <div className="absolute left-4 top-4 max-w-[min(80%,22rem)] rounded-xl border border-white/80 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:left-6 sm:top-6">
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-green-700">Farm location</p>
                <p className="mt-1 truncate text-base font-bold text-stone-800">{farm?.name || 'Farm not added'}</p>
                {farm?.latitude != null && farm?.longitude != null ? (
                  <p className="mt-1 text-xs text-stone-600">{farm.latitude}, {farm.longitude}</p>
                ) : (
                  <p className="mt-1 text-xs text-stone-600">Add coordinates in farm details to save its location.</p>
                )}
              </div>
              <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3 py-2 text-xs font-semibold text-green-800 shadow sm:bottom-6 sm:right-6">
                <MapPin size={15} className="text-green-700" />
                {farm?.latitude != null && farm?.longitude != null ? 'Farm coordinates saved' : 'Illustrated farm map'}
              </div>
            </div>
          </div>
        </section>

        {/* Farm Infrastructure Gallery */}
        <section className="min-w-0 rounded-xl border border-[#e8e1da] bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-base font-bold">
            Farm Photos Gallery
          </h2>

          {photosError && (
            <p className="mb-3 text-sm text-red-600" role="alert">
              {photosError}
            </p>
          )}
          {photosSuccess && (
            <p className="mb-3 text-sm text-green-700" role="status">
              {photosSuccess}
            </p>
          )}

          <div className="mt-5 border-t pt-4">
            {photosLoading ? (
              <p className="text-sm text-stone-500">Loading farm photos...</p>
            ) : photos.length === 0 && !photosError ? (
              <p className="text-sm text-stone-500">
                No farm photos have been uploaded.
              </p>
            ) : photos.length === 0 ? null : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="group w-full max-w-[420px] overflow-hidden rounded-xl border border-[#e8e1da] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="relative aspect-video overflow-hidden bg-stone-100">
                      {photo.previewUrl && !photo.imageUnavailable ? (
                        <img
                          src={photo.previewUrl}
                          alt={photo.filename}
                          onError={() => setPhotos((current) => current.map((item) => item.id === photo.id ? { ...item, imageUnavailable: true } : item))}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-3 text-center text-sm text-stone-500" role="img" aria-label={`${photo.filename} is unavailable`}>
                          Photo unavailable
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-stone-700" title={photo.filename}>
                        {photo.filename}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFarmPhoto(photo)}
                        disabled={deletingPhotoId === photo.id}
                        aria-label={`Delete ${photo.filename}`}
                        className="shrink-0 rounded-md border p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingPhotoId === photo.id ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Farm form */}
      {editing && (
        <div className="no-print fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/40 p-4">
          <div className="flex min-h-full items-start justify-center sm:items-center">
            <form
              onSubmit={saveFarm}
              className="my-auto flex max-h-[calc(100dvh_-_2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
            >
              <div className="flex flex-none items-center justify-between border-b px-6 py-4">
                <h2 className="text-xl font-bold">
                  {editingFarm ? 'Edit Farm Details' : 'Add Farm Details'}
                </h2>

                <button
                  type="button"
                  onClick={closeFarmForm}
                  className="rounded-full p-1 hover:bg-stone-100"
                  disabled={saving || photosUploading}
                  aria-label="Close farm form"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
                {error && (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}

                {fields.map(([key, label]) => (
                  <label
                    key={key}
                    className="block text-sm font-medium"
                  >
                    {label}

                    <input
                      name={key}
                      type={
                        key === 'latitude' || key === 'longitude'
                          ? 'number'
                          : 'text'
                      }
                      step={
                        key === 'latitude' || key === 'longitude'
                          ? 'any'
                          : undefined
                      }
                      min={
                        key === 'latitude'
                          ? -90
                          : key === 'longitude'
                            ? -180
                            : undefined
                      }
                      max={
                        key === 'latitude'
                          ? 90
                          : key === 'longitude'
                            ? 180
                            : undefined
                      }
                      maxLength={
                        key === 'name' || key === 'village'
                          ? 150
                          : key === 'pincode'
                            ? 10
                            : undefined
                      }
                      value={form[key] ?? ''}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg border p-2.5"
                      required={key === 'name'}
                    />
                  </label>
                ))}

                {editingFarm && (
                  <section className="space-y-3 rounded-lg border border-[#e8e1da] p-4">
                    <div>
                      <h3 className="font-semibold">Farm Photos Gallery</h3>
                      <p className="mt-1 text-xs text-stone-500">
                        Add JPG, JPEG, PNG, or WEBP photos. Each image can be up to 10 MB; upload additional batches any time.
                      </p>
                    </div>
                    {photosError && <p className="text-sm text-red-600" role="alert">{photosError}</p>}
                    {photosSuccess && <p className="text-sm text-green-700" role="status">{photosSuccess}</p>}
                    <label
                      onDragOver={(event) => {
                        event.preventDefault()
                        setIsDraggingPhotos(true)
                      }}
                      onDragLeave={() => setIsDraggingPhotos(false)}
                      onDrop={(event) => {
                        event.preventDefault()
                        setIsDraggingPhotos(false)
                        handlePhotoSelection(event.dataTransfer.files)
                      }}
                      className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 text-center transition ${isDraggingPhotos ? 'border-green-600 bg-green-50' : 'border-stone-300 bg-stone-50 hover:bg-stone-100'} ${photosUploading ? 'pointer-events-none opacity-60' : ''}`}
                    >
                      <Upload size={24} className="mb-2 text-[#347356]" />
                      <span className="text-sm font-medium">Drag photos here or Browse Files</span>
                      <span className="mt-1 text-xs text-stone-500">50 MB maximum per upload batch</span>
                      <input
                        key={photoInputKey}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        multiple
                        disabled={photosUploading}
                        onChange={(event) => {
                          handlePhotoSelection(event.target.files)
                          event.target.value = ''
                        }}
                        className="sr-only"
                      />
                    </label>
                    {selectedPhotos.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-medium">Selected photos ({selectedPhotos.length})</p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {selectedPhotos.map((item) => (
                            <div key={item.id} className="relative min-w-0">
                              <img src={item.previewUrl} alt={`Preview ${item.file.name}`} className="h-28 w-full rounded-lg border object-cover" />
                              <button type="button" onClick={() => removeSelectedPhoto(item.id)} disabled={photosUploading} aria-label={`Remove ${item.file.name}`} className="absolute right-1 top-1 rounded-full bg-white p-1.5 text-red-600 shadow disabled:opacity-50">
                                <X size={15} />
                              </button>
                              <p className="mt-1 truncate text-xs text-stone-500">{item.file.name}</p>
                            </div>
                          ))}
                        </div>
                        {photosUploading && (
                          <div className="mt-3" role="status" aria-live="polite">
                            <div className="mb-1 flex items-center justify-between text-xs text-stone-600">
                              <span className="inline-flex items-center gap-2"><LoaderCircle size={14} className="animate-spin" /> Uploading photos...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                              <div className="h-full rounded-full bg-green-700 transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={submitFarmPhotos}
                          disabled={photosUploading || !farm}
                          className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          {photosUploading ? `Uploading ${uploadProgress}%` : `Upload ${selectedPhotos.length} Photos`}
                        </button>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      {photosLoading ? (
                        <p className="inline-flex items-center gap-2 text-sm text-stone-500"><LoaderCircle size={15} className="animate-spin" /> Loading saved photos...</p>
                      ) : (
                        <p className="text-xs text-stone-500">
                          {photos.length} saved photo{photos.length === 1 ? '' : 's'} appear in the gallery on the My Farm page.
                        </p>
                      )}
                    </div>
                  </section>
                )}
              </div>

              <div className="flex flex-none justify-end gap-3 border-t bg-white p-4">
                <button
                  type="button"
                  onClick={closeFarmForm}
                  className="rounded-lg border px-4 py-2"
                  disabled={saving || photosUploading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-green-700 px-4 py-2 text-white disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingFarm
                      ? 'Save Changes'
                      : 'Create Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {penModalOpen && (
        <div className="no-print fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-black/40 p-4">
          <div className="flex min-h-full items-start justify-center sm:items-center">
            <form
              onSubmit={savePen}
              className="my-auto w-full max-w-xl rounded-xl bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="text-xl font-bold">{editingPen ? 'Edit Pen' : 'Add Pen'}</h2>
                <button
                  type="button"
                  onClick={() => setPenModalOpen(false)}
                  disabled={penSaving}
                  aria-label="Close pen form"
                  className="rounded-full p-1 hover:bg-stone-100 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
                {penError && <p className="sm:col-span-2 text-sm text-red-600" role="alert">{penError}</p>}
                <label className="text-sm font-medium">Pen Name
                  <input required maxLength={100} value={penForm.name} onChange={(event) => setPenForm((current) => ({ ...current, name: event.target.value }))} className="mt-1 w-full rounded-lg border p-2.5" />
                </label>
                <label className="text-sm font-medium">Pen Number
                  <input required maxLength={100} value={penForm.pen_number} onChange={(event) => setPenForm((current) => ({ ...current, pen_number: event.target.value }))} className="mt-1 w-full rounded-lg border p-2.5" />
                </label>
                <label className="text-sm font-medium">Pen Type
                  <input required maxLength={100} value={penForm.pen_type} onChange={(event) => setPenForm((current) => ({ ...current, pen_type: event.target.value }))} className="mt-1 w-full rounded-lg border p-2.5" />
                </label>
                <label className="text-sm font-medium">Maximum Animal Capacity
                  <input required type="number" min="1" step="1" value={penForm.max_animal_capacity} onChange={(event) => setPenForm((current) => ({ ...current, max_animal_capacity: event.target.value }))} className="mt-1 w-full rounded-lg border p-2.5" />
                </label>
                <label className="text-sm font-medium sm:col-span-2">Location
                  <input value={penForm.location} onChange={(event) => setPenForm((current) => ({ ...current, location: event.target.value }))} className="mt-1 w-full rounded-lg border p-2.5" />
                </label>
                <label className="text-sm font-medium sm:col-span-2">Description
                  <textarea rows={3} value={penForm.description} onChange={(event) => setPenForm((current) => ({ ...current, description: event.target.value }))} className="mt-1 w-full rounded-lg border p-2.5" />
                </label>
              </div>
              <div className="flex justify-end gap-3 border-t bg-white p-4">
                <button type="button" onClick={() => setPenModalOpen(false)} disabled={penSaving} className="rounded-lg border px-4 py-2 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={penSaving} className="rounded-lg bg-green-700 px-4 py-2 text-white disabled:opacity-50">
                  {penSaving ? 'Saving...' : 'Save Pen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
