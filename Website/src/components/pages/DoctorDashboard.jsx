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
  const [currentDoctor, setCurrentDoctor] = useState(null);

  useEffect(() => {
    const doctor = JSON.parse(localStorage.getItem("currentDoctor"));
    if (!doctor) {
      navigate("/login");
      return;
    }
    setCurrentDoctor(doctor);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentDoctor");
    navigate("/login");
  };

  const tabs = [
    { id: "analytics", label: "Dashboard", icon: "📊" },
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
      <div className="bg-white shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
            <p className="text-gray-600">Welcome, {currentDoctor.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4">
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

        <div className="bg-white rounded-xl shadow-md p-6">
          {activeTab === "analytics" && <AnalyticsDashboard />}
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
