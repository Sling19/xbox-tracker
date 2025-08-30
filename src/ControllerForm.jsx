import React, { useState } from "react";

export default function ControllerForm({ onAdd }) {
  const [model, setModel] = useState("");
  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState("Intake");
  const [notes, setNotes] = useState("");
  const [parts, setParts] = useState("");
  const [cost, setCost] = useState("");
  const [sale, setSale] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onAdd({
      model,
      condition,
      status,
      notes,
      parts,
      cost: parseFloat(cost) || 0,
      sale: parseFloat(sale) || 0,
    });
    setModel(""); setCondition(""); setStatus("Intake");
    setNotes(""); setParts(""); setCost(""); setSale("");
  };

  return (
    <form onSubmit={submit} className="bg-white p-4 shadow-md rounded-lg mb-6">
      <h2 className="text-xl font-semibold mb-3">➕ Add Controller</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <input className="p-2 border rounded" placeholder="Model (e.g., Duke/S)"
          value={model} onChange={(e) => setModel(e.target.value)} required />
        <input className="p-2 border rounded" placeholder="Condition on Arrival"
          value={condition} onChange={(e) => setCondition(e.target.value)} />
        <select className="p-2 border rounded" value={status}
          onChange={(e) => setStatus(e.target.value)}>
          <option>Intake</option><option>Needs Part</option><option>Refurb</option>
          <option>Ready to Sell</option><option>Listed</option><option>Sold</option>
          <option>Parted Out</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <textarea className="p-2 border rounded" placeholder="Notes" value={notes}
          onChange={(e) => setNotes(e.target.value)} />
        <input className="p-2 border rounded" placeholder="Parts Needed"
          value={parts} onChange={(e) => setParts(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <input className="p-2 border rounded" type="number" step="0.01"
          placeholder="Cost ($)" value={cost} onChange={(e) => setCost(e.target.value)} />
        <input className="p-2 border rounded" type="number" step="0.01"
          placeholder="Sale ($)" value={sale} onChange={(e) => setSale(e.target.value)} />
      </div>
      <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">Add</button>
    </form>
  );
}
