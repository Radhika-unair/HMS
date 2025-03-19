import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BedStatus from "./BedStatus";
import VisitHistory from "./VisitHistory";
import { BASE_URL } from "../../url_config";

const Myprofile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(currentUser));
  }, [navigate]);

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
                onClick={() => setActiveTab("scheduled")}
                className={`${
                  activeTab === "scheduled"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Scheduled Appointments
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
                          )}&key=${encodeURIComponent(user.password)}`}
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
              <div className="min-h-[400px] bg-white flex items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Scheduled Appointments
                </h1>
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
