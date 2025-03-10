import { useState, useEffect } from "react";

const DoctorManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [managedDoctors, setManagedDoctors] = useState([]);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    password: "",
    speciality: "",
    experience: "",
    fees: ""
  });

  // Default doctors data
  const defaultDoctors = [
    {
      id: "1",
      name: "Dr. Ethan Carter",
      email: "ethan.carter@hospital.com",
      password: "doctor123",
      speciality: "Neurologist",
      experience: "12",
      fees: "1500"
    },
    {
      id: "2",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@hospital.com",
      password: "doctor123",
      speciality: "Pediatrician",
      experience: "10",
      fees: "800"
    },
    {
      id: "3",
      name: "Dr. Michael Chen",
      email: "michael.chen@hospital.com",
      password: "doctor123",
      speciality: "Cardiologist",
      experience: "15",
      fees: "1200"
    }
  ];

  // Initialize doctors
  useEffect(() => {
    const initializeDoctors = () => {
      // Try to get existing ALL DOCTORS first
      const existingDoctors = localStorage.getItem("doctors");
      if (existingDoctors) {
        const parsedDoctors = JSON.parse(existingDoctors);
        // Convert existing doctors to managed format
        const managedFormat = parsedDoctors.map(doc => ({
          ...doc,
          email: doc.email || `${doc.name.toLowerCase().replace(/\s+/g, '.')}@hospital.com`,
          password: "doctor123"
        }));
        setManagedDoctors(managedFormat);
        localStorage.setItem("managedDoctors", JSON.stringify(managedFormat));
      } else {
        // If no existing doctors, use defaults
        setManagedDoctors(defaultDoctors);
        localStorage.setItem("managedDoctors", JSON.stringify(defaultDoctors));
        localStorage.setItem("doctors", JSON.stringify(defaultDoctors.map(doc => ({
          id: doc.id,
          name: doc.name,
          speciality: doc.speciality,
          experience: doc.experience,
          fees: doc.fees
        }))));
      }
    };

    initializeDoctors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingDoctor) {
      setEditingDoctor(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewDoctor(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddDoctor = (e) => {
    e.preventDefault();
    const doctorToAdd = { 
      ...newDoctor, 
      id: Date.now().toString(),
      fees: newDoctor.fees.toString() 
    };
    
    const updatedDoctors = [...managedDoctors, doctorToAdd];
    setManagedDoctors(updatedDoctors);
    
    // Update both storages
    localStorage.setItem("managedDoctors", JSON.stringify(updatedDoctors));
    localStorage.setItem("doctors", JSON.stringify(updatedDoctors.map(doc => ({
      id: doc.id,
      name: doc.name,
      speciality: doc.speciality,
      experience: doc.experience,
      fees: doc.fees
    }))));

    setNewDoctor({
      name: "",
      email: "",
      password: "",
      speciality: "",
      experience: "",
      fees: ""
    });
    setShowAddForm(false);
  };

  const handleUpdateDoctor = (e) => {
    e.preventDefault();
    
    const updatedDoctors = managedDoctors.map(d => 
      d.id === editingDoctor.id ? {...editingDoctor, fees: editingDoctor.fees.toString()} : d
    );
    setManagedDoctors(updatedDoctors);
    
    // Update both storages
    localStorage.setItem("managedDoctors", JSON.stringify(updatedDoctors));
    localStorage.setItem("doctors", JSON.stringify(updatedDoctors.map(doc => ({
      id: doc.id,
      name: doc.name,
      speciality: doc.speciality,
      experience: doc.experience,
      fees: doc.fees
    }))));
    
    setEditingDoctor(null);
  };

  const handleRemoveDoctor = (id) => {
    const updatedDoctors = managedDoctors.filter(doc => doc.id !== id);
    setManagedDoctors(updatedDoctors);
    
    // Update both storages
    localStorage.setItem("managedDoctors", JSON.stringify(updatedDoctors));
    localStorage.setItem("doctors", JSON.stringify(updatedDoctors.map(doc => ({
      id: doc.id,
      name: doc.name,
      speciality: doc.speciality,
      experience: doc.experience,
      fees: doc.fees
    }))));
  };

  console.log("Current managedDoctors:", managedDoctors);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Doctor Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Add New Doctor
        </button>
      </div>

      {/* Add/Edit Doctor Form */}
      {(showAddForm || editingDoctor) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
            </h3>
            <form onSubmit={editingDoctor ? handleUpdateDoctor : handleAddDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={editingDoctor ? editingDoctor.name : newDoctor.name}
                  onChange={handleInputChange}
                  name="name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editingDoctor ? editingDoctor.email : newDoctor.email}
                  onChange={handleInputChange}
                  name="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              {!editingDoctor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={newDoctor.password}
                    onChange={handleInputChange}
                    name="password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Speciality</label>
                <input
                  type="text"
                  value={editingDoctor ? editingDoctor.speciality : newDoctor.speciality}
                  onChange={handleInputChange}
                  name="speciality"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                <input
                  type="text"
                  value={editingDoctor ? editingDoctor.experience : newDoctor.experience}
                  onChange={handleInputChange}
                  name="experience"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Appointment Fees</label>
                <input
                  type="number"
                  value={editingDoctor ? editingDoctor.fees : newDoctor.fees}
                  onChange={handleInputChange}
                  name="fees"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                >
                  {editingDoctor ? "Update Doctor" : "Add Doctor"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingDoctor(null);
                  }}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctors Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speciality</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fees</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {managedDoctors.map((doctor) => (
              <tr key={doctor.id}>
                <td className="px-6 py-4">{doctor.name}</td>
                <td className="px-6 py-4">{doctor.email}</td>
                <td className="px-6 py-4">{doctor.speciality}</td>
                <td className="px-6 py-4">{doctor.experience}</td>
                <td className="px-6 py-4">₹{doctor.fees}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingDoctor(doctor)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveDoctor(doctor.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorManagement; 