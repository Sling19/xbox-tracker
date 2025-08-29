// ...imports
import React, { useEffect, useRef, useState } from "react";
import UnitTable from "./UnitTable";
import UnitForm from "./UnitForm";
import Scorecard from "./Scorecard";

// (keep your computeNextId function)
function computeNextId(units) {
  if (!units || units.length === 0) return 101;
  const maxNum = units.reduce((m, u) => {
    const n = Number(String(u.id || "").replace(/[^0-9]/g, "")) || 0;
    return Math.max(m, n);
  }, 100);
  return Math.max(101, maxNum + 1);
}

export default function App() {
  const [tab, setTab] = useState("units");

  // ---- Units / Scorecard ----
  const [units, setUnits] = useState(() =>
    JSON.parse(localStorage.getItem("units") || "[]")
  );
  const [weeks, setWeeks] = useState(() =>
    JSON.parse(localStorage.getItem("scorecard") || "[]")
  );

  // ---- Next ID & last deleted ----
  const [nextId, setNextId] = useState(() => {
    const saved = Number(localStorage.getItem("nextId") || 0);
    return saved > 0 ? saved : computeNextId(units);
  });
  const [lastDeleted, setLastDeleted] = useState(null);

  useEffect(() => localStorage.setItem("units", JSON.stringify(units)), [units]);
  useEffect(() => localStorage.setItem("scorecard", JSON.stringify(weeks)), [weeks]);
  useEffect(() => localStorage.setItem("nextId", String(nextId)), [nextId]);

  // ---- Add / Update / Delete / Undo ----
  function defaultTasks() {
    return {
      intakePhotos: false,
      versionCheck: false,
      smokeCorrosionCheck: false,
      clockCapRemoved: false,
      recap: false,
      traceRepair: false,
      thermalPaste: false,
      fanService: false,
      psuJackReflow: false,
      hddHealthLock: false,
      eepromBackup: false,
      dvdBelt: false,
      dvdLaserService: false,
      dvdLube: false,
      portsClean: false,
      finalTest: false,
      listingPhotos: false,
    };
  }

  const addUnit = (unit) => {
    const id = `XBX-${nextId}`;
    setUnits((u) => [...u, { id, tasks: defaultTasks(), ...unit }]);
    setNextId((n) => n + 1);                 // monotonic; we DO NOT reuse IDs
  };

  const updateUnit = (id, updated) => {
    setUnits((arr) => arr.map((u) => (u.id === id ? { ...u, ...updated } : u)));
  };

  const deleteUnit = (id) => {
    setUnits((arr) => {
      const toDelete = arr.find((u) => u.id === id);
      if (!toDelete) return arr;
      setLastDeleted(toDelete);               // enable Undo
      return arr.filter((u) => u.id !== id);
    });
    // Note: nextId remains monotonic; IDs are unique and never reused.
  };

  const undoDelete = () => {
    if (!lastDeleted) return;
    setUnits((arr) => [...arr, lastDeleted]);
    setLastDeleted(null);
  };

  // Optional: recompute nextId as max(existing)+1 (only when YOU want to)
  const recalcNextId = () => setNextId(computeNextId(units));

  // ---- Export / Import (unchanged except toolbar additions below) ----
  const fileInputRef = useRef(null);
  const exportJSON = () => {
    const payload = { units, weeks, nextId };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `xbox-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`,
    });
    a.click(); URL.revokeObjectURL(url);
  };
  function csvEscape(s) { s = String(s ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
  const exportUnitsCSV = () => {
    const headers = ["id", "version", "condition", "status", "notes", "parts", "cost", "sale", "profit", "checklist_pct"];
    const rows = units.map((u) => {
      const tasks = u.tasks || {};
      const keys = Object.keys(defaultTasks());
      const pct = Math.round((keys.filter(k => !!tasks[k]).length / keys.length) * 100);
      return [
        u.id, u.version || "", u.condition || "", u.status || "",
        (u.notes || "").replace(/\n/g, " "), (u.parts || "").replace(/\n/g, " "),
        (u.cost ?? 0).toFixed(2), (u.sale ?? 0).toFixed(2),
        ((u.sale ?? 0) - (u.cost ?? 0)).toFixed(2), `${pct}%`
      ];
    });
    const csv = [headers.join(","), ...rows.map(r => r.map(csvEscape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url, download: `units-${new Date().toISOString().slice(0, 10)}.csv`
    });
    a.click(); URL.revokeObjectURL(url);
  };
  const triggerImport = () => fileInputRef.current?.click();
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const importedUnits = Array.isArray(data.units) ? data.units : [];
      const importedWeeks = Array.isArray(data.weeks) ? data.weeks : [];
      const importedNext = Number(data.nextId || 0);
      setUnits(importedUnits);
      setWeeks(importedWeeks);
      setNextId(importedNext > 0 ? importedNext : computeNextId(importedUnits));
      e.target.value = "";
      alert("Import complete ✅");
    } catch { alert("Import failed: invalid file."); }
  };

  // ---- UI ----
  const counts = units.reduce((acc, u) => { acc[u.status] = (acc[u.status] || 0) + 1; return acc; }, {});

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">🎮 Xbox Unit Tracker</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setTab("units")}
          className={`px-4 py-2 rounded ${tab === "units" ? "bg-blue-600 text-white" : "bg-white border"}`}
        >🕹️ Units</button>
        <button
          onClick={() => setTab("scorecard")}
          className={`px-4 py-2 rounded ${tab === "scorecard" ? "bg-blue-600 text-white" : "bg-white border"}`}
        >📊 Scorecard</button>

        {/* right side controls */}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="px-3 py-2 bg-white border rounded text-sm">
            Next ID: <span className="font-semibold">XBX-{nextId}</span>
          </span>
          <button onClick={recalcNextId} className="px-3 py-2 bg-white border rounded" title="Set next ID = max existing + 1">
            ♻️ Recalc Next ID
          </button>
          <button onClick={undoDelete} disabled={!lastDeleted}
            className={`px-3 py-2 border rounded ${lastDeleted ? "bg-yellow-100" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            title="Restore the last deleted unit"
          >
            🗑️ Undo Delete
          </button>
          <button onClick={exportJSON} className="px-3 py-2 bg-white border rounded">⬇️ Export JSON</button>
          <button onClick={exportUnitsCSV} className="px-3 py-2 bg-white border rounded">⬇️ Units CSV</button>
          <button onClick={triggerImport} className="px-3 py-2 bg-white border rounded">⬆️ Import</button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        </div>
      </div>

      {tab === "units" ? (
        <>

          {/* Summary Bar */}
          <div className="bg-white shadow-md rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Total Units" value={units.length} />
            <Stat
              label="Ready to Sell"
              value={units.filter((u) => u.status === "Ready to Sell").length}
              color="text-green-600"
            />
            <Stat
              label="Sold"
              value={units.filter((u) => u.status === "Sold").length}
              color="text-blue-600"
            />
            <Stat
              label="Total Profit"
              value={
                "$" +
                units
                  .reduce(
                    (sum, u) =>
                      sum + ((u.sale ?? 0) - (u.cost ?? 0)),
                    0
                  )
                  .toFixed(2)
              }
              color="text-purple-600"
            />
          </div>

          {/* Status badges */}
          <div className="mb-4 flex gap-2 flex-wrap">
            {Object.entries(counts).map(([status, count]) => (
              <span key={status} className="px-3 py-1 bg-blue-100 rounded-lg">
                {status}: {count}
              </span>
            ))}
          </div>

          <UnitForm onAdd={addUnit} />
          <UnitTable units={units} onUpdateUnit={updateUnit} onDeleteUnit={deleteUnit} />
        </>
      ) : (
        <Scorecard weeks={weeks} setWeeks={setWeeks} />
      )}
    </div>
  );
}

function Stat({ label, value, color = "text-gray-900" }) {
  return (
    <div className="text-center">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
