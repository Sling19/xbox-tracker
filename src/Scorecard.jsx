import React, { useEffect, useState } from "react";

export default function Scorecard({ weeks, setWeeks }) {
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
    avgPrice: "",
  });

  useEffect(() => {
    // persist handled by App.jsx; this is just a safety mirror
    localStorage.setItem("scorecard", JSON.stringify(weeks));
  }, [weeks]);

  const num = (v) => (v === "" || v === null ? 0 : Number(v));

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
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
        avgPrice: Number(form.avgPrice) || 0,
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
      avgPrice: "",
    });
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

  // Summary for the scorecard tab
  const totals = weeks.reduce(
    (acc, w) => {
      acc.sold += w.unitsSold || 0;
      acc.listed += w.unitsListed || 0;
      acc.hours.push(w.avgHours || 0);
      acc.prices.push(w.avgPrice || 0);
      return acc;
    },
    { sold: 0, listed: 0, hours: [], prices: [] }
  );
  const avg = (arr) =>
    arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : "0";

  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">📊 Weekly Scorecard</h2>

      {/* Scorecard Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="Weeks Logged" value={weeks.length} />
        <KPI label="Units Sold (sum)" value={totals.sold} />
        <KPI label="Avg Hours/Unit" value={avg(totals.hours)} />
        <KPI label="Avg Sale Price $" value={avg(totals.prices)} />
      </div>

      {/* Entry form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        {[
          ["week", "Week label (e.g. 2025-W35)"],
          ["unitsStarted", "Units Started"],
          ["unitsCompleted", "Units Completed"],
          ["avgHours", "Avg Hours/Unit"],
          ["revived", "Revived"],
          ["parted", "Parted"],
          ["unitsListed", "Units Listed"],
          ["unitsSold", "Units Sold"],
          ["avgDays", "Avg Days to Sell"],
          ["avgPrice", "Avg Sale Price $"],
        ].map(([name, ph]) => (
          <input
            key={name}
            name={name}
            type={
              ["week"].includes(name) ? "text" :
                ["avgHours", "avgDays", "avgPrice"].includes(name) ? "number" : "number"
            }
            step={["avgHours", "avgDays", "avgPrice"].includes(name) ? "0.1" : undefined}
            placeholder={ph}
            value={form[name]}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        ))}
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

function KPI({ label, value }) {
  return (
    <div className="p-3 rounded border text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
