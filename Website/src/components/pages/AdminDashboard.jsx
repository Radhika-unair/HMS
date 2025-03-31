import { useState } from "react";
import DoctorManagement from "./admin/admin_doctorManagment"; // Import Doctor Management
import AppointmentsManagement from "./admin/AppointmentsManagement"; // Import Appointments Management
import ReferralsManagement from "./admin/ReferralsManagement";
import BedManagement from "./admin/BedManagement"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("doctors");

  const tabs = [
    { id: "doctors", label: "Doctors Management", icon: "👨‍⚕️" },
    { id: "appointments", label: "Appointments", icon: "📅" },
    /*{ id: "patients", label: "Patients", icon: "🏥" },*/
    { id: "referrals", label: "Referrals", icon: "📨" },
    { id: "beds", label: "Bed Management", icon: "🛏️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow">
        <nav className="flex space-x-8 px-6 py-4 border-b border-gray-200">
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
              <span className="font-medium ml-1">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Conditional Rendering for Content */}
      <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow mt-4 p-6">
        {activeTab === "doctors" && <DoctorManagement />}
        {activeTab === "appointments" && <AppointmentsManagement />}
        {activeTab === "referrals" && <ReferralsManagement />}
        {activeTab === "beds" && <BedManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
