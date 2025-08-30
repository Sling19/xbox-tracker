import React, { useState } from "react";

const TASKS = {
  shellClean: "Shell cleaned (inside/out)",
  cableTest: "Cable/Breakaway tested",
  portFit: "Port fit & wiggle test",
  stickL: "Left stick drift test",
  stickR: "Right stick drift test",
  buttonsABXY: "A/B/X/Y test",
  dpad: "D-Pad test",
  bumpers: "Black/White buttons test",
  triggers: "Triggers analog test",
  rumble: "Rumble motors test",
  boardInspect: "Board inspect (cold joints)",
  reflowFix: "Reflow small fixes",
  stickCaps: "Stick caps replaced (if worn)",
  lubeService: "Stick shaft lube/service",
  finalTest: "Final QA (10-min play)",
  listingPhotos: "Listing photos",
};

function defaultTasks() { return Object.fromEntries(Object.keys(TASKS).map(k => [k, false])); }

const badge = (s) =>
  s === "Ready to Sell" ? "bg-green-200 text-green-800" :
    s === "Needs Part" ? "bg-yellow-200 text-yellow-800" :
      s === "Sold" ? "bg-blue-200 text-blue-800" :
        s === "Parted Out" ? "bg-red-200 text-red-800" : "bg-gray-200 text-gray-700";

export default function ControllerTable({ controllers, onUpdateController, onDeleteController }) {
  if (!Array.isArray(controllers) || controllers.length === 0) return <p>No controllers yet.</p>;

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [openChecklistId, setOpenChecklistId] = useState(null);

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({
      model: c.model || "",
      condition: c.condition || "",
      status: c.status || "Intake",
      notes: c.notes || "",
      parts: c.parts || "",
      cost: c.cost ?? 0,
      sale: c.sale ?? 0,
    });
  };
  const cancel = () => { setEditingId(null); setForm({}); };
  const save = () => {
    onUpdateController(editingId, {
      ...form, cost: Number(form.cost) || 0, sale: Number(form.sale) || 0
    });
    cancel();
  };
  const toggleTask = (c, key) => {
    const t = { ...defaultTasks(), ...(c.tasks || {}) };
    t[key] = !t[key];
    onUpdateController(c.id, { tasks: t });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2">Model</th>
            <th className="p-2">Condition</th>
            <th className="p-2">Status</th>
            <th className="p-2">Notes</th>
            <th className="p-2">Parts</th>
            <th className="p-2">Cost</th>
            <th className="p-2">Sale</th>
            <th className="p-2">Profit</th>
            <th className="p-2">Progress</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {controllers.map((c) => {
            const isEditing = editingId === c.id;
            const tasks = { ...defaultTasks(), ...(c.tasks || {}) };
            const profit = (c.sale ?? 0) - (c.cost ?? 0);
            const total = Object.keys(TASKS).length;
            const done = Object.values(tasks).filter(Boolean).length;
            const pct = Math.round(done / total * 100);

            return (
              <React.Fragment key={c.id}>
                <tr className="border-t align-top">
                  <td className="p-2">{c.id}</td>
                  <td className="p-2">
                    {isEditing ? <input className="p-1 border rounded w-40"
                      value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} /> : (c.model || "-")}
                  </td>
                  <td className="p-2">
                    {isEditing ? <input className="p-1 border rounded w-40"
                      value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} /> : (c.condition || "-")}
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <select className={`p-1 rounded ${badge(form.status)}`} value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                        <option>Intake</option><option>Needs Part</option><option>Refurb</option>
                        <option>Ready to Sell</option><option>Listed</option><option>Sold</option>
                        <option>Parted Out</option>
                      </select>
                    ) : <span className={`px-2 py-1 rounded ${badge(c.status)}`}>{c.status}</span>}
                  </td>
                  <td className="p-2">{isEditing ?
                    <textarea className="p-1 border rounded w-64 h-16"
                      value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /> : (c.notes || "-")}
                  </td>
                  <td className="p-2">{isEditing ?
                    <input className="p-1 border rounded w-48"
                      value={form.parts} onChange={e => setForm(f => ({ ...f, parts: e.target.value }))} /> : (c.parts || "-")}
                  </td>
                  <td className="p-2 text-right">{isEditing ?
                    <input type="number" step="0.01" className="p-1 border rounded w-24 text-right"
                      value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} /> : `$${(c.cost ?? 0).toFixed(2)}`}
                  </td>
                  <td className="p-2 text-right">{isEditing ?
                    <input type="number" step="0.01" className="p-1 border rounded w-24 text-right"
                      value={form.sale} onChange={e => setForm(f => ({ ...f, sale: e.target.value }))} /> : `$${(c.sale ?? 0).toFixed(2)}`}
                  </td>
                  <td className="p-2 text-right font-semibold">${profit.toFixed(2)}</td>
                  <td className="p-2">
                    <div className="w-24 bg-gray-200 rounded h-2.5">
                      <div className="h-2.5 bg-green-500 rounded" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-gray-600 mt-1 text-right">{pct}%</div>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={save} className="px-2 py-1 bg-green-600 text-white rounded">Save</button>
                          <button onClick={cancel} className="px-2 py-1 bg-gray-200 rounded">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(c)} className="px-2 py-1 bg-white border rounded">Edit</button>
                      )}
                      <button onClick={() => setOpenChecklistId(openChecklistId === c.id ? null : c.id)}
                        className="px-2 py-1 bg-white border rounded">Checklist</button>
                      <button onClick={() => {
                        if (window.confirm(`Delete ${c.id}?`)) onDeleteController(c.id);
                      }} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                    </div>
                  </td>
                </tr>

                {openChecklistId === c.id && (
                  <tr className="border-t bg-gray-50">
                    <td colSpan={11} className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {Object.entries(TASKS).map(([k, label]) => (
                          <label key={k} className="flex items-center gap-2">
                            <input type="checkbox" checked={!!tasks[k]} onChange={() => toggleTask(c, k)} />
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
