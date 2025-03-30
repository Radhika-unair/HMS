import { useState, useEffect } from "react";
import search_icon from "../../../assets/search.png";
import { BASE_URL } from "../../../url_config";

const PrescriptionManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescription, setPrescription] = useState("");

  // Load appointments from local storage when the component mounts
  useEffect(() => {
    const storedAppointments = JSON.parse(localStorage.getItem("appointments")) || [];
    setAppointments(storedAppointments);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setFilteredAppointments([]); // Hide previous results when search text changes
    setSelectedAppointment(null);
  };

  // Handle search click
  const handleSearchClick = () => {
    if (!searchTerm.trim()) return; // Prevent empty searches

    setLoading(true);

    // Filter appointments by patient name
    const matchedAppointments = appointments.filter((appt) =>
      appt["Patient Name"].toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredAppointments(matchedAppointments);
    setLoading(false);
  };

  // Handle appointment selection
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setFilteredAppointments([]); // Hide appointment list
  };

  // Handle prescription submission
  const handleSavePrescription = async () => {
    if (!selectedAppointment || !prescription.trim()) return;
    const currentDoctor = JSON.parse(localStorage.getItem("currentDoctor"));
    try {
      const response = await fetch(`${BASE_URL}/prescription/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment.app_id,
          prescription,
          patientid: selectedAppointment.patient_id,
          doctorid: currentDoctor.id
        }),
      });

      if (response.ok) {
        setSelectedAppointment(null);
        setPrescription("");
      } else {
        console.error("Failed to save prescription");
      }
    } catch (error) {
      console.error("Error saving prescription:", error);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      {/* Search Patient Section */}
      <h2 className="text-xl font-semibold">Search Patient</h2>
      <div className="flex items-center border rounded-lg p-2">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by patient name"
          className="flex-grow px-4 py-2 border-none outline-none"
        />
        {/* Search Logo Image */}
        <img
          src={search_icon}
          alt="Search"
          className="w-6 h-6 ml-2 cursor-pointer"
          onClick={handleSearchClick} // Trigger the search on click
        />
      </div>

      {/* Display loading indicator */}
      {loading && <div>Loading...</div>}

      {/* Show list of appointment IDs if search results are found and no selection is made */}
      {filteredAppointments.length > 0 && !selectedAppointment && (
        <div className="mt-4 border p-4 rounded-lg shadow-md">
          <h3 className="font-semibold">Select an Appointment</h3>
          <div className="bg-white rounded-lg shadow p-6 pl-4">
            {filteredAppointments.map((appt) => (
              <div
                key= {appt.app_id}
                className="bg-white rounded-lg shadow-md p-6 text-gray-700 text-lg font-semibold hover:text-blue-800 mt-3 cursor-pointer border border-gray-300 hover:bg-gray-100 transition duration-300"
                onClick={() => handleAppointmentClick(appt)}
              >
                Appointment ID: {appt.app_id}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show the textbox and selected appointment ID */}
      {selectedAppointment && (
        <div className="mt-4 border p-4 rounded-lg shadow-md">
          <p className="font-semibold">Selected Appointment ID: {selectedAppointment.app_id}</p>
          <textarea
            placeholder="Additional Information"
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            className="mt-2 px-4 py-2 border rounded-md w-full h-56"
          />
          <div className="mt-4 flex justify-between">
            <button 
              className="bg-blue-500 text-white rounded-md px-6 py-2 w-1/2 mr-2"
              onClick={handleSavePrescription}
            >
            Save Prescription
            </button>
            <button 
              className="bg-red-500 text-white rounded-md px-6 py-2 w-1/2 ml-2"
              onClick={() => {
                setSelectedAppointment(null);
                setPrescription("");
              }}
            >
            Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionManagement;
