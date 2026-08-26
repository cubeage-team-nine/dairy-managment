import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  Edit3,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";

const INITIAL_RECORDS = [
  {
    id: 1,
    date: "12 May 2026",
    animalTag: "#COW-4094",
    condition: "Mastitis (Mild)",
    severity: "Severe",
    treatment: "Intramammary Infusion",
    status: "Under Treatment",
  },
  {
    id: 2,
    date: "11 May 2026",
    animalTag: "#COW-4022",
    condition: "Hoof Trimming",
    severity: "Low",
    treatment: "Preventative Care",
    status: "Completed",
  },
  {
    id: 3,
    date: "10 May 2026",
    animalTag: "#COW-4105",
    condition: "Rumination Drop",
    severity: "Moderate",
    treatment: "Probiotic Supplement",
    status: "Under Observation",
  },
  {
    id: 4,
    date: "08 May 2026",
    animalTag: "#COW-3980",
    condition: "Milk Fever",
    severity: "Severe",
    treatment: "Calcium gluconate IV",
    status: "Recovered",
  },
];

const severityStyles = {
  Severe: {
    badge: "bg-[#FCE7E7] text-[#D95C5C]",
  },
  Moderate: {
    badge: "bg-[#FFF3D7] text-[#C99932]",
  },
  Low: {
    badge: "bg-[#E5F5EC] text-[#3E9668]",
  },
};

const statusStyles = {
  "Under Treatment": {
    badge: "bg-[#FCE7E7] text-[#D95C5C]",
  },
  Completed: {
    badge: "bg-[#E4F4EA] text-[#4C9B70]",
  },
  "Under Observation": {
    badge: "bg-[#E5F0F8] text-[#5684A6]",
  },
  Recovered: {
    badge: "bg-[#E2F1E8] text-[#4C946B]",
  },
};

