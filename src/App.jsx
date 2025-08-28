import React, { useState, useEffect } from "react";
import UnitTable from "./UnitTable";
import UnitForm from "./UnitForm";
import Scorecard from "./Scorecard";
import LoginGate from "./LoginGate";

export default function App() {
  const [tab, setTab] = useState("units");

  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem("units");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("units", JSON.stringify(units));
  }, [units]);

  const addUnit = (unit) => {
    // Use a simple readable ID (timestamp suffix)
    setUnits([...units, { id: `XBX-${Date.now()}`, ...unit }]);
  };

  const updateStatus = (id, status) => {
    setUnits(units.map(u => u.id === id ? { ...u, status } : u));
  };

  const counts = units.reduce((acc, u) => {
    acc[u.status] = (acc[u.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <LoginGate>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6">Console Revival Co. Tracker</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab("units")}
            className={`px-4 py-2 rounded ${tab === "units" ? "bg-blue-500 text-white" : "bg-white border"}`}
          >
            🕹️ Units
          </button>
          <button
            onClick={() => setTab("scorecard")}
            className={`px-4 py-2 rounded ${tab === "scorecard" ? "bg-blue-500 text-white" : "bg-white border"}`}
          >
            📊 Scorecard
          </button>
        </div>

        {tab === "units" ? (
          <>
            <div className="mb-4 flex gap-2 flex-wrap">
              {Object.entries(counts).map(([status, count]) => (
                <span key={status} className="px-3 py-1 bg-blue-200 rounded-lg">
                  {status}: {count}
                </span>
              ))}
            </div>

            <>
              {/* Summary Bar */}
              <div className="bg-white shadow-md rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Total Units</div>
                  <div className="text-2xl font-bold">{units.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Ready to Sell</div>
                  <div className="text-2xl font-bold text-green-600">
                    {units.filter((u) => u.status === "Ready to Sell").length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Sold</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {units.filter((u) => u.status === "Sold").length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Total Profit</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${units.reduce((sum, u) => sum + ((u.sale || 0) - (u.cost || 0)), 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Add Unit Form + Table */}
              <UnitForm onAdd={addUnit} />
              <UnitTable units={units} onUpdateStatus={updateStatus} />
            </>

          </>
        ) : (
          <Scorecard />
        )}
      </div>
    </LoginGate>
  );
}
