import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorBedManagement from "./DoctorBedManagement";
import PatientRecords from "./doctor/PatientRecords";
import ScheduleManagement from "./doctor/ScheduleManagement";
import PrescriptionManagement from "./doctor/PrescriptionManagement";
import LabManagement from "./doctor/LabManagement";
import AnalyticsDashboard from "./doctor/AnalyticsDashboard";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");
  const [appointments, setAppointments] = useState([]);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const doctor = JSON.parse(localStorage.getItem("currentDoctor"));
    if (!doctor) {
      navigate("/login");
      return;
    }
    setCurrentDoctor(doctor);

    // Load appointments
    const allAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    const doctorAppointments = allAppointments.filter(
      (app) => app.doctorId === doctor.id
    );
    setAppointments(doctorAppointments);

    // Load referrals
    const loadedReferrals = JSON.parse(localStorage.getItem("referrals") || "[]");
    const doctorReferrals = loadedReferrals.filter(r => r.doctorId === doctor.id);
    setReferrals(doctorReferrals);
    updateUnreadCount(doctorReferrals);
  }, [navigate]);

  const updateUnreadCount = (referralsList) => {
    const unread = referralsList.filter(r => !r.isRead).length;
    setUnreadCount(unread);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentDoctor");
    navigate("/login");
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    const updatedAppointments = appointments.map((app) =>
      app.id === appointmentId ? { ...app, status: newStatus } : app
    );
    setAppointments(updatedAppointments);
    
    // Update in localStorage
    const allAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    const updatedAllAppointments = allAppointments.map((app) =>
      app.id === appointmentId ? { ...app, status: newStatus } : app
    );
    localStorage.setItem("appointments", JSON.stringify(updatedAllAppointments));
  };

  const handleMarkAsRead = (referralId) => {
    const updatedReferrals = referrals.map(referral => 
      referral.id === referralId ? { ...referral, isRead: true } : referral
    );
    localStorage.setItem("referrals", JSON.stringify(updatedReferrals));
    setReferrals(updatedReferrals);
    updateUnreadCount(updatedReferrals);
  };

  const handleSendReferral = () => {
    const message = prompt("Please enter your referral message:");
    if (!message) return;

    // Get existing referrals or initialize empty array
    const referrals = JSON.parse(localStorage.getItem("referrals") || "[]");
    
    // Create new referral
    const newReferral = {
      id: Date.now(),
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      message: message,
      status: "pending",
      createdAt: new Date().toISOString(),
      isRead: false
    };

    // Add to referrals array
    const updatedReferrals = [...referrals, newReferral];
    localStorage.setItem("referrals", JSON.stringify(updatedReferrals));
    setReferrals(updatedReferrals.filter(r => r.doctorId === currentDoctor.id));
    updateUnreadCount(updatedReferrals.filter(r => r.doctorId === currentDoctor.id));
    alert("Referral message sent successfully!");
  };

  const tabs = [
    { id: "analytics", label: "Dashboard", icon: "📊" },
    { id: "appointments", label: "Appointments", icon: "📅" },
    { id: "patients", label: "Patient Records", icon: "👤" },
    { id: "schedule", label: "Schedule", icon: "⏰" },
    { id: "prescriptions", label: "Prescriptions", icon: "💊" },
    { id: "lab", label: "Lab Tests", icon: "🔬" },
    { id: "beds", label: "Bed Management", icon: "🛏️" },
  ];

  if (!currentDoctor) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
              <p className="text-gray-600">Welcome, Dr. {currentDoctor.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSendReferral}
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2"
            >
              <span>📨</span>
              <span>Send Referral</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
              >
                <span>🔔</span>
                <span className="text-sm font-medium">Referrals</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Your Referrals</h3>
                      <div className="flex gap-2">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                          {referrals.filter(r => r.status === "pending").length} Pending
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                          {referrals.filter(r => r.status === "approved").length} Approved
                        </span>
                        <span className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full">
                          {referrals.filter(r => r.status === "rejected").length} Rejected
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {referrals.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 text-sm">No referrals yet</p>
                        </div>
                      ) : (
                        referrals.map((referral) => (
                          <div
                            key={referral.id}
                            className={`p-3 rounded-lg border ${
                              !referral.isRead ? "bg-blue-50 border-blue-200" : "border-gray-200"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-medium">
                                {referral.message}
                              </p>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  referral.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : referral.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(referral.createdAt).toLocaleString()}
                            </p>
                            {!referral.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(referral.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex flex-wrap gap-2 p-2">
            {tabs.map((tab) => (
          <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
          </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {activeTab === "analytics" && <AnalyticsDashboard />}
          {activeTab === "appointments" && (
            <div className="overflow-x-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Appointments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appointments
                    .filter(app => new Date(app.date).toDateString() === new Date().toDateString())
                    .map((appointment) => (
                      <div key={appointment.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                            <p className="text-sm text-gray-500">{appointment.time}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                            ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Type: {appointment.type === "in-person" ? "In-Person" : "Video Consultation"}</p>
                          {appointment.notes && <p className="mt-2">Notes: {appointment.notes}</p>}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-4">All Appointments</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                      Patient Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{appointment.patientName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(appointment.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full 
                          ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "patients" && <PatientRecords />}
          {activeTab === "schedule" && <ScheduleManagement />}
          {activeTab === "prescriptions" && <PrescriptionManagement />}
          {activeTab === "lab" && <LabManagement />}
          {activeTab === "beds" && <DoctorBedManagement />}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