function HealthRecordsPage() {
  const [records, setRecords] = useState(INITIAL_RECORDS);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [form, setForm] = useState({
    animalTag: "",
    condition: "",
    severity: "Moderate",
    treatment: "",
    status: "Under Treatment",
  });

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        record.animalTag.toLowerCase().includes(searchValue) ||
        record.condition.toLowerCase().includes(searchValue) ||
        record.treatment.toLowerCase().includes(searchValue);

      const matchesSeverity =
        severityFilter === "All" || record.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active"
          ? record.status === "Under Treatment" ||
          record.status === "Under Observation"
          : record.status === statusFilter);

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [records, search, severityFilter, statusFilter]);

  const activeIllnesses = records.filter(
    (record) =>
      record.status === "Under Treatment" ||
      record.status === "Under Observation"
  ).length;

  const resetForm = () => {
    setForm({
      animalTag: "",
      condition: "",
      severity: "Moderate",
      treatment: "",
      status: "Under Treatment",
    });

    setEditingRecord(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);

    setForm({
      animalTag: record.animalTag.replace("#", ""),
      condition: record.condition,
      severity: record.severity,
      treatment: record.treatment,
      status: record.status,
    });

    setShowModal(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.animalTag || !form.condition || !form.treatment) {
      return;
    }

    if (editingRecord) {
      setRecords((current) =>
        current.map((record) =>
          record.id === editingRecord.id
            ? {
              ...record,
              animalTag: form.animalTag.startsWith("#")
                ? form.animalTag
                : `#${form.animalTag}`,
              condition: form.condition,
              severity: form.severity,
              treatment: form.treatment,
              status: form.status,
            }
            : record
        )
      );
    } else {
      const newRecord = {
        id: Date.now(),
        date: "Today",
        animalTag: form.animalTag.startsWith("#")
          ? form.animalTag
          : `#${form.animalTag}`,
        condition: form.condition,
        severity: form.severity,
        treatment: form.treatment,
        status: form.status,
      };

      setRecords((current) => [newRecord, ...current]);
    }

    setShowModal(false);
    resetForm();
  };

  return (
    <>
      <div className="min-h-full bg-[#FBFCF8] text-[#17251B]">
        {/* =========================
            PAGE HEADER
        ========================== */}
        <header className="flex flex-col gap-5 border-b border-[#E8ECE7] bg-[#FBFCF8] px-6 py-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="font-['Fraunces'] text-[27px] font-semibold leading-tight tracking-[-0.5px] text-[#18261C] sm:text-[30px]">
                Health Logs &amp; Disease Surveillance
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-[300px]">
                <Search
                  size={17}
                  strokeWidth={1.8}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#89928B]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search animals, tags, records..."
                  className="h-[40px] w-full rounded-full border border-[#E3E7E2] bg-white pl-11 pr-4 text-[12px] text-[#344239] outline-none transition placeholder:text-[#9BA29D] focus:border-[#9AC7A6] focus:ring-2 focus:ring-[#DDF2E2]"
                />
              </div>

              {/* Notification */}
              <button
                type="button"
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E4E8E3] bg-white text-[#657068] transition hover:bg-[#F3F7F2]"
              >
                <span className="absolute right-[9px] top-[8px] h-[5px] w-[5px] rounded-full bg-[#D85E5E]" />

                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
              </button>

              {/* User */}
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DCEBDF] text-[12px] font-semibold text-[#2A6D42]">
                  RK
                </div>

                <span className="text-[12px] font-medium text-[#4D584F]">
                  Rajesh Kumar
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* =========================
            MAIN CONTENT
        ========================== */}
        <main className="px-6 py-6 sm:px-8 lg:px-10">
          {/* =========================
              SUMMARY CARDS
          ========================== */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Active Illnesses */}
            <div className="relative overflow-hidden rounded-[14px] border border-[#E5E9E4] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(20,40,25,0.02)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-medium text-[#737D75]">
                    Active Illnesses
                  </p>

                  <p className="mt-4 text-[30px] font-semibold leading-none tracking-[-1px] text-[#17251B]">
                    {activeIllnesses}
                  </p>

                  <p className="mt-3 text-[11px] text-[#A0A6A1]">
                    COW-4094, COW-4102...
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-[7px] bg-[#FCE5E5] text-[#D45A5A]">
                  <AlertTriangle size={17} strokeWidth={1.8} />
                </div>
              </div>
            </div>

            {/* Routine Vet Visits */}
            <div className="relative overflow-hidden rounded-[14px] border border-[#E5E9E4] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(20,40,25,0.02)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-medium text-[#737D75]">
                    Routine Vet Visits
                  </p>

                  <p className="mt-4 text-[27px] font-semibold leading-none tracking-[-0.7px] text-[#17251B]">
                    3 Scheduled
                  </p>

                  <p className="mt-3 text-[11px] text-[#A0A6A1]">
                    Next visit tomorrow
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-[7px] bg-[#E5F4E9] text-[#4B9668]">
                  <CalendarDays size={17} strokeWidth={1.7} />
                </div>
              </div>
            </div>

            {/* Healthy Herd Rate */}
            <div className="relative overflow-hidden rounded-[14px] border border-[#E5E9E4] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(20,40,25,0.02)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-medium text-[#737D75]">
                    Healthy Herd Rate
                  </p>

                  <p className="mt-4 text-[30px] font-semibold leading-none tracking-[-1px] text-[#17251B]">
                    91.6%
                  </p>

                  <p className="mt-3 text-[11px] text-[#A0A6A1]">
                    of 49 active cows
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-[7px] bg-[#E7F5EB] text-[#4B986A]">
                  <ShieldCheck size={17} strokeWidth={1.8} />
                </div>
              </div>
            </div>
          </section>

          {/* =========================
              FILTERS + BUTTON
          ========================== */}
          <section className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {/* Severity */}
              <div className="relative">
                <select
                  value={severityFilter}
                  onChange={(event) => setSeverityFilter(event.target.value)}
                  className="h-[39px] min-w-[125px] appearance-none rounded-[7px] border border-[#E3E7E2] bg-white pl-4 pr-9 text-[12px] text-[#6C756E] outline-none transition focus:border-[#9CC9A7]"
                >
                  <option value="All">Severity: All</option>
                  <option value="Severe">Severe</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A938C]"
                />
              </div>

              {/* Status */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-[39px] min-w-[125px] appearance-none rounded-[7px] border border-[#E3E7E2] bg-white pl-4 pr-9 text-[12px] text-[#6C756E] outline-none transition focus:border-[#9CC9A7]"
                >
                  <option value="Active">Status: Active</option>
                  <option value="All">Status: All</option>
                  <option value="Under Treatment">
                    Under Treatment
                  </option>
                  <option value="Under Observation">
                    Under Observation
                  </option>
                  <option value="Completed">Completed</option>
                  <option value="Recovered">Recovered</option>
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A938C]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex h-[39px] items-center justify-center gap-2 rounded-[7px] bg-[#17653A] px-5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#12562F] active:scale-[0.98]"
            >
              <Plus size={15} strokeWidth={2.2} />
              Log Health Issue
            </button>
          </section>

          {/* =========================
              TABLE
          ========================== */}
          <section className="mt-5 overflow-hidden rounded-[14px] border border-[#E5E9E4] bg-white shadow-[0_1px_2px_rgba(20,40,25,0.025)]">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-[#ECEFEB]">
                    <th className="whitespace-nowrap px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.3px] text-[#89918B]">
                      Date
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.3px] text-[#89918B]">
                      Animal Tag
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.3px] text-[#89918B]">
                      Condition
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.3px] text-[#89918B]">
                      Severity
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.3px] text-[#89918B]">
                      Treatment / Ration
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.3px] text-[#89918B]">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.3px] text-[#89918B]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-[#F0F2EF] last:border-b-0 transition hover:bg-[#FCFDFB]"
                      >
                        <td className="whitespace-nowrap px-5 py-[17px] text-[12px] font-medium text-[#59635B]">
                          {record.date}
                        </td>

                        <td className="whitespace-nowrap px-5 py-[17px] text-[12px] font-semibold text-[#28342C]">
                          {record.animalTag}
                        </td>

                        <td className="whitespace-nowrap px-5 py-[17px] text-[12px] font-medium text-[#465148]">
                          {record.condition}
                        </td>

                        <td className="whitespace-nowrap px-5 py-[17px]">
                          <span
                            className={`inline-flex rounded-[5px] px-2.5 py-1 text-[10px] font-semibold ${severityStyles[record.severity]?.badge ||
                              "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {record.severity}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-[17px] text-[12px] text-[#5C655E]">
                          {record.treatment}
                        </td>

                        <td className="whitespace-nowrap px-5 py-[17px]">
                          <span
                            className={`inline-flex rounded-[5px] px-2.5 py-1 text-[10px] font-semibold ${statusStyles[record.status]?.badge ||
                              "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {record.status}
                          </span>
                        </td>

                        <td className="px-5 py-[17px] text-center">
                          <button
                            type="button"
                            onClick={() => openEditModal(record)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#68736B] transition hover:bg-[#EDF5EE] hover:text-[#17653A]"
                            aria-label={`Edit ${record.animalTag}`}
                          >
                            <Edit3 size={14} strokeWidth={1.8} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF5EF] text-[#4D8F65]">
                            <Stethoscope size={20} />
                          </div>

                          <p className="text-[13px] font-semibold text-[#344138]">
                            No health records found
                          </p>

                          <p className="mt-1 text-[11px] text-[#929A94]">
                            Try changing your search or filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-[#EEF1ED] md:hidden">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <div key={record.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[12px] font-semibold text-[#26332B]">
                          {record.animalTag}
                        </p>

                        <p className="mt-1 text-[11px] text-[#8B948D]">
                          {record.date}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openEditModal(record)}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5EAE5] text-[#68736B]"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>

                    <p className="mt-4 text-[13px] font-medium text-[#465148]">
                      {record.condition}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-[5px] px-2.5 py-1 text-[10px] font-semibold ${severityStyles[record.severity]?.badge
                          }`}
                      >
                        {record.severity}
                      </span>

                      <span
                        className={`rounded-[5px] px-2.5 py-1 text-[10px] font-semibold ${statusStyles[record.status]?.badge
                          }`}
                      >
                        {record.status}
                      </span>
                    </div>

                    <p className="mt-3 text-[11px] text-[#737D75]">
                      <span className="font-medium text-[#5B665E]">
                        Treatment:
                      </span>{" "}
                      {record.treatment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-5 py-14 text-center">
                  <p className="text-[13px] font-semibold text-[#344138]">
                    No health records found
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* =========================
          LOG / EDIT HEALTH ISSUE MODAL
      ========================== */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#152019]/35 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[520px] overflow-hidden rounded-[16px] bg-white shadow-[0_20px_60px_rgba(20,40,25,0.18)]">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-[#E9EDE8] px-6 py-5">
              <div>
                <h2 className="font-['Fraunces'] text-[22px] font-semibold text-[#18261C]">
                  {editingRecord ? "Edit Health Issue" : "Log Health Issue"}
                </h2>

                <p className="mt-1 text-[11px] text-[#8A938C]">
                  Add or update a health record for your herd.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#7B857D] transition hover:bg-[#F1F4F0]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              {/* Animal */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold text-[#58635B]">
                  Animal Tag
                </label>

                <input
                  type="text"
                  value={form.animalTag}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      animalTag: event.target.value,
                    }))
                  }
                  placeholder="e.g. COW-4094"
                  className="h-[42px] w-full rounded-[7px] border border-[#DFE5DF] bg-white px-3 text-[12px] text-[#344239] outline-none transition placeholder:text-[#A1A8A2] focus:border-[#8FBE9C] focus:ring-2 focus:ring-[#DDF2E2]"
                />
              </div>

              {/* Condition */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold text-[#58635B]">
                  Condition
                </label>

                <input
                  type="text"
                  value={form.condition}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      condition: event.target.value,
                    }))
                  }
                  placeholder="e.g. Mastitis"
                  className="h-[42px] w-full rounded-[7px] border border-[#DFE5DF] bg-white px-3 text-[12px] text-[#344239] outline-none transition placeholder:text-[#A1A8A2] focus:border-[#8FBE9C] focus:ring-2 focus:ring-[#DDF2E2]"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Severity */}
                <div>
                  <label className="mb-2 block text-[11px] font-semibold text-[#58635B]">
                    Severity
                  </label>

                  <select
                    value={form.severity}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        severity: event.target.value,
                      }))
                    }
                    className="h-[42px] w-full rounded-[7px] border border-[#DFE5DF] bg-white px-3 text-[12px] text-[#344239] outline-none focus:border-[#8FBE9C]"
                  >
                    <option>Severe</option>
                    <option>Moderate</option>
                    <option>Low</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-[11px] font-semibold text-[#58635B]">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="h-[42px] w-full rounded-[7px] border border-[#DFE5DF] bg-white px-3 text-[12px] text-[#344239] outline-none focus:border-[#8FBE9C]"
                  >
                    <option>Under Treatment</option>
                    <option>Under Observation</option>
                    <option>Completed</option>
                    <option>Recovered</option>
                  </select>
                </div>
              </div>

              {/* Treatment */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold text-[#58635B]">
                  Treatment / Ration
                </label>

                <input
                  type="text"
                  value={form.treatment}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      treatment: event.target.value,
                    }))
                  }
                  placeholder="e.g. Intramammary Infusion"
                  className="h-[42px] w-full rounded-[7px] border border-[#DFE5DF] bg-white px-3 text-[12px] text-[#344239] outline-none transition placeholder:text-[#A1A8A2] focus:border-[#8FBE9C] focus:ring-2 focus:ring-[#DDF2E2]"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-[#EDF0EC] pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="h-[40px] rounded-[7px] border border-[#DCE2DC] px-5 text-[12px] font-semibold text-[#667069] transition hover:bg-[#F5F7F4]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-[40px] rounded-[7px] bg-[#17653A] px-5 text-[12px] font-semibold text-white transition hover:bg-[#12562F]"
                >
                  {editingRecord ? "Save Changes" : "Log Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default HealthRecordsPage;