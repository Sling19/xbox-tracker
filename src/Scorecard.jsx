import React, { useState, useEffect } from "react";

export default function Scorecard() {
  const [weeks, setWeeks] = useState(() => {
    const saved = localStorage.getItem("scorecard");
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    week: "",
    unitsStarted: "",
    unitsCompleted: "",
    avgHours: "",
    revived: "",
    parted: "",
    unitsListed: "",
    unitsSold: "",
    avgDays: "",
    avgPrice: ""
  });

  useEffect(() => {
    localStorage.setItem("scorecard", JSON.stringify(weeks));
  }, [weeks]);

  const num = (v) => (v === "" || v === null ? 0 : Number(v));

  const completionRate = (() => {
    const s = num(form.unitsStarted);
    const c = num(form.unitsCompleted);
    return s > 0 ? (c / s) * 100 : 0;
  })();

  const successRate = (() => {
    const r = num(form.revived);
    const p = num(form.parted);
    const total = r + p;
    return total > 0 ? (r / total) * 100 : 0;
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Store raw inputs; compute percentages on render so math always reflects the data
    setWeeks((w) => [
      ...w,
      {
        id: Date.now(),
        week: form.week || `Week ${w.length + 1}`,
        unitsStarted: num(form.unitsStarted),
        unitsCompleted: num(form.unitsCompleted),
        avgHours: Number(form.avgHours) || 0,
        revived: num(form.revived),
        parted: num(form.parted),
        unitsListed: num(form.unitsListed),
        unitsSold: num(form.unitsSold),
        avgDays: Number(form.avgDays) || 0,
        avgPrice: Number(form.avgPrice) || 0
      },
    ]);
    setForm({
      week: "",
      unitsStarted: "",
      unitsCompleted: "",
      avgHours: "",
      revived: "",
      parted: "",
      unitsListed: "",
      unitsSold: "",
      avgDays: "",
      avgPrice: ""
    });
  };

  const deleteRow = (id) => {
    setWeeks((w) => w.filter((row) => row.id !== id));
  };

  const pct = (n) => `${(Math.round(n * 10) / 10).toFixed(1)}%`;

  const computedFor = (row) => {
    const completion =
      row.unitsStarted > 0
        ? (row.unitsCompleted / row.unitsStarted) * 100
        : 0;
    const success =
      row.revived + row.parted > 0
        ? (row.revived / (row.revived + row.parted)) * 100
        : 0;
    return { completion, success };
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">📊 Weekly Scorecard</h2>

      {/* Live KPI preview based on the current form */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded border">
          <div className="text-xs text-gray-500">Completion %</div>
          <div className="text-xl font-semibold">{pct(completionRate)}</div>
        </div>
        <div className="p-3 rounded border">
          <div className="text-xs text-gray-500">Success %</div>
          <div className="text-xl font-semibold">{pct(successRate)}</div>
        </div>
        <div className="p-3 rounded border">
          <div className="text-xs text-gray-500">Units Sold</div>
          <div className="text-xl font-semibold">{num(form.unitsSold)}</div>
        </div>
        <div className="p-3 rounded border">
          <div className="text-xs text-gray-500">Avg Hours</div>
          <div className="text-xl font-semibold">
            {(Number(form.avgHours) || 0).toFixed(1)}
          </div>
        </div>
      </div>

      {/* Entry form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <input
          name="week"
          placeholder="Week label (e.g. 2025-W35)"
          value={form.week}
          onChange={handleChange}
          className="p-2 border rounded col-span-1 md:col-span-2"
        />
        <input
          name="unitsStarted"
          type="number"
          placeholder="Units Started"
          value={form.unitsStarted}
          onChange={handleChange}
          className="p-2 border rounded"
          min="0"
        />
        <input
          name="unitsCompleted"
          type="number"
          placeholder="Units Completed"
          value={form.unitsCompleted}
          onChange={handleChange}
          className="p-2 border rounded"
          min="0"
        />
        <input
          name="avgHours"
          type="number"
          step="0.1"
          placeholder="Avg Hours/Unit"
          value={form.avgHours}
          onChange={handleChange}
          className="p-2 border rounded"
          min="0"
        />

        <input
          name="revived"
          type="number"
          placeholder="Revived"
          value={form.revived}
          onChange={handleChange}
          className="p-2 border rounded"
          min="0"
        />
        <input
          name="parted"
          type="number"
          placeholder="Parted"
          value={form.parted}
          onChange={handleChange}
          className="p-2 border rounded"
          min="0"
        />
        <input
          name="unitsListed"
          type="number"
          placeholder="Units Listed"
          value={form.unitsListed}
          onChange={handleChange}
          className="p-2 border rounded"
          min="0"
        />
        <input
          name="unitsSold"
          type="number"
          placeholder="Units Sold"
          value={form.unitsSold}
          onChange={handleChange}
          className="p-2 border rounded"
          min="0"
        />
        <input
          name="avgDays"
          type="number"
          step="0.1"
          placeholder="Avg Days to Sell"
          value={form.avgDays}
          onChange={handleChange}
          className="p-2 border rounded"
          min="0"
        />
        <input
          name="avgPrice"
          type="number"
          step="0.01"
          placeholder="Avg Sale Price $"
          value={form.avgPrice}
          onChange={handleChange}
          className="p-2 border rounded"
          min="0"
        />

        <button
          type="submit"
          className="md:col-span-5 bg-green-600 text-white py-2 rounded font-semibold"
        >
          ➕ Add Week
        </button>
      </form>

      {/* Table */}
      {weeks.length === 0 ? (
        <p className="text-sm text-gray-700">No scorecard data yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-gray-50 shadow rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Week</th>
                <th className="p-2 text-right">Started</th>
                <th className="p-2 text-right">Completed</th>
                <th className="p-2 text-right">Completion %</th>
                <th className="p-2 text-right">Avg Hours</th>
                <th className="p-2 text-right">Revived</th>
                <th className="p-2 text-right">Parted</th>
                <th className="p-2 text-right">Success %</th>
                <th className="p-2 text-right">Listed</th>
                <th className="p-2 text-right">Sold</th>
                <th className="p-2 text-right">Avg Days</th>
                <th className="p-2 text-right">Avg Price $</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w) => {
                const comp = computedFor(w);
                return (
                  <tr key={w.id} className="border-t">
                    <td className="p-2">{w.week}</td>
                    <td className="p-2 text-right">{w.unitsStarted}</td>
                    <td className="p-2 text-right">{w.unitsCompleted}</td>
                    <td className="p-2 text-right">{pct(comp.completion)}</td>
                    <td className="p-2 text-right">{w.avgHours.toFixed(1)}</td>
                    <td className="p-2 text-right">{w.revived}</td>
                    <td className="p-2 text-right">{w.parted}</td>
                    <td className="p-2 text-right">{pct(comp.success)}</td>
                    <td className="p-2 text-right">{w.unitsListed}</td>
                    <td className="p-2 text-right">{w.unitsSold}</td>
                    <td className="p-2 text-right">{w.avgDays.toFixed(1)}</td>
                    <td className="p-2 text-right">{w.avgPrice.toFixed(2)}</td>
                    <td className="p-2">
                      <button
                        onClick={() => deleteRow(w.id)}
                        className="px-2 py-1 text-red-700 border border-red-300 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
