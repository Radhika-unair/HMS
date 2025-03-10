import { useState, useEffect } from "react";

const DoctorBedManagement = () => {
  const [beds, setBeds] = useState([]);
  const [editingBed, setEditingBed] = useState(null);

  useEffect(() => {
    // Get beds data from localStorage
    const bedsData = JSON.parse(localStorage.getItem("beds") || "[]");
    setBeds(bedsData);
  }, []);

  const handleStatusChange = (bed, newStatus) => {
    const updatedBed = { ...bed, status: newStatus };
    if (newStatus === "available") {
      updatedBed.patientName = "";
      updatedBed.doctorInCharge = "";
    }
    handleUpdateBed(updatedBed);
  };

  const handleUpdateBed = (bed) => {
    const updatedBeds = beds.map(b => b.id === bed.id ? bed : b);
    localStorage.setItem("beds", JSON.stringify(updatedBeds));
    setBeds(updatedBeds);
    setEditingBed(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "in-use":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Bed Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bed Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ward</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor In Charge</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {beds.map((bed) => (
              <tr key={bed.id}>
                <td className="px-6 py-4">{bed.bedNumber}</td>
                <td className="px-6 py-4">{bed.ward}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(bed.status)}`}>
                    {bed.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {editingBed?.id === bed.id ? (
                    <input
                      type="text"
                      value={editingBed.patientName}
                      onChange={(e) => setEditingBed({ ...editingBed, patientName: e.target.value })}
                      className="border border-gray-300 rounded p-1"
                    />
                  ) : (
                    bed.patientName || "-"
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingBed?.id === bed.id ? (
                    <input
                      type="text"
                      value={editingBed.doctorInCharge}
                      onChange={(e) => setEditingBed({ ...editingBed, doctorInCharge: e.target.value })}
                      className="border border-gray-300 rounded p-1"
                    />
                  ) : (
                    bed.doctorInCharge || "-"
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingBed?.id === bed.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateBed(editingBed)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingBed(null)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <select
                        value={bed.status}
                        onChange={(e) => handleStatusChange(bed, e.target.value)}
                        className="border border-gray-300 rounded p-1"
                      >
                        <option value="available">Available</option>
                        <option value="in-use">In Use</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                      {bed.status === "in-use" && (
                        <button
                          onClick={() => setEditingBed(bed)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorBedManagement; 