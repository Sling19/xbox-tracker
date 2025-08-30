import React, { useEffect, useRef, useState } from "react";
import UnitTable from "./UnitTable";
import UnitForm from "./UnitForm";
import Scorecard from "./Scorecard";
import ControllerForm from "./ControllerForm";
import ControllerTable from "./ControllerTable";

// helpers
function computeNextIdFrom(list, prefixDefaultNum) {
  if (!list || list.length === 0) return prefixDefaultNum;
  const maxNum = list.reduce((m, item) => {
    const n = Number(String(item.id || "").replace(/[^0-9]/g, "")) || 0;
    return Math.max(m, n);
  }, prefixDefaultNum - 1);
  return Math.max(prefixDefaultNum, maxNum + 1);
}

export default function App() {
  const [tab, setTab] = useState("units");

  // ---- Units ----
  const [units, setUnits] = useState(() => JSON.parse(localStorage.getItem("units") || "[]"));
  const [nextId, setNextId] = useState(() => Number(localStorage.getItem("nextId") || 0) || computeNextIdFrom(units, 101));
  const [lastDeleted, setLastDeleted] = useState(null);

  // ---- Scorecard ----
  const [weeks, setWeeks] = useState(() => JSON.parse(localStorage.getItem("scorecard") || "[]"));

  // ---- Controllers ----
  const [controllers, setControllers] = useState(() => JSON.parse(localStorage.getItem("controllers") || "[]"));
  const [nextCtrlId, setNextCtrlId] = useState(() => Number(localStorage.getItem("nextCtrlId") || 0) || computeNextIdFrom(controllers, 101));
  const [lastDeletedCtrl, setLastDeletedCtrl] = useState(null);

  useEffect(() => localStorage.setItem("units", JSON.stringify(units)), [units]);
  useEffect(() => localStorage.setItem("scorecard", JSON.stringify(weeks)), [weeks]);
  useEffect(() => localStorage.setItem("nextId", String(nextId)), [nextId]);

  useEffect(() => localStorage.setItem("controllers", JSON.stringify(controllers)), [controllers]);
  useEffect(() => localStorage.setItem("nextCtrlId", String(nextCtrlId)), [nextCtrlId]);

  // ----- Units CRUD -----
  function defaultUnitTasks() { return {}; } // already created inside UnitForm/UnitTable
  const addUnit = (unit) => { const id = `XBX-${nextId}`; setUnits(u => [...u, { id, tasks: defaultUnitTasks(), ...unit }]); setNextId(n => n + 1); };
  const updateUnit = (id, updated) => setUnits(arr => arr.map(u => u.id === id ? { ...u, ...updated } : u));
  const deleteUnit = (id) => { setUnits(arr => { const t = arr.find(u => u.id === id); if (t) setLastDeleted(t); return arr.filter(u => u.id !== id); }); };
  const undoDelete = () => { if (!lastDeleted) return; setUnits(arr => [...arr, lastDeleted]); setLastDeleted(null); };
  const recalcNextId = () => setNextId(computeNextIdFrom(units, 101));

  // ----- Controllers CRUD -----
  function defaultCtrlTasks() { return {}; }
  const addController = (c) => { const id = `CTR-${nextCtrlId}`; setControllers(list => [...list, { id, tasks: defaultCtrlTasks(), ...c }]); setNextCtrlId(n => n + 1); };
  const updateController = (id, updated) => setControllers(list => list.map(c => c.id === id ? { ...c, ...updated } : c));
  const deleteController = (id) => { setControllers(list => { const t = list.find(c => c.id === id); if (t) setLastDeletedCtrl(t); return list.filter(c => c.id !== id); }); };
  const undoDeleteCtrl = () => { if (!lastDeletedCtrl) return; setControllers(list => [...list, lastDeletedCtrl]); setLastDeletedCtrl(null); };
  const recalcNextCtrlId = () => setNextCtrlId(computeNextIdFrom(controllers, 101));

  // ----- Backup/Import/CSV -----
  const fileInputRef = useRef(null);
  const exportJSON = () => {
    const payload = { units, weeks, nextId, controllers, nextCtrlId };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `tracker-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url);
  };
  const exportControllersCSV = () => {
    const headers = ["id", "model", "condition", "status", "notes", "parts", "cost", "sale", "profit", "checklist_pct"];
    const rows = controllers.map(c => {
      const tasks = c.tasks || {}; const keys = Object.keys(tasks); const total = keys.length || 16; // fallback
      const done = Object.values(tasks).filter(Boolean).length; const pct = Math.round(done / (total || 1) * 100);
      return [c.id, c.model || "", c.condition || "", c.status || "", (c.notes || "").replace(/\n/g, " "),
      (c.parts || "").replace(/\n/g, " "), (c.cost ?? 0).toFixed(2), (c.sale ?? 0).toFixed(2),
      ((c.sale ?? 0) - (c.cost ?? 0)).toFixed(2), `${pct}%`];
    });
    const csv = [headers.join(","), ...rows.map(r => r.map(s => {
      s = String(s ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `controllers-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const triggerImport = () => fileInputRef.current?.click();
  const handleImportFile = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      setUnits(Array.isArray(data.units) ? data.units : []);
      setWeeks(Array.isArray(data.weeks) ? data.weeks : []);
      setNextId(Number(data.nextId || 0) || computeNextIdFrom(data.units || [], 101));
      setControllers(Array.isArray(data.controllers) ? data.controllers : []);
      setNextCtrlId(Number(data.nextCtrlId || 0) || computeNextIdFrom(data.controllers || [], 101));
      e.target.value = ""; alert("Import complete ✅");
    } catch { alert("Import failed: invalid file."); }
  };

  // ----- Simple counts -----
  const unitCounts = units.reduce((a, u) => { a[u.status] = (a[u.status] || 0) + 1; return a; }, {});
  const ctrlCounts = controllers.reduce((a, c) => { a[c.status] = (a[c.status] || 0) + 1; return a; }, {});

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">🎮 Xbox Workshop Tracker</h1>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {["units", "controllers", "scorecard"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${tab === t ? "bg-blue-600 text-white" : "bg-white border"}`}>
            {t === "units" ? "🕹️ Units" : t === "controllers" ? "🎮 Controllers" : "📊 Scorecard"}
          </button>
        ))}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button onClick={exportJSON} className="px-3 py-2 bg-white border rounded">⬇️ Export JSON</button>
          {tab === "controllers" && (
            <button onClick={exportControllersCSV} className="px-3 py-2 bg-white border rounded">⬇️ Controllers CSV</button>
          )}
          <button onClick={triggerImport} className="px-3 py-2 bg-white border rounded">⬆️ Import</button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        </div>
      </div>

      {tab === "units" && (
        <>
          {/* (Your existing units summary bar here) */}
          <div className="mb-3 text-sm text-gray-600">
            Next Unit ID: <span className="font-semibold">XBX-{nextId}</span>
            <button onClick={() => setNextId(computeNextIdFrom(units, 101))} className="ml-2 px-2 py-1 border rounded bg-white">♻️ Recalc</button>
            <button onClick={undoDelete} disabled={!lastDeleted}
              className={`ml-2 px-2 py-1 border rounded ${lastDeleted ? "bg-yellow-100" : "bg-gray-100 text-gray-400"}`}>Undo Delete</button>
          </div>
          <UnitForm onAdd={addUnit} />
          <UnitTable units={units} onUpdateUnit={updateUnit} onDeleteUnit={deleteUnit} />
        </>
      )}

      {tab === "controllers" && (
        <>
          {/* Controller summary */}
          <div className="bg-white shadow-md rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Total Controllers" value={controllers.length} />
            <Stat label="Ready to Sell" value={controllers.filter(c => c.status === "Ready to Sell").length} color="text-green-600" />
            <Stat label="Sold" value={controllers.filter(c => c.status === "Sold").length} color="text-blue-600" />
            <Stat label="Next Ctrl ID" value={`CTR-${nextCtrlId}`} color="text-purple-600" />
          </div>
          <div className="mb-3 text-sm text-gray-600">
            <button onClick={recalcNextCtrlId} className="px-2 py-1 border rounded bg-white">♻️ Recalc Next Ctrl ID</button>
            <button onClick={undoDeleteCtrl} disabled={!lastDeletedCtrl}
              className={`ml-2 px-2 py-1 border rounded ${lastDeletedCtrl ? "bg-yellow-100" : "bg-gray-100 text-gray-400"}`}>Undo Delete</button>
          </div>
          <ControllerForm onAdd={addController} />
          <ControllerTable
            controllers={controllers}
            onUpdateController={updateController}
            onDeleteController={deleteController}
          />
        </>
      )}

      {tab === "scorecard" && <Scorecard weeks={weeks} setWeeks={setWeeks} />}
    </div>
  );
}

function Stat({ label, value, color = "text-gray-900" }) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
