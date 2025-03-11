import { useState, useEffect } from 'react';

const LabManagement = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [labTests, setLabTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  const [newTest, setNewTest] = useState({
    testName: '',
    type: '',
    urgency: 'normal',
    notes: '',
  });

  const TEST_TYPES = [
    'Blood Test',
    'Urine Test',
    'X-Ray',
    'CT Scan',
    'MRI',
    'Ultrasound',
    'ECG',
    'EEG',
  ];

  useEffect(() => {
    // Load patients and lab tests from localStorage
    const loadedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    const loadedTests = JSON.parse(localStorage.getItem('labTests') || '[]');
    setPatients(loadedPatients);
    setLabTests(loadedTests);
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toString().includes(searchTerm)
  );

  const patientTests = labTests.filter(
    test => test.patientId === selectedPatient?.id
  );

  const handleNewTest = () => {
    if (!selectedPatient) return;

    const test = {
      id: Date.now(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: JSON.parse(localStorage.getItem('currentDoctor')).id,
      doctorName: JSON.parse(localStorage.getItem('currentDoctor')).name,
      ...newTest,
      orderDate: new Date().toISOString(),
      status: 'pending',
      results: null,
    };

    const updatedTests = [...labTests, test];
    setLabTests(updatedTests);
    localStorage.setItem('labTests', JSON.stringify(updatedTests));
    setShowNewTestModal(false);
    setNewTest({
      testName: '',
      type: '',
      urgency: 'normal',
      notes: '',
    });
  };

  const handleStatusChange = (testId, newStatus) => {
    const updatedTests = labTests.map(test =>
      test.id === testId
        ? { ...test, status: newStatus }
        : test
    );
    setLabTests(updatedTests);
    localStorage.setItem('labTests', JSON.stringify(updatedTests));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Lab Test Management</h2>
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

        {/* Lab Tests List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">
                {selectedPatient ? `${selectedPatient.name}'s Lab Tests` : 'Select a patient'}
              </h3>
              {selectedPatient && (
                <button
                  onClick={() => setShowNewTestModal(true)}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Order New Test
                </button>
              )}
            </div>
            <div className="p-4">
              {!selectedPatient ? (
                <p className="text-center text-gray-500">Select a patient to view lab tests</p>
              ) : patientTests.length === 0 ? (
                <p className="text-center text-gray-500">No lab tests found</p>
              ) : (
                <div className="space-y-4">
                  {patientTests.map(test => (
                    <div
                      key={test.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{test.testName}</h4>
                          <p className="text-sm text-gray-500">
                            Type: {test.type} | Urgency: {test.urgency}
                          </p>
                        </div>
                        <select
                          value={test.status}
                          onChange={(e) => handleStatusChange(test.id, e.target.value)}
                          className="text-sm border rounded p-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="text-sm">
                        {test.notes && (
                          <p><span className="text-gray-500">Notes:</span> {test.notes}</p>
                        )}
                        {test.results && (
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <p className="font-medium">Results:</p>
                            <p>{test.results}</p>
                          </div>
                        )}
                        <p className="text-gray-500 mt-2">
                          Ordered on {new Date(test.orderDate).toLocaleDateString()}
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

      {/* New Test Modal */}
      {showNewTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Order New Lab Test</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Name
                </label>
                <input
                  type="text"
                  value={newTest.testName}
                  onChange={(e) =>
                    setNewTest({ ...newTest, testName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter test name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Type
                </label>
                <select
                  value={newTest.type}
                  onChange={(e) =>
                    setNewTest({ ...newTest, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select type</option>
                  {TEST_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency
                </label>
                <select
                  value={newTest.urgency}
                  onChange={(e) =>
                    setNewTest({ ...newTest, urgency: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newTest.notes}
                  onChange={(e) =>
                    setNewTest({ ...newTest, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleNewTest}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Order Test
                </button>
                <button
                  onClick={() => setShowNewTestModal(false)}
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

export default LabManagement; 