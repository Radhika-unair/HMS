import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorManagement from "./DoctorManagement";
import BedManagement from "./BedManagement";
import PatientManagement from "./PatientManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("doctors");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("currentAdmin"));
    if (!admin) {
      navigate("/admin/login");
      return;
    }
    setCurrentAdmin(admin);

    // Load doctors
    const allDoctors = JSON.parse(localStorage.getItem("doctors") || "[]");
    setDoctors(allDoctors);

    // Load appointments
    const allAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    setAppointments(allAppointments);

    // Load patients
    const allPatients = JSON.parse(localStorage.getItem("users") || "[]");
    setPatients(allPatients);

    // Load referrals
    const allReferrals = JSON.parse(localStorage.getItem("referrals") || "[]");
    setReferrals(allReferrals);
  }, [navigate]);

  const handleDoctorStatusChange = (doctorId, newStatus) => {
    const updatedDoctors = doctors.map(doctor => {
      if (doctor.id === doctorId) {
        return { ...doctor, status: newStatus };
      }
      return doctor;
    });
    localStorage.setItem("doctors", JSON.stringify(updatedDoctors));
    setDoctors(updatedDoctors);
  };

  const handleDoctorLimitChange = (doctorId, newLimit) => {
    const updatedDoctors = doctors.map(doctor => {
      if (doctor.id === doctorId) {
        return { ...doctor, patientLimit: parseInt(newLimit) };
      }
      return doctor;
    });
    localStorage.setItem("doctors", JSON.stringify(updatedDoctors));
    setDoctors(updatedDoctors);
  };

  const handleAppointmentStatusChange = (appointmentId, newStatus) => {
    const updatedAppointments = appointments.map(appointment => {
      if (appointment.id === appointmentId) {
        return { ...appointment, status: newStatus };
      }
      return appointment;
    });
    localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments);
  };

  const handleReferralStatusChange = (referralId, newStatus) => {
    const updatedReferrals = referrals.map(referral => {
      if (referral.id === referralId) {
        return { ...referral, status: newStatus };
      }
      return referral;
    });
    localStorage.setItem("referrals", JSON.stringify(updatedReferrals));
    setReferrals(updatedReferrals);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentAdmin");
    navigate("/admin/login");
  };

  const tabs = [
    { id: "doctors", label: "Doctors Management", icon: "👨‍⚕️" },
    { id: "appointments", label: "Appointments", icon: "📅" },
    { id: "patients", label: "Patients", icon: "🏥" },
    { id: "referrals", label: "Referrals", icon: "📨" },
    { id: "beds", label: "Bed Management", icon: "🛏️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-900">Total Doctors</h3>
            <p className="text-3xl font-bold text-primary">{doctors.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-900">Pending Appointments</h3>
            <p className="text-3xl font-bold text-primary">
              {appointments.filter(app => app.status === "pending").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-900">Total Patients</h3>
            <p className="text-3xl font-bold text-primary">{patients.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-900">Pending Referrals</h3>
            <p className="text-3xl font-bold text-primary">
              {referrals.filter(ref => ref.status === "pending").length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "doctors" && (
              <div className="overflow-x-auto">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => navigate("/admin/add-doctor")}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Add New Doctor
                  </button>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specialty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {doctors.map((doctor) => (
                      <tr key={doctor.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Dr. {doctor.name}
                              </div>
                              <div className="text-sm text-gray-500">{doctor.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doctor.specialty}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              doctor.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                            title={doctor.status === "active" 
                              ? "Doctor is currently accepting appointments" 
                              : "Doctor is not accepting appointments"}
                          >
                            {doctor.status === "active" ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            value={doctor.patientLimit || 10}
                            onChange={(e) => handleDoctorLimitChange(doctor.id, e.target.value)}
                            className="w-20 px-2 py-1 border rounded-md focus:ring-primary focus:border-primary"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              console.log("Editing doctor with ID:", doctor.id);
                              navigate(`/admin/edit-doctor/${doctor.id}`);
                            }}
                            className="text-primary hover:text-primary/80 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDoctorStatusChange(
                                doctor.id,
                                doctor.status === "active" ? "inactive" : "active"
                              )
                            }
                            className={`${
                              doctor.status === "active"
                                ? "text-red-600 hover:text-red-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                            title={doctor.status === "active" 
                              ? "Click to make doctor unavailable for appointments" 
                              : "Click to make doctor available for appointments"}
                          >
                            {doctor.status === "active" ? "Make Unavailable" : "Make Available"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="overflow-x-auto">
                <div className="mb-6 flex justify-between items-center">
                  <div className="flex gap-4">
                    <select
                      onChange={(e) => {
                        const today = new Date();
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const nextWeek = new Date(today);
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        const nextMonth = new Date(today);
                        nextMonth.setMonth(nextMonth.getMonth() + 1);

                        const filter = e.target.value;
                        let filteredAppointments = [...appointments];
                        
                        switch(filter) {
                          case 'today':
                            filteredAppointments = appointments.filter(app => 
                              new Date(app.date).toDateString() === today.toDateString()
                            );
                            break;
                          case 'tomorrow':
                            filteredAppointments = appointments.filter(app => 
                              new Date(app.date).toDateString() === tomorrow.toDateString()
                            );
                            break;
                          case 'week':
                            filteredAppointments = appointments.filter(app => 
                              new Date(app.date) <= nextWeek
                            );
                            break;
                          case 'month':
                            filteredAppointments = appointments.filter(app => 
                              new Date(app.date) <= nextMonth
                            );
                            break;
                          case 'future':
                            filteredAppointments = appointments.filter(app => 
                              new Date(app.date) > today
                            );
                            break;
                          case 'past':
                            filteredAppointments = appointments.filter(app => 
                              new Date(app.date) < today
                            );
                            break;
                          default:
                            break;
                        }
                        setAppointments(filteredAppointments);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Appointments</option>
                      <option value="today">Today</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="week">Next 7 Days</option>
                      <option value="month">Next 30 Days</option>
                      <option value="future">Future Appointments</option>
                      <option value="past">Past Appointments</option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total: {appointments.length} appointments
                  </div>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patientName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Dr. {appointment.doctorName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(appointment.date).toLocaleDateString()} at{" "}
                            {appointment.time}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(appointment.date) > new Date() ? "Upcoming" : "Past"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.type === "in-person" ? "In-Person" : "Video"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full 
                            ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "patients" && <PatientManagement />}

            {activeTab === "referrals" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referrals.map((referral) => (
                      <tr key={referral.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Dr. {referral.doctorName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{referral.message}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(referral.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              referral.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : referral.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {referral.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {referral.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleReferralStatusChange(referral.id, "approved")
                                }
                                className="text-green-600 hover:text-green-900 mr-4"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleReferralStatusChange(referral.id, "rejected")
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "beds" && <BedManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
