import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../../url_config";

const DoctorManagement = ({ navigate }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [referLimit, setReferLimit] = useState("");
  const [appointmentLimit, setAppointmentLimit] = useState("");
  const [showDoctors, setShowDoctors] = useState(false); // Toggle doctors list
  const [initialDoctors, setInitialDoctors] = useState([]);


  // Fetch doctors (POST request)
  const handleAddDoctorClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/admin/refer/exist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error("Failed to fetch doctors");

      const data = await response.json();
      setDoctors(data.data || []);
      setShowDoctors(true); // Show container when doctors are fetched
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch another API when the component loads
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/admin/refer/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
  
        if (!response.ok) throw new Error("Failed to fetch initial data");
  
        const data = await response.json();
        setInitialDoctors(data.data || []);
      } catch (err) {
        console.error("Error fetching initial data:", err.message);
      }
    };
  
    fetchInitialData();
  }, []);
  

  // Open the modal for adding a doctor
  const openDoctorModal = (doctor) => {
    setSelectedDoctor(doctor);
    setReferLimit("");
    setAppointmentLimit("");
  };

  // Close the modal
  const closeDoctorModal = () => {
    setSelectedDoctor(null);
  };

  // Confirm adding the doctor (POST request)
  const confirmAddDoctor = async () => {
    if (!referLimit || !appointmentLimit) {
      alert("Please enter both limits.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/admin/refer/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctor_id: selectedDoctor.id,
          refer_limit: Number(referLimit),
          appointment_limit: Number(appointmentLimit),
        }),
      });

      if (!response.ok) throw new Error("Failed to add doctor");

      alert(`Doctor ${selectedDoctor.name} added successfully!`);
      closeDoctorModal();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
    handleAddDoctorClick();
    
  };
  const handleUpdateDoctor = async (doctor) => {
    try {
      const response = await fetch(`${BASE_URL}/admin/refer/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: doctor.id,
          refer_limit: doctor.refer_limit,
          appointment_limit: doctor.appointment_limit,
        }),
      });
  
      if (!response.ok ) throw new Error("Failed to update doctor");
      if(response.status==="fail") throw new Error("Failed to update doctor");
      alert(`Doctor ${doctor.name} updated successfully!`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  
  const handleBlockDoctor = async (doctorId , state) => {
     

    if (!window.confirm(`Are you sure you want to Block/Unblock `)) return;
  
    try {
      const response = await fetch(`${BASE_URL}/admin/refer/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_id: doctorId,
          block: state,
         }),
      });
  
      if (!response.ok) throw new Error("Failed to block doctor");
      if (response.status==="fail") throw new Error("Failed to block doctor");
      if (state ===1) alert("Doctor blocked successfully!");
      if (state ===0) alert("Doctor Unblocked successfully!");
      //setInitialDoctors(initialDoctors.filter((doc) => doc.id !== doctorId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  

  return (
    <div className="p-4">
      {/* Add Doctor Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddDoctorClick}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
          disabled={loading}
        >
          {loading ? "Loading..." : "Add Doctor"}
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-center text-red-500">{error}</p>}
  
      {/* Doctors Container with Close Button */}
      {showDoctors && (
        <div className="relative border p-4 rounded-lg shadow-md bg-gray-100">
          {/* Close Button */}
          <button
            onClick={() => setShowDoctors(false)}
            className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600 transition"
          >
            ✕
          </button>
  
          {/* Doctor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="border rounded-lg p-4 shadow-md bg-white">
                <div className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold"> {doctor.name}</h3>
                  <p className="text-gray-600 font-semibold">ID : {doctor.id}</p>
                </div>
                <p className="text-gray-600">{doctor.specialization}</p>
                <button
                  onClick={() => openDoctorModal(doctor)}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-400 "
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
  
      {/* Doctor Add Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-2">Add Doctor</h2>
            <p><strong>ID:</strong> {selectedDoctor.id}</p>
            <p><strong>Name:</strong> {selectedDoctor.name}</p>
            <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
  
            <div className="mt-4">
              <label className="block">Refer Limit:</label>
              <input
                type="number"
                value={referLimit}
                onChange={(e) => setReferLimit(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>
  
            <div className="mt-2">
              <label className="block">Appointment Limit:</label>
              <input
                type="number"
                value={appointmentLimit}
                onChange={(e) => setAppointmentLimit(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>
  
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeDoctorModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 "
              >
                Cancel
              </button>
              <button
                onClick={confirmAddDoctor}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 "
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Doctor List in List Format */}
      <div>
        {initialDoctors.length > 0 && (
          <div className="mt-6 border p-4 rounded-lg shadow-md bg-gray-100">
            <div className="flex justify-center items-center bg-white w-full py-4 rounded-md">
              <h2 className="text-xl font-semibold">Doctor List</h2>
            </div>
            
  
            {/* Changed from grid to list format */}
            <ul className="divide-y divide-gray-300">
              {initialDoctors.map((doctor) => (
                <li
                  key={doctor.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-4"
                >
                  {/* Doctor Details */}
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold">{doctor.name}</h3>
                    <p className="text-gray-600">{doctor.specialization}</p>
                    <p className="text-gray-500 font-semibold">ID: {doctor.id}</p>
                  </div>
                  
  
                  {/* Input Fields & Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 sm:mt-0">
                    {/* Refer Limit Input */}
                    <div>
                      <label className="block text-sm">Refer Limit</label>
                      <input
                        type="number"
                        value={doctor.refer_limit}
                        onChange={(e) => {
                          const updatedDoctors = initialDoctors.map((d) =>
                            d.id === doctor.id ? { ...d, refer_limit: Number(e.target.value) } : d
                          );
                          setInitialDoctors(updatedDoctors);
                        }}
                        className="w-24 border rounded-lg p-2 text-center"
                      />
                    </div>
  
                    {/* Appointment Limit Input */}
                    <div>
                      <label className="block text-sm">Appointment Limit</label>
                      <input
                        type="number"
                        value={doctor.appointment_limit}
                        onChange={(e) => {
                          const updatedDoctors = initialDoctors.map((d) =>
                            d.id === doctor.id ? { ...d, appointment_limit: Number(e.target.value) } : d
                          );
                          setInitialDoctors(updatedDoctors);
                        }}
                        className="w-24 border rounded-lg p-2 text-center"
                      />
                    </div>
  
                    {/* Action Buttons */}
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                      onClick={() => handleUpdateDoctor(doctor)}
                    >
                      Submit
                    </button>
                    { doctor.block === 0 &&
                      ( <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        onClick={() => handleBlockDoctor(doctor.id , 1)}
                        >
                        Block
                      </button>
                      )}
                      { doctor.block === 1 &&
                      ( <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        onClick={() => handleBlockDoctor(doctor.id , 0)}
                        >
                        Un_Block
                      </button>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};  
export default DoctorManagement;
