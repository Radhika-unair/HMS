import { useState, useEffect } from "react";
import { BASE_URL } from "../../url_config";

const VisitHistory = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    const fetchVisitHistory = async () => {
      try {
        const response = await fetch(`${BASE_URL}/user/visit-history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            patientId: JSON.parse(localStorage.getItem("currentUser")).id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch visit history");
        }

        const data = await response.json();
        setVisits(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitHistory();
  }, []);

  if (loading) return <p className="text-center text-lg text-gray-700">Loading visit history...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Visit History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visits.map((visit) => (
          <div
            key={visit.prescription_id}
            onClick={() => setSelectedVisit(visit)}
            className="p-6 border-l-4 border-blue-500 rounded-lg shadow-md bg-white hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {visit.doctor_name}
                </h3>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {visit.specialization}
                </span>
              </div>
              <p className="text-gray-600 line-clamp-3">{visit.prescription}</p>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(visit.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedVisit && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setSelectedVisit(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-800">{selectedVisit.doctor_name}</h3>
                <p className="text-lg text-blue-600 mt-1">{selectedVisit.specialization}</p>
              </div>
              <button
                onClick={() => setSelectedVisit(null)}
                className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-semibold text-gray-500 mb-1">Visit Date</p>
                  <p className="text-lg text-gray-800">
                    {new Date(selectedVisit.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-semibold text-gray-500 mb-1">Prescription ID</p>
                  <p className="text-lg text-gray-800 font-mono">{selectedVisit.prescription_id}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4">Prescription Details</h4>
                <pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-xl text-gray-800 font-sans leading-relaxed border border-gray-200">
                  {selectedVisit.prescription}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitHistory;