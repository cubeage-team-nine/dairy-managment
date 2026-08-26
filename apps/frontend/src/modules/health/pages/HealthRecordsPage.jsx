import { useState } from "react";
import {
  Search,
  Bell,
  Plus,
  Pencil,
  X,
  AlertTriangle,
  HeartPulse,
} from "lucide-react";

const initialRecords = [
  {
    id: 1,
    date: "12 May 2026",
    tag: "#COW-4094",
    condition: "Mastitis (Mild)",
    severity: "Severe",
    treatment: "Intramammary infusion",
    status: "Under Treatment",
  },
  {
    id: 2,
    date: "11 May 2026",
    tag: "#COW-4022",
    condition: "Hoof Trimming",
    severity: "Low",
    treatment: "Preventative care",
    status: "Completed",
  },
  {
    id: 3,
    date: "10 May 2026",
    tag: "#COW-4105",
    condition: "Rumination Drop",
    severity: "Moderate",
    treatment: "Probiotic Supplement",
    status: "Under Observation",
  },
  {
    id: 4,
    date: "08 May 2026",
    tag: "#COW-3980",
    condition: "Milk Fever",
    severity: "Severe",
    treatment: "Calcium gluconate IV",
    status: "Recovered",
  },
];

const severityStyles = {
  Severe: "bg-red-100 text-red-500",
  Moderate: "bg-orange-100 text-orange-500",
  Low: "bg-green-100 text-green-600",
};

const statusStyles = {
  "Under Treatment": "bg-red-100 text-red-500",
  "Under Observation": "bg-blue-100 text-blue-500",
  Completed: "bg-green-100 text-green-600",
  Recovered: "bg-green-100 text-green-600",
};

