import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../url_config";

const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({
    doctorName: "",
    patientName: "",
    doctorId: "",
    patientId: "",
    appointmentId: "",
    date: "",
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editForm, setEditForm] = useState({
    doctor_id: "",
    date: "",
    status: "Pending",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  // Fetch appointment data
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/admin/appointment/get_all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await response.json();
      setAppointments(data.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      showNotification("error", "Failed to fetch appointments");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch doctors list
  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${BASE_URL}/asset/doctors`);
      if (!response.ok) throw new Error('Failed to fetch doctors');
      const data = await response.json();
      setDoctors(data.doctors || data);
      setDoctorError(null);
      console.log(data);
    } catch (err) {
      setDoctorError(err.message);
    } finally {
      setDoctorLoading(false);
    }
  };
  
  

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 5000);
  };

  // Update filter values
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Handle appointment selection
  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setEditForm({
      doctor_id: appointment.doctor_id,
      date: appointment.date,
      status: appointment.status || "Pending",
    });
  };

  // Handle edit form changes
  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Handle save appointment changes
  const handleSaveChanges = async () => {
    if (!selectedAppointment) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/admin/appointment/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: selectedAppointment.app_id,
          doctor_id: editForm.doctor_id,
          date: editForm.date,
          status: editForm.status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update appointment");
      }

      const result = await response.json();
      
      if (result.status === "success") {
        showNotification("success", "Appointment updated successfully");
        setSelectedAppointment(null);
        fetchAppointments();
      } else {
        showNotification("error", result.message || "Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      showNotification("error", "Error updating appointment");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logic
  const filteredAppointments = appointments.filter((appointment) => {
    return (
      (filters.doctorName === "" || appointment.doctor_name.toLowerCase().includes(filters.doctorName.toLowerCase())) &&
      (filters.patientName === "" || appointment.patient_name.toLowerCase().includes(filters.patientName.toLowerCase())) &&
      (filters.doctorId === "" || appointment.doctor_id.toString().includes(filters.doctorId)) &&
      (filters.patientId === "" || appointment.patient_id.toString().includes(filters.patientId)) &&
      (filters.appointmentId === "" || appointment.app_id.toString().includes(filters.appointmentId)) &&
      (filters.date === "" || appointment.date === filters.date)
    );
  });

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className={`mb-4 p-3 rounded-lg text-white ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {notification.message}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4 text-gray-800">Appointments Management</h1>

      {/* Filter Inputs */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Filter Appointments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
            <input 
              type="text" 
              name="doctorName" 
              placeholder="Filter by Doctor" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
              value={filters.doctorName} 
              onChange={handleFilterChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <input 
              type="text" 
              name="patientName" 
              placeholder="Filter by Patient" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
              value={filters.patientName} 
              onChange={handleFilterChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor ID</label>
            <input 
              type="number" 
              name="doctorId" 
              placeholder="Doctor ID" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
              value={filters.doctorId} 
              onChange={handleFilterChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
            <input 
              type="number" 
              name="patientId" 
              placeholder="Patient ID" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
              value={filters.patientId} 
              onChange={handleFilterChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment ID</label>
            <input 
              type="number" 
              name="appointmentId" 
              placeholder="Appointment ID" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
              value={filters.appointmentId} 
              onChange={handleFilterChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              name="date" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
              value={filters.date} 
              onChange={handleFilterChange} 
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 bg-gray-200">
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-200 text-left">App ID</th>
                <th className="border border-gray-300 p-2 bg-gray-200 text-left">Doctor</th>
                <th className="border border-gray-300 p-2 bg-gray-200 text-left">Patient</th>
                <th className="border border-gray-300 p-2 bg-gray-200 text-left">Doctor ID</th>
                <th className="border border-gray-300 p-2 bg-gray-200 text-left">Patient ID</th>
                <th className="border border-gray-300 p-2 bg-gray-200 text-left">Date</th>
                <th className="border border-gray-300 p-2 bg-gray-200 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr 
                    key={appointment.app_id} 
                    className="border border-gray-300 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleSelectAppointment(appointment)}
                  >
                    <td className="border border-gray-300 p-2">{appointment.app_id}</td>
                    <td className="border border-gray-300 p-2">{appointment.doctor_name}</td>
                    <td className="border border-gray-300 p-2">{appointment.patient_name}</td>
                    <td className="border border-gray-300 p-2">{appointment.doctor_id}</td>
                    <td className="border border-gray-300 p-2">{appointment.patient_id}</td>
                    <td className="border border-gray-300 p-2">{appointment.date}</td>
                    <td className="border border-gray-300 p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === "complete" ? "bg-green-100 text-green-800" : 
                        appointment.status === "cancelled" ? "bg-red-100 text-red-800" : 
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {appointment.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-gray-500">
                    {isLoading ? "Loading appointments..." : "No appointments found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form Popup */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Edit Appointment</h2>
            
            <div className="space-y-4">
              {/* Patient Information (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <input 
                  type="text" 
                  value={selectedAppointment.patient_name} 
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" 
                  readOnly 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                <input 
                  type="text" 
                  value={selectedAppointment.patient_id} 
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" 
                  readOnly 
                />
              </div>
              
              {/* Doctor Selection (Dropdown) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select
                  name="doctor_id"
                  value={editForm.doctor_id}
                  onChange={handleEditFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor._id}>
                      {doctor.name} (ID: {doctor._id})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Appointment Date (Editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  name="date"
                  value={editForm.date} 
                  onChange={handleEditFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              {/* Status Selection (Dropdown with Pending as default) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="complete">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button 
                onClick={() => setSelectedAppointment(null)} 
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges} 
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsManagement;