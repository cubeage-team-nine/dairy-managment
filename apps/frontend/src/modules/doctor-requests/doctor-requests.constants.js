// src/modules/doctor-requests/doctor-requests.constants.js

export const PRIORITY_TYPES = {
  URGENT: 'URGENT',
  NORMAL: 'NORMAL',
  LOW: 'LOW',
};

export const REQUEST_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const PRIORITY_STYLES = {
  [PRIORITY_TYPES.URGENT]: {
    bg: 'bg-[#fff1f2]',
    text: 'text-[#e11d48]',
    border: 'border-[#fecdd3]',
    label: 'URGENT',
  },
  [PRIORITY_TYPES.NORMAL]: {
    bg: 'bg-[#fef9c3]',
    text: 'text-[#ca8a04]',
    border: 'border-[#fef08a]',
    label: 'NORMAL',
  },
  [PRIORITY_TYPES.LOW]: {
    bg: 'bg-[#ecfdf5]',
    text: 'text-[#059669]',
    border: 'border-[#a7f3d0]',
    label: 'LOW',
  },
};

export const ACTIVE_LABS = [
  {
    id: 'lab-1',
    name: 'Amul Central Diagnostic Lab',
    status: 'online',
    statusColor: '#10B981', // green
    badgeColor: 'bg-emerald-500',
    turnaround: '2-4 hrs turnaround',
    location: 'Anand Central Complex',
    testsAvailable: 'Milk Culture, Blood Smears, Hematology, PCR Mastitis',
    phone: '+91 2692 258000',
  },
  {
    id: 'lab-2',
    name: 'National Mastitis Group',
    status: 'online',
    statusColor: '#F59E0B', // amber
    badgeColor: 'bg-amber-500',
    turnaround: 'Same day sensitivity',
    location: 'NDDB Research Campus',
    testsAvailable: 'SCC Automated Counting, Pathogen DNA Screening, Antibiotic Resistance',
    phone: '+91 2692 260148',
  },
];

export const DOCTOR_PROFILE = {
  name: 'Dr. Amit Patel',
  title: 'Lead Vet Surgeon',
  qualification: 'BVSc & AH, MVSc (Surgery & Radiology)',
  registrationNo: 'GVC-2014-08992',
  experience: '12+ Years Veterinary Excellence',
  status: 'ON DUTY',
  hospital: 'Amul District Veterinary Polyclinic',
  avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=256&auto=format&fit=crop',
};

export const DECLINE_REASONS = [
  'Outside operational radius / emergency travel zone (> 35 km)',
  'Doctor schedule fully booked with scheduled surgeries today',
  'Requires specialized in-patient hospitalization facility',
  'Referred to District Livestock Polyclinic specialist',
  'Duplicate or test emergency request',
  'Farmer canceled request or resolved locally',
];

// ── Doctor Dashboard sample data ─────────────────────────────────────────

export const ASSIGNED_ANIMALS = [
  { id:1, tag:'#COW-4029', breed:'HF',      farm:'Surya Farms',    issue:'High fever, milk drop',           status:'Critical'   },
  { id:2, tag:'#COW-1082', breed:'Jersey',  farm:'Balaji Dairy',   issue:'Mastitis – left rear',            status:'Under Care' },
  { id:3, tag:'#COW-2041', breed:'Gir',     farm:'Ganga Bovines',  issue:'Pregnancy check',                 status:'Scheduled'  },
  { id:4, tag:'#COW-3105', breed:'Murrah',  farm:'GreenPastures',  issue:'Rumen bloat',                     status:'Critical'   },
  { id:5, tag:'#COW-8812', breed:'HF',      farm:'Panchamrit',     issue:'Sole ulcer, digital dermatitis',  status:'Monitoring' },
  { id:6, tag:'#COW-6019', breed:'Mehsana', farm:'Banas Cattle',   issue:'Uterine prolapse (post-op)',      status:'Recovery'   },
]

export const TODAY_APPOINTMENTS = [
  { id:1, time:'09:00 AM', farm:'Surya Farms',       animal:'COW-4029 (HF)',     purpose:'Emergency fever follow-up',      done:true  },
  { id:2, time:'11:30 AM', farm:'Balaji Dairy',      animal:'COW-1082 (Jersey)', purpose:'Mastitis re-check',              done:true  },
  { id:3, time:'02:00 PM', farm:'Ganga Bovines',     animal:'COW-2041 (Gir)',    purpose:'Pregnancy ultrasound',           done:false },
  { id:4, time:'04:00 PM', farm:'GreenPastures',     animal:'COW-3105 (Murrah)', purpose:'Bloat treatment review',         done:false },
  { id:5, time:'05:30 PM', farm:'Kisan Dairy Co-op', animal:'COW-1980 (Sahiwal)',purpose:'Hoof infection bandage change',  done:false },
]

export const ANIMAL_STATUS_STYLE = {
  Critical:     'bg-red-50    text-red-600    border-red-200',
  'Under Care': 'bg-orange-50 text-orange-600 border-orange-200',
  Scheduled:    'bg-blue-50   text-blue-600   border-blue-200',
  Monitoring:   'bg-purple-50 text-purple-600 border-purple-200',
  Recovery:     'bg-green-50  text-green-700  border-green-200',
}

// ── Health Requests Page ──────────────────────────────────────────────────

export const HR_STATUS = {
  PENDING:   'Pending',
  ACCEPTED:  'Accepted',
  REJECTED:  'Rejected',
  COMPLETED: 'Completed',
}

export const HR_PRIORITY = {
  NORMAL:    'Normal',
  HIGH:      'High',
  EMERGENCY: 'Emergency',
}

export const HR_STATUS_STYLE = {
  Pending:   'bg-orange-50 text-orange-600 border-orange-200',
  Accepted:  'bg-blue-50   text-blue-700   border-blue-200',
  Rejected:  'bg-red-50    text-red-600    border-red-200',
  Completed: 'bg-green-50  text-green-700  border-green-200',
}

export const HR_PRIORITY_STYLE = {
  Normal:    'bg-gray-100  text-gray-600   border-gray-200',
  High:      'bg-orange-50 text-orange-600 border-orange-200',
  Emergency: 'bg-red-50    text-red-600    border-red-200',
}
