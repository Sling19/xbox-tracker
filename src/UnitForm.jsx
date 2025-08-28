import React, { useState } from "react";

export default function UnitForm({ onAdd }) {
  const [version, setVersion] = useState("");
  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState("Intake");
  const [notes, setNotes] = useState("");
  const [parts, setParts] = useState("");
  const [cost, setCost] = useState("");
  const [sale, setSale] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      version,
      condition,
      status,
      notes,
      parts,
      cost: parseFloat(cost) || 0,
      sale: parseFloat(sale) || 0,
    });
    setVersion("");
    setCondition("");
    setStatus("Intake");
    setNotes("");
    setParts("");
    setCost("");
    setSale("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 shadow-md rounded-lg mb-6"
    >
      <h2 className="text-xl font-semibold mb-3">➕ Add New Xbox</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <input
          type="text"
          placeholder="Version (e.g. 1.0)"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Condition on Arrival"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="p-2 border rounded"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border rounded"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <textarea
          placeholder="Notes (repairs done, issues, etc.)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Parts Needed"
          value={parts}
          onChange={(e) => setParts(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <input
          type="number"
          step="0.01"
          placeholder="Cost ($)"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Sale Price ($)"
          value={sale}
          onChange={(e) => setSale(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold"
      >
        Add Unit
      </button>
    </form>
  );
}
