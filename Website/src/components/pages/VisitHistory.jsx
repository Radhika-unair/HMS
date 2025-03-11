import { useState, useEffect } from "react";

const VisitHistory = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVisitHistory = () => {
      try {
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) return;

        // Get all appointments
        const allAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
        const userAppointments = allAppointments.filter(app => app.patientId === currentUser.id);

        // Get all prescriptions
        const allPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]");
        const userPrescriptions = allPrescriptions.filter(pres => pres.patientId === currentUser.id);

        // Get all lab tests
        const allLabTests = JSON.parse(localStorage.getItem("labTests") || "[]");
        const userLabTests = allLabTests.filter(test => test.patientId === currentUser.id);

        // Combine appointments with their prescriptions and lab tests
        const visitsWithDetails = userAppointments.map(appointment => {
          const visitPrescriptions = userPrescriptions.filter(
            pres => pres.appointmentId === appointment.id
          );
          const visitLabTests = userLabTests.filter(
            test => test.appointmentId === appointment.id
          );

          return {
            ...appointment,
            prescriptions: visitPrescriptions,
            labTests: visitLabTests
          };
        });

        // Sort visits by date (newest first)
        const sortedVisits = visitsWithDetails.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );

        setVisits(sortedVisits);
      } catch (error) {
        console.error("Error loading visit history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVisitHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {visits.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No visit history found
        </div>
      ) : (
        visits.map((visit) => (
          <div key={visit.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Dr. {visit.doctorName}
                </h3>
                <p className="text-sm text-gray-500">{visit.speciality}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                  visit.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'}`}>
                {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Visit Date</p>
                <p className="font-medium">{new Date(visit.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{visit.time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Consultation Fee</p>
                <p className="font-medium">₹{visit.fees}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{visit.isVideo ? "Video Call" : "In-Person"}</p>
              </div>
            </div>

            {visit.notes && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-gray-700">{visit.notes}</p>
              </div>
            )}

            {/* Prescriptions Section */}
            {visit.prescriptions && visit.prescriptions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-900 mb-2">Prescriptions</h4>
                <div className="space-y-2">
                  {visit.prescriptions.map((prescription) => (
                    <div key={prescription.id} className="bg-gray-50 rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Date: {new Date(prescription.date).toLocaleDateString()}</p>
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Medications:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {prescription.medications.map((med, index) => (
                                <li key={index}>{med.name} - {med.dosage} - {med.frequency}</li>
                              ))}
                            </ul>
                          </div>
                          {prescription.notes && (
                            <p className="mt-2 text-sm text-gray-600">Notes: {prescription.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Tests Section */}
            {visit.labTests && visit.labTests.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">Lab Tests</h4>
                <div className="space-y-2">
                  {visit.labTests.map((test) => (
                    <div key={test.id} className="bg-gray-50 rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{test.testName}</p>
                          <p className="text-sm text-gray-500">
                            Date: {new Date(test.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                          {test.results && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Results:</p>
                              <p className="text-sm text-gray-600">{test.results}</p>
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full 
                          ${test.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          test.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default VisitHistory; 