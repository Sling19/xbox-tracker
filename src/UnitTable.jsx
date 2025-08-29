import React, { useState } from "react";

// Thorough-but-not-fussy checklist (16 items)
const TASKS = {
  // Intake
  intakePhotos: "Intake photos & log",
  versionCheck: "Version/serial verified",
  smokeCorrosionCheck: "Smoke/corrosion assessment",

  // Board & cooling
  clockCapRemoved: "Clock cap removed & area neutralized",
  recap: "Motherboard recap (as needed)",
  traceRepair: "Front-panel/trace check & repair",
  thermalPaste: "CPU/GPU thermal paste replaced",
  fanService: "Fan cleaned/serviced/replaced",

  // Power & storage
  psuJackReflow: "PSU/jack inspected (Foxlink reflow if needed)",
  hddHealthLock: "HDD health check & lock/init",
  eepromBackup: "EEPROM backup saved",

  // Optical drive
  dvdBelt: "DVD belt replaced",
  dvdLaserService: "DVD laser test/adjust/replace",
  dvdLube: "DVD rails/gear cleaned & lubed",

  // I/O & finish
  portsClean: "AV/Power/Controller ports cleaned",
  finalTest: "Final QA: cold boot x3, 30-min run",
  listingPhotos: "Listing photos",
};

function defaultTasks() {
  const o = {};
  for (const k of Object.keys(TASKS)) o[k] = false;
  return o;
}

export default function UnitTable({ units, onUpdateUnit }) {
  if (!Array.isArray(units) || units.length === 0) {
    return <p>No units yet. Add one above.</p>;
  }

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [openChecklistId, setOpenChecklistId] = useState(null);

  const startEdit = (u) => {
    setEditingId(u.id);
    setForm({
      version: u.version || "",
      condition: u.condition || "",
      status: u.status || "Intake",
      notes: u.notes || "",
      parts: u.parts || "",
      cost: u.cost ?? 0,
      sale: u.sale ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  const saveEdit = () => {
    if (!editingId) return;
    onUpdateUnit(editingId, {
      ...form,
      cost: Number(form.cost) || 0,
      sale: Number(form.sale) || 0,
    });
    cancelEdit();
  };

  const badgeClass = (status) => {
    switch (status) {
      case "Ready to Sell":
        return "bg-green-200 text-green-800";
      case "Needs Part":
        return "bg-yellow-200 text-yellow-800";
      case "Sold":
        return "bg-blue-200 text-blue-800";
      case "Parted Out":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const toggleTask = (u, key) => {
    const current = { ...defaultTasks(), ...(u.tasks || {}) };
    current[key] = !current[key];
    onUpdateUnit(u.id, { tasks: current });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2">Version</th>
            <th className="p-2">Condition</th>
            <th className="p-2">Status</th>
            <th className="p-2">Notes</th>
            <th className="p-2">Parts Needed</th>
            <th className="p-2">Cost ($)</th>
            <th className="p-2">Sale ($)</th>
            <th className="p-2">Profit ($)</th>
            <th className="p-2">Progress</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => {
            const isEditing = editingId === u.id;
            const tasks = { ...defaultTasks(), ...(u.tasks || {}) };
            const profit = (u.sale ?? 0) - (u.cost ?? 0);
            const totalTasks = Object.keys(TASKS).length;
            const doneTasks = Object.values(tasks).filter(Boolean).length;
            const pct = Math.round((doneTasks / totalTasks) * 100);

            return (
              <React.Fragment key={u.id}>
                <tr className="border-t align-top">
                  <td className="p-2">{u.id}</td>

                  {/* Version */}
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        className="p-1 border rounded w-28"
                        value={form.version}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, version: e.target.value }))
                        }
                      />
                    ) : (
                      u.version
                    )}
                  </td>

                  {/* Condition */}
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        className="p-1 border rounded w-40"
                        value={form.condition}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, condition: e.target.value }))
                        }
                      />
                    ) : (
                      u.condition || "-"
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-2">
                    {isEditing ? (
                      <select
                        className={`p-1 rounded ${badgeClass(form.status)}`}
                        value={form.status}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, status: e.target.value }))
                        }
                      >
                        <option>Intake</option>
                        <option>Disassembled</option>
                        <option>Recapped</option>
                        <option>Needs Part</option>
                        <option>Ready to Sell</option>
                        <option>Listed</option>
                        <option>Sold</option>
                        <option>Parted Out</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded ${badgeClass(u.status)}`}>
                        {u.status}
                      </span>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="p-2">
                    {isEditing ? (
                      <textarea
                        className="p-1 border rounded w-64 h-16"
                        value={form.notes}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, notes: e.target.value }))
                        }
                      />
                    ) : (
                      u.notes || "-"
                    )}
                  </td>

                  {/* Parts */}
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        className="p-1 border rounded w-48"
                        value={form.parts}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, parts: e.target.value }))
                        }
                      />
                    ) : (
                      u.parts || "-"
                    )}
                  </td>

                  {/* Cost */}
                  <td className="p-2 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        className="p-1 border rounded w-24 text-right"
                        value={form.cost}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, cost: e.target.value }))
                        }
                      />
                    ) : (
                      `$${(u.cost ?? 0).toFixed(2)}`
                    )}
                  </td>

                  {/* Sale */}
                  <td className="p-2 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        className="p-1 border rounded w-24 text-right"
                        value={form.sale}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, sale: e.target.value }))
                        }
                      />
                    ) : (
                      `$${(u.sale ?? 0).toFixed(2)}`
                    )}
                  </td>

                  {/* Profit */}
                  <td className="p-2 text-right font-semibold">
                    ${profit.toFixed(2)}
                  </td>

                  {/* Progress */}
                  <td className="p-2">
                    <div className="w-24 bg-gray-200 rounded h-2.5">
                      <div
                        className="h-2.5 bg-green-500 rounded"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1 text-right">
                      {pct}%
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-2">
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="px-2 py-1 bg-green-600 text-white rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 bg-gray-200 rounded"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEdit(u)}
                          className="px-2 py-1 bg-white border rounded"
                        >
                          Edit
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setOpenChecklistId(
                            openChecklistId === u.id ? null : u.id
                          )
                        }
                        className="px-2 py-1 bg-white border rounded"
                      >
                        Checklist
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Checklist drawer */}
                {openChecklistId === u.id && (
                  <tr className="border-t bg-gray-50">
                    {/* NOTE: colSpan must match total header columns (11 here) */}
                    <td className="p-3" colSpan={11}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {Object.entries(TASKS).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!tasks[key]}
                              onChange={() => toggleTask(u, key)}
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