function HealthRecordsPage() {
  const [records, setRecords] = useState(initialRecords);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    tag: "",
    condition: "",
    severity: "Low",
    treatment: "",
    status: "Under Treatment",
  });

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // OPEN ADD MODAL
  // =========================

  const openAddModal = () => {
    setEditingId(null);

    setFormData({
      date: new Date().toISOString().split("T")[0],
      tag: "",
      condition: "",
      severity: "Low",
      treatment: "",
      status: "Under Treatment",
    });

    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const openEditModal = (record) => {
    setEditingId(record.id);

    const [day, month, year] = record.date.split(" ");

    const months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    setFormData({
      date: `${year}-${months[month]}-${day}`,
      tag: record.tag.replace("#", ""),
      condition: record.condition,
      severity: record.severity,
      treatment: record.treatment,
      status: record.status,
    });

    setShowModal(true);
  };

  // =========================
  // SAVE / UPDATE
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.tag ||
      !formData.condition ||
      !formData.treatment
    ) {
      return;
    }

    const formattedDate = new Date(
      `${formData.date}T00:00:00`
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const recordData = {
      date: formattedDate,
      tag: `#${formData.tag.toUpperCase()}`,
      condition: formData.condition,
      severity: formData.severity,
      treatment: formData.treatment,
      status: formData.status,
    };

    if (editingId) {
      setRecords((prev) =>
        prev.map((record) =>
          record.id === editingId
            ? {
                ...record,
                ...recordData,
              }
            : record
        )
      );
    } else {
      setRecords((prev) => [
        {
          id: Date.now(),
          ...recordData,
        },
        ...prev,
      ]);
    }

    setShowModal(false);
    setEditingId(null);
  };

  // =========================
  // FILTER
  // =========================

  const filteredRecords = records.filter((record) => {
    const searchMatch =
      record.tag.toLowerCase().includes(search.toLowerCase()) ||
      record.condition.toLowerCase().includes(search.toLowerCase()) ||
      record.treatment.toLowerCase().includes(search.toLowerCase());

    const severityMatch =
      severityFilter === "All" ||
      record.severity === severityFilter;

    const statusMatch =
      statusFilter === "All" ||
      record.status === statusFilter;

    return searchMatch && severityMatch && statusMatch;
  });

  // =========================
  // STATS
  // =========================

  const activeIllnesses = records.filter(
    (record) =>
      record.status === "Under Treatment" ||
      record.status === "Under Observation"
  ).length;

  return (
    <div className="min-h-screen w-full bg-[#f7f7f5] text-gray-800">

      {/* ================= HEADER ================= */}

      <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">

        <h1 className="text-sm font-bold">
          Health Logs & Disease Surveillance
        </h1>

        <div className="flex items-center gap-4">

          {/* Search */}

          <div className="hidden h-8 w-56 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 md:flex">

            <Search
              size={13}
              className="text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search animals, tasks, records..."
              className="w-full bg-transparent text-[10px] outline-none placeholder:text-gray-400"
            />

          </div>

          {/* Notification */}

          <div className="relative">
            <Bell
              size={14}
              className="text-gray-600"
            />

            <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-red-500" />
          </div>

          {/* User */}

          <div className="flex items-center gap-2">

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-200 text-[9px] font-bold text-orange-700">
              RK
            </div>

            <span className="hidden text-[10px] font-semibold sm:block">
              Rajesh Kumar
            </span>

          </div>

        </div>

      </div>

      {/* ================= CONTENT ================= */}

      <div className="space-y-5 p-6">

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Active Illnesses */}

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <span className="text-[10px] font-medium text-gray-500">
                Active Illnesses
              </span>

              <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100 text-red-500">
                <AlertTriangle size={12} />
              </div>

            </div>

            <p className="mt-2 text-xl font-bold">
              {activeIllnesses}
            </p>

            <p className="mt-1 text-[9px] text-gray-400">
              Currently requiring attention
            </p>

          </div>

          {/* Vet Visits */}

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <span className="text-[10px] font-medium text-gray-500">
                Routine Vet Visits
              </span>

              <div className="flex h-6 w-6 items-center justify-center rounded bg-green-100 text-green-600">
                <HeartPulse size={12} />
              </div>

            </div>

            <p className="mt-2 text-xl font-bold">
              3 Scheduled
            </p>

            <p className="mt-1 text-[9px] text-gray-400">
              Next visit tomorrow
            </p>

          </div>

          {/* Healthy Rate */}

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <span className="text-[10px] font-medium text-gray-500">
                Healthy Herd Rate
              </span>

              <div className="flex h-6 w-6 items-center justify-center rounded bg-green-100 text-green-600">
                •
              </div>

            </div>

            <p className="mt-2 text-xl font-bold">
              91.6%
            </p>

            <p className="mt-1 text-[9px] text-gray-400">
              48 of 52 active cows
            </p>

          </div>

        </div>

        {/* ================= FILTERS + BUTTON ================= */}

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div className="flex gap-2">

            <select
              value={severityFilter}
              onChange={(e) =>
                setSeverityFilter(e.target.value)
              }
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[9px] outline-none"
            >
              <option value="All">
                Severity: All
              </option>

              <option value="Severe">
                Severe
              </option>

              <option value="Moderate">
                Moderate
              </option>

              <option value="Low">
                Low
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[9px] outline-none"
            >
              <option value="All">
                Status: All
              </option>

              <option value="Under Treatment">
                Under Treatment
              </option>

              <option value="Under Observation">
                Under Observation
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Recovered">
                Recovered
              </option>
            </select>

          </div>

          {/* ADD BUTTON */}

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-md bg-green-700 px-4 py-2 text-[9px] font-semibold text-white transition hover:bg-green-800"
          >
            <Plus size={11} />
            Log Health Issue
          </button>

        </div>

        {/* ================= TABLE ================= */}

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[750px] border-collapse">

              <thead>

                <tr className="border-b border-gray-200 bg-gray-50">

                  <th className="px-4 py-3 text-left text-[8px] font-semibold uppercase text-gray-500">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-[8px] font-semibold uppercase text-gray-500">
                    Animal Tag
                  </th>

                  <th className="px-4 py-3 text-left text-[8px] font-semibold uppercase text-gray-500">
                    Condition
                  </th>

                  <th className="px-4 py-3 text-left text-[8px] font-semibold uppercase text-gray-500">
                    Severity
                  </th>

                  <th className="px-4 py-3 text-left text-[8px] font-semibold uppercase text-gray-500">
                    Treatment
                  </th>

                  <th className="px-4 py-3 text-left text-[8px] font-semibold uppercase text-gray-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-center text-[8px] font-semibold uppercase text-gray-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredRecords.length > 0 ? (

                  filteredRecords.map((record) => (

                    <tr
                      key={record.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >

                      <td className="px-4 py-3 text-[9px] text-gray-600">
                        {record.date}
                      </td>

                      <td className="px-4 py-3 text-[9px] font-semibold">
                        {record.tag}
                      </td>

                      <td className="px-4 py-3 text-[9px] text-gray-600">
                        {record.condition}
                      </td>

                      <td className="px-4 py-3">

                        <span
                          className={`rounded px-2 py-1 text-[8px] font-medium ${
                            severityStyles[
                              record.severity
                            ]
                          }`}
                        >
                          {record.severity}
                        </span>

                      </td>

                      <td className="px-4 py-3 text-[9px] text-gray-600">
                        {record.treatment}
                      </td>

                      <td className="px-4 py-3">

                        <span
                          className={`rounded px-2 py-1 text-[8px] font-medium ${
                            statusStyles[record.status]
                          }`}
                        >
                          {record.status}
                        </span>

                      </td>

                      <td className="px-4 py-3 text-center">

                        <button
                          onClick={() =>
                            openEditModal(record)
                          }
                          className="text-gray-500 transition hover:text-green-700"
                          title="Edit"
                        >
                          <Pencil size={11} />
                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="py-10 text-center text-[10px] text-gray-400"
                    >
                      No health records found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* ADD / EDIT MODAL */}
      {/* ================================================= */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

              <div>

                <h2 className="text-sm font-bold text-gray-800">
                  {editingId
                    ? "Edit Health Record"
                    : "Log Health Issue"}
                </h2>

                <p className="mt-1 text-[9px] text-gray-400">
                  Add health information for an animal
                </p>

              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={16} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-5"
            >

              {/* Date + Tag */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="mb-1 block text-[9px] font-semibold text-gray-600">
                    Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] outline-none focus:border-green-500"
                  />

                </div>

                <div>

                  <label className="mb-1 block text-[9px] font-semibold text-gray-600">
                    Animal Tag
                  </label>

                  <input
                    type="text"
                    name="tag"
                    value={formData.tag}
                    onChange={handleChange}
                    placeholder="COW-4106"
                    required
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] uppercase outline-none focus:border-green-500"
                  />

                </div>

              </div>

              {/* Condition */}

              <div>

                <label className="mb-1 block text-[9px] font-semibold text-gray-600">
                  Condition
                </label>

                <input
                  type="text"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  placeholder="e.g. Mastitis, Fever..."
                  required
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] outline-none focus:border-green-500"
                />

              </div>

              {/* Severity */}

              <div>

                <label className="mb-1 block text-[9px] font-semibold text-gray-600">
                  Severity
                </label>

                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] outline-none focus:border-green-500"
                >
                  <option value="Low">
                    Low
                  </option>

                  <option value="Moderate">
                    Moderate
                  </option>

                  <option value="Severe">
                    Severe
                  </option>

                </select>

              </div>

              {/* Treatment */}

              <div>

                <label className="mb-1 block text-[9px] font-semibold text-gray-600">
                  Treatment
                </label>

                <input
                  type="text"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                  placeholder="e.g. Antibiotics, IV..."
                  required
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] outline-none focus:border-green-500"
                />

              </div>

              {/* Status */}

              <div>

                <label className="mb-1 block text-[9px] font-semibold text-gray-600">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] outline-none focus:border-green-500"
                >
                  <option value="Under Treatment">
                    Under Treatment
                  </option>

                  <option value="Under Observation">
                    Under Observation
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Recovered">
                    Recovered
                  </option>

                </select>

              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-gray-200 px-4 py-2 text-[9px] font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-md bg-green-700 px-4 py-2 text-[9px] font-semibold text-white hover:bg-green-800"
                >
                  {editingId
                    ? "Update Record"
                    : "Save Health Issue"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default HealthRecordsPage;