import { useState, useEffect } from 'react';

const PatientRecords = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load patients from localStorage
    const loadedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    setPatients(loadedPatients);
    setLoading(false);
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toString().includes(searchTerm)
  );

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };

  if (loading) {
    return <div>Loading patient records...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Patient Records</h2>
        <div className="w-64">
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="md:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-700">Patient List</h3>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredPatients.map(patient => (
              <button
                key={patient.id}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedPatient?.id === patient.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => handlePatientClick(patient)}
              >
                <div className="font-medium text-gray-800">{patient.name}</div>
                <div className="text-sm text-gray-500">ID: {patient.id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Patient Details */}
        <div className="md:col-span-2">
          {selectedPatient ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">{selectedPatient.name}'s Medical History</h3>
                
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm text-gray-500">Date of Birth</label>
                    <div className="font-medium">{selectedPatient.dateOfBirth}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Blood Type</label>
                    <div className="font-medium">{selectedPatient.bloodType}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Contact</label>
                    <div className="font-medium">{selectedPatient.contact}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Emergency Contact</label>
                    <div className="font-medium">{selectedPatient.emergencyContact}</div>
                  </div>
                </div>

                {/* Medical History Tabs */}
                <div className="border-t pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Previous Visits */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Previous Visits</h4>
                      <div className="space-y-3">
                        {selectedPatient.visits?.map(visit => (
                          <div key={visit.id} className="border-b pb-2">
                            <div className="text-sm text-gray-500">{visit.date}</div>
                            <div className="font-medium">{visit.diagnosis}</div>
                            <div className="text-sm">{visit.treatment}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Current Medications */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Current Medications</h4>
                      <div className="space-y-2">
                        {selectedPatient.medications?.map(med => (
                          <div key={med.id} className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{med.name}</div>
                              <div className="text-sm text-gray-500">{med.dosage}</div>
                            </div>
                            <div className="text-sm text-gray-500">{med.frequency}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lab Results */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Recent Lab Results</h4>
                      <div className="space-y-2">
                        {selectedPatient.labResults?.map(result => (
                          <div key={result.id} className="border-b pb-2">
                            <div className="flex justify-between">
                              <div className="font-medium">{result.test}</div>
                              <div className="text-sm text-gray-500">{result.date}</div>
                            </div>
                            <div className="text-sm">{result.result}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Allergies & Notes */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Allergies & Notes</h4>
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-500">Allergies</h5>
                          <ul className="list-disc list-inside">
                            {selectedPatient.allergies?.map(allergy => (
                              <li key={allergy}>{allergy}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-500">Notes</h5>
                          <p className="text-sm">{selectedPatient.notes}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Select a patient to view their medical history
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRecords; 