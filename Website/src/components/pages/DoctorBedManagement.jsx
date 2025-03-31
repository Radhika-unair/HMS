import { useState, useEffect } from "react";
import { BASE_URL } from "../../url_config";

const DoctorBedManagement = () => {
  const [beds, setBeds] = useState([]);
  const [bookedBeds, setBookedBeds] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    bed_id: "",
    appointment_id: "",
    patient_id: "",
    date: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [dropdownOpen, setDropdownOpen] = useState({ bed: false, appointment: false });

  const fetchBeds = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/bed_request/get_details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.status === "success") {
        setBeds(data.Bed_data);
        setBookedBeds(data.booked);
      }
    } catch (error) {
      console.error("Error fetching bed data:", error);
      showNotification("error", "Failed to load bed data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBeds();

    const loadAppointments = () => {
      const storedAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
      const pendingAppointments = storedAppointments.filter((appt) => appt.Status === "pending");
      setAppointments(pendingAppointments);
    };

    loadAppointments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "appointment_id") {
      const selectedAppointment = appointments.find(appt => appt.app_id.toString() === e.target.value);
      if (selectedAppointment) {
        setFormData(prevFormData => ({
          ...prevFormData,
          patient_id: selectedAppointment.patient_id,
        }));
      }
    }
  };

  const availableBeds = beds.filter(
    (bed) => !bookedBeds.some((booked) => booked.bed_id === bed.bed_id && booked.date === formData.date)
  );

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bed_id || !formData.appointment_id || !formData.date || !formData.patient_id) {
      showNotification("error", "Please fill all fields before submitting.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/bed_request/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bed_id: formData.bed_id,
          appointment_id: formData.appointment_id,
          patient_id: formData.patient_id,
          date: formData.date,
          currentdoc: JSON.parse(localStorage.getItem("currentDoctor"))["id"],
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        showNotification("success", "Bed allocated successfully!");
        setFormData({ bed_id: "", appointment_id: "", patient_id: "", date: "" });
        fetchBeds();
      } else {
        showNotification("error", result.message || "Failed to allocate bed.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      showNotification("error", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-xl">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center border-b pb-4 border-blue-200">
        Bed Allocation Request
      </h2>

      {notification.show && (
        <div className={`mb-6 p-3 rounded-lg text-white text-center ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {notification.message}
        </div>
      )}

      <form className="bg-white p-6 rounded-lg shadow-md border border-gray-100" onSubmit={handleSubmit}>
        {/* Date Selection */}
        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-2">
            Select Date:
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border-2 border-gray-300 rounded-lg p-3 transition duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Bed Selection */}
        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-2">
            Select Bed:
          </label>
          <div className="relative">
            <select
              name="bed_id"
              value={formData.bed_id}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-lg p-3 appearance-none transition duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 bg-white text-gray-800 cursor-pointer"
              disabled={!formData.date}
              style={{
                backgroundImage: "linear-gradient(to bottom, #f9fafb, #f3f4f6)",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
              }}
            >
              <option value="" className="text-gray-500">Select a Bed</option>
              {availableBeds.map((bed) => (
                <option key={bed.bed_id} value={bed.bed_id} className="py-2 text-gray-800 hover:bg-blue-50">
                  Bed {bed.bed_id} - Room {bed.room_number}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {formData.date && availableBeds.length === 0 && (
            <p className="mt-2 text-sm text-red-500">No beds available for the selected date.</p>
          )}
        </div>

        {/* Appointment Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Select Appointment:
          </label>
          <div className="relative">
            <select
              name="appointment_id"
              value={formData.appointment_id}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-lg p-3 appearance-none transition duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 bg-white text-gray-800 cursor-pointer"
              style={{
                backgroundImage: "linear-gradient(to bottom, #f9fafb, #f3f4f6)",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
              }}
            >
              <option value="" className="text-gray-500">Select an Appointment</option>
              {appointments.map((appt) => (
                <option key={appt.app_id} value={appt.app_id} className="py-2 text-gray-800 hover:bg-blue-50">
                  {appt["Patient Name"]} - ID: {appt["patient_id"]} - [{appt["Appointment Date"]} at {appt["Appointment Time"]}]
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {appointments.length === 0 && (
            <p className="mt-2 text-sm text-amber-600">No pending appointments available.</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Submit Request"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Available beds are automatically filtered based on selected date.</p>
      </div>

      {/* Custom Dropdown Styles */}
      <style jsx>{`
        select option {
          padding: 10px;
          background-color: white;
          color: #1f2937;
        }
        
        select option:hover {
          background-color: #eff6ff;
        }
        
        select option:checked {
          background-color: #dbeafe;
          color: #1e40af;
        }
      `}</style>
    </div>
  );
};

export default DoctorBedManagement;