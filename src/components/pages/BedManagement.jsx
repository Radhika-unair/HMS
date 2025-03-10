import { useState, useEffect } from "react";

const BedManagement = () => {
  const [beds, setBeds] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBed, setNewBed] = useState({
    bedNumber: "",
    ward: "",
    status: "available", // available, maintenance, in-use
    patientName: "",
    doctorInCharge: ""
  });
  const [editingBed, setEditingBed] = useState(null);

  useEffect(() => {
    // Load beds from localStorage
    const savedBeds = JSON.parse(localStorage.getItem("beds") || "[]");
    if (savedBeds.length === 0) {
      // Initialize with some default beds
      const defaultBeds = [
        {
          id: 1,
          bedNumber: "A101",
          ward: "General Ward",
          status: "available",
          patientName: "",
          doctorInCharge: ""
        },
        {
          id: 2,
          bedNumber: "A102",
          ward: "General Ward",
          status: "in-use",
          patientName: "John Doe",
          doctorInCharge: "Dr. Smith"
        }
      ];
      localStorage.setItem("beds", JSON.stringify(defaultBeds));
      setBeds(defaultBeds);
    } else {
      setBeds(savedBeds);
    }
  }, []);

  const saveBeds = (updatedBeds) => {
    localStorage.setItem("beds", JSON.stringify(updatedBeds));
    setBeds(updatedBeds);
  };

  const handleAddBed = (e) => {
    e.preventDefault();
    const newBedWithId = {
      ...newBed,
      id: Date.now()
    };
    saveBeds([...beds, newBedWithId]);
    setNewBed({
      bedNumber: "",
      ward: "",
      status: "available",
      patientName: "",
      doctorInCharge: ""
    });
    setShowAddForm(false);
  };

  const handleUpdateBed = (bed) => {
    const updatedBeds = beds.map(b => b.id === bed.id ? bed : b);
    saveBeds(updatedBeds);
    setEditingBed(null);
  };

  const handleStatusChange = (bed, newStatus) => {
    const updatedBed = { ...bed, status: newStatus };
    if (newStatus === "available") {
      updatedBed.patientName = "";
      updatedBed.doctorInCharge = "";
    }
    handleUpdateBed(updatedBed);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Bed Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Add New Bed
        </button>
      </div>

      {/* Add Bed Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Add New Bed</h3>
            <form onSubmit={handleAddBed} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bed Number</label>
                <input
                  type="text"
                  value={newBed.bedNumber}
                  onChange={(e) => setNewBed({ ...newBed, bedNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ward</label>
                <input
                  type="text"
                  value={newBed.ward}
                  onChange={(e) => setNewBed({ ...newBed, ward: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                >
                  Add Bed
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Beds Table */}
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

export default BedManagement; 