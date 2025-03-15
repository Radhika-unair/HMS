import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BedStatus from "./BedStatus";
import VisitHistory from "./VisitHistory";
import { BASE_URL } from "../../url_config";

const Myprofile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("in-person");
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(currentUser));

    // Load doctors
    const allDoctors = JSON.parse(localStorage.getItem("doctors") || "[]");
    console.log("Loaded doctors:", allDoctors);
    setDoctors(allDoctors);
  }, [navigate]);

  const handleScheduleAppointment = (e) => {
    e.preventDefault();
    console.log("Form submitted with:", {
      selectedDoctor,
      appointmentDate,
      appointmentTime,
      appointmentType
    });

    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      alert("Please fill in all fields");
      return;
    }

    // Convert selectedDoctor to number for comparison
    const doctorId = Number(selectedDoctor);
    const doctor = doctors.find(d => d.id === doctorId);
    console.log("Selected doctor:", doctor);
    
    if (!doctor) {
      alert("Error: Doctor not found. Please try again.");
      return;
    }

    // Check if doctor is active
    if (doctor.status !== "active") {
      alert("This doctor is currently unavailable. Please select another doctor.");
      return;
    }
    
    // Check doctor's patient limit
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    const doctorAppointments = appointments.filter(
      app => app.doctorId === doctorId && 
      app.date === appointmentDate &&
      app.status === "confirmed"
    );
    console.log("Doctor's appointments for selected date:", doctorAppointments);
    console.log("Doctor's patient limit:", doctor.patientLimit || 10);

    if (doctorAppointments.length >= (doctor.patientLimit || 10)) {
      alert("This doctor has reached their patient limit for this date. Please try another date or doctor.");
      return;
    }

    const newAppointment = {
      id: Date.now(),
      patientId: user.id,
      patientName: user.name,
      doctorId: doctorId,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      date: appointmentDate,
      time: appointmentTime,
      type: appointmentType,
      status: "confirmed",
      createdAt: new Date().toISOString()
    };

    console.log("Creating new appointment:", newAppointment);

    // Add to appointments array
    const updatedAppointments = [...appointments, newAppointment];
    localStorage.setItem("appointments", JSON.stringify(updatedAppointments));

    // Reset form
    setSelectedDoctor("");
    setAppointmentDate("");
    setAppointmentTime("");
    setAppointmentType("in-person");
    alert("Appointment scheduled successfully!");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="bg-white shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`${
                  activeTab === "profile"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("visits")}
                className={`${
                  activeTab === "visits"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Visit History
              </button>
              <button
                onClick={() => setActiveTab("beds")}
                className={`${
                  activeTab === "beds"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Bed Status
              </button>
              <button
                onClick={() => setActiveTab("schedule")}
                className={`${
                  activeTab === "schedule"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Schedule Appointment
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Personal Information
                  </h3>
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Full name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          value={user.name}
                          readOnly
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          value={user.email}
                          readOnly
                          className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">
                        Your QR Code
                      </label>
                      <div className="mt-1 flex items-center justify-center">
                        <img
                          src={`${BASE_URL}/generate/qr?email=${encodeURIComponent(user.email)}&key=${encodeURIComponent(user.password)}`}
                          alt="QR Code"
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Scan this QR code to access your profile information
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "visits" && <VisitHistory />}
            {activeTab === "beds" && <BedStatus />}
            {activeTab === "schedule" && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">📅</span>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Schedule a New Appointment
                      </h3>
                    </div>
                  </div>

                  <form onSubmit={handleScheduleAppointment} className="space-y-6">
                    {/* Doctor Selection */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">👨‍⚕️</span>
                        <label className="text-sm font-medium text-gray-700">
                          Select Doctor
                        </label>
                      </div>
                      <select
                        value={selectedDoctor}
                        onChange={(e) => {
                          console.log("Selected doctor ID:", e.target.value);
                          setSelectedDoctor(e.target.value);
                        }}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-white"
                        required
                      >
                        <option value="">Choose a doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            {doctor.name} - {doctor.speciality}
                            
                          </option>
                          
                        ))}
                      </select>
                    </div>
                        
                    {/* Date and Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">📆</span>
                          <label className="text-sm font-medium text-gray-700">
                            Appointment Date
                          </label>
                        </div>
                        <input
                          type="date"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-white"
                          required
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">⏰</span>
                          <label className="text-sm font-medium text-gray-700">
                            Appointment Time
                          </label>
                        </div>
                        <input
                          type="time"
                          value={appointmentTime}
                          onChange={(e) => setAppointmentTime(e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Appointment Type */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🎥</span>
                        <label className="text-sm font-medium text-gray-700">
                          Appointment Type
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setAppointmentType("in-person")}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            appointmentType === "in-person"
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl">🏥</span>
                            <span className="font-medium">In-Person</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAppointmentType("video")}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            appointmentType === "video"
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl">📹</span>
                            <span className="font-medium">Video Consultation</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        onClick={() => console.log("Submit button clicked")}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                      >
                        <span className="text-xl">✓</span>
                        Schedule Appointment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Myprofile;
