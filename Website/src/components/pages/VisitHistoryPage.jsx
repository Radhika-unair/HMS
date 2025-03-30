import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VisitHistory from "./VisitHistory";
import { BASE_URL } from "../../url_config";

const VisitHistoryPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    setUser(JSON.parse(currentUser));
  }, [navigate]);

  const handleBackToProfile = () => {
    navigate("/my-profile");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Visit History</h1>
              <p className="mt-1 text-sm text-gray-500">
                Your past hospital visits and consultations
              </p>
            </div>
            <button
              onClick={handleBackToProfile}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-300"
            >
              Back to Profile
            </button>
          </div>
          
          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            <VisitHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitHistoryPage; 