import { useState, useEffect } from "react";
import { BASE_URL } from "../../url_config";

const BedStatus = () => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);

  useEffect(() => {
    const fetchBeds = async () => {
      try {
        const response = await fetch(`${BASE_URL}/user/beds_details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ patientId: JSON.parse(localStorage.getItem("currentUser")).id }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bed details");
        }

        const data = await response.json();
        setBeds(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBeds();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  // Corrected filters
  const activeBeds = beds.filter(bed => 
    (bed.status === "1" || bed.status === "0") && bed.date >= today
  );
  const usedBeds = beds.filter(bed => bed.status === "1" && bed.date < today);
  const canceledBeds = beds.filter(bed => bed.status === "0" && bed.date < today);

  if (loading) return <p className="text-center text-lg text-gray-600 mt-8">Loading bed details...</p>;
  if (error) return <p className="text-red-500 text-center mt-8">Error: {error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Hospital Bed Status</h2>

      {/* Active Allocations */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-gray-700 mb-6">Active Allocations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBeds.map((bed) => (
            <div
              key={bed.alloc_id}
              onClick={() => setSelectedBed(bed)}
              className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all hover:shadow-xl
                ${bed.status === "1" ? "bg-green-50 border-2 border-green-200" : "bg-yellow-50 border-2 border-yellow-200"}`}
            >
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-gray-800 mb-3">Bed {bed.bed_id}</div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${bed.status === "1" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {bed.status === "1" ? "Currently Allocated" : "Processing Request"}
                </span>
                <div className="mt-4 text-sm text-gray-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {new Date(bed.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Used Beds */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-gray-700 mb-6">Previous Allocations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usedBeds.map((bed) => (
            <div 
              key={bed.alloc_id}
              className="p-6 rounded-xl shadow-lg bg-blue-50 border-2 border-blue-200"
            >
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-gray-800 mb-3">Bed {bed.bed_id}</div>
                <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                  Completed Stay
                </span>
                <div className="mt-4 text-sm text-gray-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {new Date(bed.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canceled Beds */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-gray-700 mb-6">Canceled Requests</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canceledBeds.map((bed) => (
            <div 
              key={bed.alloc_id}
              className="p-6 rounded-xl shadow-lg bg-gray-100 border-2 border-gray-300"
            >
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-gray-800 mb-3">Bed {bed.bed_id}</div>
                <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-200 text-gray-800">
                  Canceled Allocation
                </span>
                <div className="mt-4 text-sm text-gray-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {new Date(bed.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setSelectedBed(null)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Bed Allocation Details</h3>
              <button
                onClick={() => setSelectedBed(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Bed Number</p>
                  <p className="text-lg font-semibold text-gray-800">#{selectedBed.bed_id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <p className="text-lg font-semibold capitalize">
                    <span className={`${selectedBed.status === "1" ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedBed.status === "1" ? "Active" : "Processing"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm font-medium text-gray-500 mb-1">Allocation Date</p>
                <p className="text-lg text-gray-800">
                  {new Date(selectedBed.date).toLocaleDateString("en-US", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Patient ID</p>
                  <p className="text-lg text-gray-800 font-mono">#{selectedBed.patient_id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-500 mb-1">Appointment ID</p>
                  <p className="text-lg text-gray-800 font-mono">#{selectedBed.appointment_id}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm font-medium text-gray-500 mb-1">Responsible Doctor</p>
                <p className="text-lg text-gray-800">{selectedBed.doctor}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedBed.specialization}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedStatus;