import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../url_config";

const ReferralsManagement = () => {
  const [referrals, setReferrals] = useState([]);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch referrals on page load
  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/admin/refer_appointments/getall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch referrals");
      }
      const data = await response.json();
      setReferrals(data.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      setError("Failed to load referrals. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleReferralAction = async (referralId, action) => {
    // action: 1 for Accept, 0 for Decline
    setActionLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/admin/refer_appointments/update_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referid: referralId,
          status: action,
          doc_id : selectedReferral.to_doc_id,
          patient_id : selectedReferral.patient_id,
          

        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action === 1 ? 'accept' : 'decline'} referral`);
      }
      
      // Update local state to reflect the change
      setReferrals(prevReferrals => 
        prevReferrals.map(ref => 
          ref.referid === referralId ? { ...ref, status: action } : ref
        )
      );
      
      // Close the modal
      setSelectedReferral(null);
      
      // Optionally refresh the list
      fetchReferrals();
      
    } catch (error) {
      console.error(`Error ${action === 1 ? 'accepting' : 'declining'} referral:`, error);
      setError(`Failed to ${action === 1 ? 'accept' : 'decline'} referral. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
   if (status === -1) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-white-800">canceled</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Processed</span>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Referrals Management</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : referrals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No referrals found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {referrals.map((referral) => (
              <div
                key={referral.referid}
                className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-100"
                onClick={() => setSelectedReferral(referral)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{referral.patient_name}</h3>
                  {getStatusBadge(referral.status)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">From:</span>
                    <span>{referral.from_doctor}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-8">
                    {referral.from_specialization}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">To:</span>
                    <span>{referral.to_doctor}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-8">
                    {referral.to_specialization}
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Referral Details Modal */}
        {selectedReferral && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={() => setSelectedReferral(null)}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Referral Details</h2>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setSelectedReferral(null)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="border-t border-b py-4 mb-4">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <span className="text-gray-600 font-medium">Patient:</span>
                  <span className="col-span-2">{selectedReferral.patient_name} </span>
                  
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <span className="text-gray-600 font-medium">Patient ID:</span>
                  
                  <span>{selectedReferral.patient_id}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <span className="text-gray-600 font-medium">From:</span>
                  <span className="col-span-2">{selectedReferral.from_doctor}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <span className="text-gray-600 font-medium">Specialization:</span>
                  <span className="col-span-2">{selectedReferral.from_specialization}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <span className="text-gray-600 font-medium">To:</span>
                  <span className="col-span-2">{selectedReferral.to_doctor}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <span className="text-gray-600 font-medium">Specialization:</span>
                  <span className="col-span-2">{selectedReferral.to_specialization}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span className="col-span-2">{getStatusBadge(selectedReferral.status)}</span>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-gray-600 font-medium mb-2">Description:</h3>
                <p className="text-gray-800 bg-gray-50 p-3 rounded border">{selectedReferral.description}</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors duration-300" 
                  onClick={() => setSelectedReferral(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleReferralAction(selectedReferral.referid, 0)}
                  disabled={actionLoading || selectedReferral.status !== 0}
                >
                  {actionLoading ? 'Processing...' : 'Decline'}
                </button>
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleReferralAction(selectedReferral.referid, 1)}
                  disabled={actionLoading || selectedReferral.status !== 0}
                >
                  {actionLoading ? 'Processing...' : 'Accept'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralsManagement;