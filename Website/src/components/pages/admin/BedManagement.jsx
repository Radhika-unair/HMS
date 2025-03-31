import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../url_config";

const BedManagement = () => {
  const [beds, setBeds] = useState([]);
  const [filteredBeds, setFilteredBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Single date filter
  const [selectedDate, setSelectedDate] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);

  useEffect(() => {
    fetchBeds();
  }, []);

  // Apply date filter whenever beds or filter date changes
  useEffect(() => {
    filterBeds();
  }, [beds, selectedDate]);

  const fetchBeds = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/admin/bed/get_all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch beds");
      }
      const data = await response.json();
      setBeds(data.data);
      setFilteredBeds(data.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching beds:", error);
      setError("Failed to load beds. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter beds based on selected date
  const filterBeds = () => {
    if (!selectedDate) {
      setFilteredBeds(beds);
      setIsFilterActive(false);
      return;
    }
    
    setIsFilterActive(true);
    
    const filtered = beds.filter(bed => {
      if (!bed.date) return false;
      
      // Convert both dates to YYYY-MM-DD format for comparison
      const bedDateStr = new Date(bed.date).toISOString().split('T')[0];
      const filterDateStr = new Date(selectedDate).toISOString().split('T')[0];
      
      return bedDateStr === filterDateStr;
    });
    
    setFilteredBeds(filtered);
  };

  // Clear filter
  const clearFilter = () => {
    setSelectedDate("");
    setFilteredBeds(beds);
    setIsFilterActive(false);
  };

  // Function to handle bed assignment/release
  const handleBedAction = async (bedId, status) => {
    try {
      const response = await fetch(`${BASE_URL}/admin/bed/update_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alloc_id: selectedBed.alloc_id,
          status: status
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update bed status`);
      }
      
      // Refresh bed data
      fetchBeds();
      
      // Close the modal
      setSelectedBed(null);
      
    } catch (error) {
      console.error(`Error updating bed status:`, error);
      setError(`Failed to update bed status. Please try again.`);
    }
  };

  // Group beds by status
  const pendingBeds = filteredBeds.filter(bed => bed.status === 0);
  const acceptedBeds = filteredBeds.filter(bed => bed.status === 1);
  const rejectedBeds = filteredBeds.filter(bed => bed.status === -1);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "None";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to render bed card
  const renderBedCard = (bed) => (
    <div
      key={bed.bed_id}
      className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-100"
      onClick={() => setSelectedBed(bed)}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Bed Number: {bed.bed_id}</h3>
      <div className="space-y-1 text-sm">
      <p className="flex justify-between">
          <span className="font-medium text-gray-600">allocation ID:</span>
          <span>{bed.alloc_id || "None"}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium text-gray-600">Patient:</span>
          <span>{bed.patient_name || "None"}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium text-gray-600">Doctor:</span>
          <span>{bed.doctor_name || "None"}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium text-gray-600">Specialization:</span>
          <span>{bed.specialization || "None"}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium text-gray-600">Date:</span>
          <span>{formatDate(bed.date)}</span>
        </p>
      </div>
    </div>
  );

  // Function to render a section of beds
  const renderBedSection = (title, beds, backgroundColor, titleColor) => (
    <div className={`p-5 rounded-lg ${backgroundColor} mb-6`}>
      <h3 className={`text-xl font-bold mb-4 ${titleColor}`}>{title} ({beds.length})</h3>
      {beds.length === 0 ? (
        <div className="bg-white p-4 rounded text-center text-gray-500">
          No beds in this category
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {beds.map(renderBedCard)}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Bed Management</h2>
        
        {/* Single Date Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-300"
                onClick={filterBeds}
              >
                Apply Filter
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors duration-300"
                onClick={clearFilter}
              >
                Clear
              </button>
            </div>
          </div>
          
          {isFilterActive && (
            <div className="mt-3 p-2 bg-blue-50 text-blue-700 rounded-md flex justify-between items-center">
              <span>
                Showing beds for {new Date(selectedDate).toLocaleDateString()}
              </span>
              <button 
                className="text-blue-700 hover:text-blue-900"
                onClick={clearFilter}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
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
        ) : (
          <div>
            {renderBedSection("Pending Requests", pendingBeds, "bg-yellow-50", "text-yellow-800")}
            {renderBedSection("Accepted Beds", acceptedBeds, "bg-green-50", "text-green-800")}
            {renderBedSection("Rejected Requests", rejectedBeds, "bg-red-50", "text-red-800")}
          </div>
        )}

        {/* Bed Details Modal */}
        {selectedBed && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={() => setSelectedBed(null)}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Bed Details</h2>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setSelectedBed(null)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="border-t border-b py-4 mb-4">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <span className="text-gray-600 font-medium">Bed ID:</span>
                  <span className="col-span-2">{selectedBed.bed_id}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span className="col-span-2">
                    {selectedBed.status === 1 && <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Accepted</span>}
                    {selectedBed.status === 0 && <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>}
                    {selectedBed.status === -1 && <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <span className="text-gray-600 font-medium">Patient:</span>
                  <span className="col-span-2">{selectedBed.patient_name || "None"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <span className="text-gray-600 font-medium">Doctor:</span>
                  <span className="col-span-2">{selectedBed.doctor_name || "None"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <span className="text-gray-600 font-medium">Specialization:</span>
                  <span className="col-span-2">{selectedBed.specialization || "None"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <span className="text-gray-600 font-medium">Date:</span>
                  <span className="col-span-2">{formatDate(selectedBed.date)}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors duration-300"
                  onClick={() => setSelectedBed(null)}
                >
                  Close
                </button>
                {selectedBed.status === 0 && (
                  <>
                    <button 
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-300"
                      onClick={() => handleBedAction(selectedBed.bed_id, -1)}
                    >
                      Reject
                    </button>
                    <button 
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-300"
                      onClick={() => handleBedAction(selectedBed.bed_id, 1)}
                    >
                      Accept
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BedManagement;