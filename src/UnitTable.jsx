import React from "react";

export default function UnitTable({ units, onUpdateStatus }) {
  if (units.length === 0) return <p>No units yet. Add one above.</p>;

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
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.id}</td>
              <td className="p-2">{u.version}</td>
              <td className="p-2">{u.condition}</td>
              <td className="p-2">
                <select
                  value={u.status}
                  onChange={(e) => onUpdateStatus(u.id, e.target.value)}
                  className={`p-1 rounded ${badgeClass(u.status)}`}
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
              </td>
              <td className="p-2">{u.notes || "-"}</td>
              <td className="p-2">{u.parts || "-"}</td>
              <td className="p-2 text-right">${u.cost?.toFixed(2) || "0.00"}</td>
              <td className="p-2 text-right">${u.sale?.toFixed(2) || "0.00"}</td>
              <td className="p-2 text-right font-semibold">
                ${(u.sale - u.cost).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
