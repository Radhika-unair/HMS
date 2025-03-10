import { useState, useEffect } from 'react';

const PrescriptionManagement = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPrescriptionModal, setShowNewPrescriptionModal] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
  });

  useEffect(() => {
    // Load patients and prescriptions from localStorage
    const loadedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    const loadedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    setPatients(loadedPatients);
    setPrescriptions(loadedPrescriptions);
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toString().includes(searchTerm)
  );

  const patientPrescriptions = prescriptions.filter(
    prescription => prescription.patientId === selectedPatient?.id
  );

  const handleNewPrescription = () => {
    if (!selectedPatient) return;

    const prescription = {
      id: Date.now(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: JSON.parse(localStorage.getItem('currentDoctor')).id,
      doctorName: JSON.parse(localStorage.getItem('currentDoctor')).name,
      ...newPrescription,
      date: new Date().toISOString(),
      status: 'active'
    };

    const updatedPrescriptions = [...prescriptions, prescription];
    setPrescriptions(updatedPrescriptions);
    localStorage.setItem('prescriptions', JSON.stringify(updatedPrescriptions));
    setShowNewPrescriptionModal(false);
    setNewPrescription({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: '',
    });
  };

  const handleStatusChange = (prescriptionId, newStatus) => {
    const updatedPrescriptions = prescriptions.map(prescription =>
      prescription.id === prescriptionId
        ? { ...prescription, status: newStatus }
        : prescription
    );
    setPrescriptions(updatedPrescriptions);
    localStorage.setItem('prescriptions', JSON.stringify(updatedPrescriptions));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Prescription Management</h2>
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-700">Select Patient</h3>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredPatients.map(patient => (
              <button
                key={patient.id}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedPatient?.id === patient.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="font-medium text-gray-800">{patient.name}</div>
                <div className="text-sm text-gray-500">ID: {patient.id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">
                {selectedPatient ? `${selectedPatient.name}'s Prescriptions` : 'Select a patient'}
              </h3>
              {selectedPatient && (
                <button
                  onClick={() => setShowNewPrescriptionModal(true)}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  New Prescription
                </button>
              )}
            </div>
            <div className="p-4">
              {!selectedPatient ? (
                <p className="text-center text-gray-500">Select a patient to view prescriptions</p>
              ) : patientPrescriptions.length === 0 ? (
                <p className="text-center text-gray-500">No prescriptions found</p>
              ) : (
                <div className="space-y-4">
                  {patientPrescriptions.map(prescription => (
                    <div
                      key={prescription.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{prescription.medication}</h4>
                          <p className="text-sm text-gray-500">
                            {prescription.dosage} - {prescription.frequency}
                          </p>
                        </div>
                        <select
                          value={prescription.status}
                          onChange={(e) => handleStatusChange(prescription.id, e.target.value)}
                          className="text-sm border rounded p-1"
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="text-sm">
                        <p><span className="text-gray-500">Duration:</span> {prescription.duration}</p>
                        <p><span className="text-gray-500">Notes:</span> {prescription.notes}</p>
                        <p className="text-gray-500 mt-2">
                          Prescribed on {new Date(prescription.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Prescription Modal */}
      {showNewPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">New Prescription</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medication
                </label>
                <input
                  type="text"
                  value={newPrescription.medication}
                  onChange={(e) =>
                    setNewPrescription({ ...newPrescription, medication: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter medication name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  value={newPrescription.dosage}
                  onChange={(e) =>
                    setNewPrescription({ ...newPrescription, dosage: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., 500mg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <input
                  type="text"
                  value={newPrescription.frequency}
                  onChange={(e) =>
                    setNewPrescription({ ...newPrescription, frequency: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Twice daily"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={newPrescription.duration}
                  onChange={(e) =>
                    setNewPrescription({ ...newPrescription, duration: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., 7 days"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newPrescription.notes}
                  onChange={(e) =>
                    setNewPrescription({ ...newPrescription, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleNewPrescription}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Save Prescription
                </button>
                <button
                  onClick={() => setShowNewPrescriptionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionManagement; 