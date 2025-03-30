import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BedStatus from "./BedStatus";
import { BASE_URL } from "../../url_config";

const Myprofile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [ticketData, setTicketData] = useState({});
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [currentView, setCurrentView] = useState('ALL');
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  // Function to handle tab navigation
  const handleTabChange = (tab) => {
    if (tab === "visits") {
      // Redirect to the dedicated Visit History page
      navigate("/visit-history");
      return;
    }
    
    setActiveTab(tab);
  };

  // Function to check if an appointment should be displayed based on date filter
  const filterAppointments = () => {
    if (!appointments.length) return;
    
    console.log("Filtering appointments with view:", currentView);
    
    // Convert dates and filter based on currentView
    const filtered = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.time);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of today
      
      if (currentView === "ALL") return true;
      
      if (currentView === "TODAY") {
        return appointmentDate.toDateString() === today.toDateString();
      }
      
      if (currentView === "UP") {
        return appointmentDate > today;
      }
      
      return true;
    });
    
    console.log("Filtered appointments:", filtered.length);
    setFilteredAppointments(filtered);
  };

  // Update filtered appointments when appointments or currentView changes
  useEffect(() => {
    filterAppointments();
  }, [appointments, currentView]);

  const show_ticket = async (appointment) => {
    console.log("Generating ticket for appointment:", appointment);
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    setTicketLoading(true);
    setTicketError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/generate/ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          appointment_id: appointment.appointmentId,
          department: appointment.specialization,
          patientId: user.id,
          appointment_date: appointment.time,
          doctor_name: appointment.Doctor,
          patient_name: currentUser.name,
          
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Failed to fetch ticket: ${response.status}`);
      }
      
      console.log("Ticket response received");
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Set the ticket data with appointment ID as the key
      setTicketData(prev => ({
        ...prev,
        [appointment.appointmentId]: imageUrl
      }));
    } catch (err) {
      setTicketError(err.message);
      console.error("Ticket fetch error:", err);
    } finally {
      setTicketLoading(false);
    }
  };
  
  // Function to close a specific ticket
  const closeTicket = (appointmentId) => {
    setTicketData(prev => {
      const newData = { ...prev };
      delete newData[appointmentId];
      return newData;
    });
    setTicketError(null);
  };
  
  // Function to cancel an appointment
  const cancelAppointment = async (appointment) => {
    if (cancelLoading) return;
    
    if (!confirm(`Are you sure you want to cancel your appointment with Dr. ${appointment.Doctor}?`)) {
      return;
    }
    
    setCancelLoading(true);
    
    try {
      console.log("Cancelling appointment:", appointment.appointmentId);
      const response = await fetch(`${BASE_URL}/appointment/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          appointmentId: appointment.appointmentId,
          patientId: user.id,
          doctorid: appointment.doctorId
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Failed to cancel appointment: ${response.status}`);
      }
      
      // Remove the appointment from the list on success
      setAppointments(prev => 
        prev.filter(app => app.appointmentId !== appointment.appointmentId)
      );
      
      alert("Appointment cancelled successfully");
    } catch (err) {
      console.error("Cancel error:", err);
      alert(err.message);
    } finally {
      setCancelLoading(false);
    }
  };
  
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(currentUser));
  }, [navigate]);

  useEffect(() => {
    const fetchScheduledAppointments = async () => {
      if (!user?.id) return;
    
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching appointments for user ID:", user.id);
        const response = await fetch(`${BASE_URL}/appointments/scheduled`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ userId: user.id }),
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response:", errorText);
          throw new Error(`Failed to fetch appointments: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Appointments data received:", data);
        setAppointments(data.appointments || []);
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Call the function when user changes
    if (user?.id) {
      fetchScheduledAppointments();
    }
  }, [user]); // Add user as dependency

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="bg-white shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => handleTabChange("profile")}
                className={`${
                  activeTab === "profile"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Profile
              </button>
              <button
                onClick={() => handleTabChange("scheduled")}
                className={`${
                  activeTab === "scheduled"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Scheduled Appointments
              </button>
              <button
                onClick={() => handleTabChange("visits")}
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm"
              >
                Visit History
              </button>
              <button
                onClick={() => handleTabChange("beds")}
                className={`${
                  activeTab === "beds"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Bed Status
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
                          src={`${BASE_URL}/generate/qr?email=${encodeURIComponent(
                            user.email
                          )}&key=${encodeURIComponent(user.id)}&type=${encodeURIComponent(user.type)}`}
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

            {activeTab === "scheduled" && (
              <div className="min-h-[400px] bg-white">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No scheduled appointments found</p>
                  </div>
                ) : (
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Your Scheduled Appointments</h2>
                    <div className="flex flex-row items-end gap-5 border rounded-lg p-4 hover:shadow-md transition-shadow mb-4">
                      <button 
                        className={`px-3 py-1 ${currentView === "TODAY" ? "bg-blue-600" : "bg-blue-400"} text-white rounded-md hover:bg-blue-600 text-sm font-medium`} 
                        onClick={() => setCurrentView("TODAY")}
                      >
                        Today
                      </button>
                      <button 
                        className={`px-3 py-1 ${currentView === "ALL" ? "bg-blue-600" : "bg-blue-400"} text-white rounded-md hover:bg-blue-600 text-sm font-medium`} 
                        onClick={() => setCurrentView("ALL")}
                      >
                        All
                      </button>
                      <button 
                        className={`px-3 py-1 ${currentView === "UP" ? "bg-blue-600" : "bg-blue-400"} text-white rounded-md hover:bg-blue-600 text-sm font-medium`} 
                        onClick={() => setCurrentView("UP")}
                      >
                        Upcoming
                      </button>
                    </div>
                    
                    {filteredAppointments.length === 0 ? (
                      <div className="flex items-center justify-center h-40">
                        <p className="text-gray-500">No appointments match your filter</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAppointments.map((appointment, index) => (
                          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{appointment.Doctor}</h3>
                                <p className="text-sm text-gray-700">{appointment.specialization}</p>
                                <p className="text-sm text-gray-500">Book ID: {appointment.appointmentId}</p>
                                <p className="text-sm text-gray-500">Appointment Date: {appointment.time}</p>
                                <p className="text-sm text-gray-500">Booked Date: {appointment.booked_date}</p>
                                <p className="text-sm text-gray-500">Amount: {appointment.fees} ₹</p>
                              </div>
                              <div className="flex flex-col items-center gap-12">
                                <div className="flex flex-row items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    appointment.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                    appointment.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                  >
                                    {appointment.status}
                                  </span>
                                  {appointment.status === "pending" && (
                                    <button 
                                      onClick={() => cancelAppointment(appointment)} 
                                      className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-800 text-sm font-medium"
                                      disabled={cancelLoading}
                                    >
                                      {cancelLoading ? "..." : "x"}
                                    </button>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2">
                                  {appointment.status === "pending" && (
                                    <button 
                                      onClick={() => show_ticket(appointment)} 
                                      className="px-6 py-3 bg-blue-400 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
                                      disabled={ticketLoading}
                                    >
                                      {ticketLoading ? "Loading..." : "Show ticket"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {ticketData[appointment.appointmentId] && (
                              <div className="mt-4 p-4 border border-gray-300 rounded-lg shadow-md bg-white flex flex-col items-center">
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">Your Appointment Ticket</h4>
                                <img 
                                  src={ticketData[appointment.appointmentId]} 
                                  alt="Ticket" 
                                  className="w-max h-auto object-contain rounded-lg shadow-lg border border-gray-400"
                                />
                                <div className="flex space-x-3 mt-3">
                                  <a
                                    href={ticketData[appointment.appointmentId]}
                                    download={`ticket-${appointment.appointmentId}.png`}
                                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium"
                                  >
                                    Download Ticket
                                  </a>
                                  <button 
                                    onClick={() => closeTicket(appointment.appointmentId)} 
                                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "visits" && <VisitHistory />}
            {activeTab === "beds" && <BedStatus />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Myprofile;
