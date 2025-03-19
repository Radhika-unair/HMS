import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);

    // Load appointments
    const allAppointments = JSON.parse(
      localStorage.getItem("appointments") || "[]"
    );
    const userAppointments = allAppointments.filter(
      (app) => app.patientId === user.id
    );
    setAppointments(userAppointments);

    // Load prescriptions
    const allPrescriptions = JSON.parse(
      localStorage.getItem("prescriptions") || "[]"
    );
    const userPrescriptions = allPrescriptions.filter(
      (pres) => pres.patientId === user.id
    );
    setPrescriptions(userPrescriptions);

    // Load lab tests
    const allLabTests = JSON.parse(localStorage.getItem("labTests") || "[]");
    const userLabTests = allLabTests.filter(
      (test) => test.patientId === user.id
    );
    setLabTests(userLabTests);
  }, [navigate]);

  const tabs = [
    { id: "appointments", label: "My Appointments", icon: "📅" },
    { id: "scheduled", label: "Scheduled Appointments", icon: "📋" },
    { id: "prescriptions", label: "Prescriptions", icon: "💊" },
    { id: "labTests", label: "Lab Tests", icon: "🔬" },
    { id: "telemedicine", label: "Video Consultations", icon: "📹" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
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
          {activeTab === "appointments" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {appointment.doctorName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            appointment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.isVideo ? "Video Call" : "In-Person"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "scheduled" && (
            <div className="min-h-[400px] bg-black text-white flex items-center justify-center">
              <h1 className="text-2xl font-bold">
                Scheduled Appointments Page
              </h1>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">
                        Dr. {prescription.doctorName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(prescription.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Medications:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {prescription.medications.map((med, index) => (
                        <li key={index}>
                          {med.name} - {med.dosage} - {med.frequency}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    {prescription.notes}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "labTests" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labTests.map((test) => (
                <div
                  key={test.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{test.testName}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(test.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full 
                      ${
                        test.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : test.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {test.status.charAt(0).toUpperCase() +
                        test.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {test.description}
                  </p>
                  {test.results && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Results:</h4>
                      <p className="text-sm text-gray-600">{test.results}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "telemedicine" && (
            <div className="grid grid-cols-1 gap-6">
              {appointments
                .filter((app) => app.isVideo && app.status === "scheduled")
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">
                          Dr. {appointment.doctorName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString()} at{" "}
                          {appointment.time}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          window.open(`/video-call/${appointment.id}`, "_blank")
                        }
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Join Call
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
