import { useState, useEffect } from 'react';

const TreatmentPlans = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    duration: '',
    milestones: [{ title: '', targetDate: '', status: 'pending' }],
    medications: [{ name: '', dosage: '', frequency: '' }],
    followUpDate: '',
    notes: '',
  });

  useEffect(() => {
    // Load patients and treatment plans from localStorage
    const loadedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    const loadedPlans = JSON.parse(localStorage.getItem('treatmentPlans') || '[]');
    setPatients(loadedPatients);
    setTreatmentPlans(loadedPlans);
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toString().includes(searchTerm)
  );

  const patientPlans = treatmentPlans.filter(
    plan => plan.patientId === selectedPatient?.id
  );

  const handleAddMilestone = () => {
    setNewPlan({
      ...newPlan,
      milestones: [
        ...newPlan.milestones,
        { title: '', targetDate: '', status: 'pending' }
      ],
    });
  };

  const handleAddMedication = () => {
    setNewPlan({
      ...newPlan,
      medications: [
        ...newPlan.medications,
        { name: '', dosage: '', frequency: '' }
      ],
    });
  };

  const handleNewPlan = () => {
    if (!selectedPatient) return;

    const plan = {
      id: Date.now(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: JSON.parse(localStorage.getItem('currentDoctor')).id,
      doctorName: JSON.parse(localStorage.getItem('currentDoctor')).name,
      ...newPlan,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const updatedPlans = [...treatmentPlans, plan];
    setTreatmentPlans(updatedPlans);
    localStorage.setItem('treatmentPlans', JSON.stringify(updatedPlans));
    setShowNewPlanModal(false);
    setNewPlan({
      title: '',
      description: '',
      duration: '',
      milestones: [{ title: '', targetDate: '', status: 'pending' }],
      medications: [{ name: '', dosage: '', frequency: '' }],
      followUpDate: '',
      notes: '',
    });
  };

  const handleMilestoneStatusChange = (planId, milestoneIndex, newStatus) => {
    const updatedPlans = treatmentPlans.map(plan =>
      plan.id === planId
        ? {
            ...plan,
            milestones: plan.milestones.map((milestone, index) =>
              index === milestoneIndex
                ? { ...milestone, status: newStatus }
                : milestone
            ),
          }
        : plan
    );
    setTreatmentPlans(updatedPlans);
    localStorage.setItem('treatmentPlans', JSON.stringify(updatedPlans));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Treatment Plans</h2>
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

        {/* Treatment Plans List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">
                {selectedPatient ? `${selectedPatient.name}'s Treatment Plans` : 'Select a patient'}
              </h3>
              {selectedPatient && (
                <button
                  onClick={() => setShowNewPlanModal(true)}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  New Treatment Plan
                </button>
              )}
            </div>
            <div className="p-4">
              {!selectedPatient ? (
                <p className="text-center text-gray-500">Select a patient to view treatment plans</p>
              ) : patientPlans.length === 0 ? (
                <p className="text-center text-gray-500">No treatment plans found</p>
              ) : (
                <div className="space-y-6">
                  {patientPlans.map(plan => (
                    <div
                      key={plan.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="mb-4">
                        <h4 className="text-lg font-medium">{plan.title}</h4>
                        <p className="text-gray-600">{plan.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="font-medium mb-2">Milestones</h5>
                          <div className="space-y-2">
                            {plan.milestones.map((milestone, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-gray-50 p-2 rounded"
                              >
                                <div>
                                  <div className="font-medium">{milestone.title}</div>
                                  <div className="text-sm text-gray-500">
                                    Target: {milestone.targetDate}
                                  </div>
                                </div>
                                <select
                                  value={milestone.status}
                                  onChange={(e) =>
                                    handleMilestoneStatusChange(plan.id, index, e.target.value)
                                  }
                                  className="text-sm border rounded p-1"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Medications</h5>
                          <div className="space-y-2">
                            {plan.medications.map((medication, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-2 rounded"
                              >
                                <div className="font-medium">{medication.name}</div>
                                <div className="text-sm text-gray-500">
                                  {medication.dosage} - {medication.frequency}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        <p>Duration: {plan.duration}</p>
                        <p>Follow-up: {plan.followUpDate}</p>
                        {plan.notes && <p>Notes: {plan.notes}</p>}
                        <p className="mt-2">
                          Created on {new Date(plan.createdAt).toLocaleDateString()}
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

      {/* New Plan Modal */}
      {showNewPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">New Treatment Plan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newPlan.title}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Treatment plan title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                  placeholder="Describe the treatment plan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={newPlan.duration}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, duration: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., 3 months"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Milestones
                  </label>
                  <button
                    onClick={handleAddMilestone}
                    className="text-sm text-primary hover:text-primary/90"
                  >
                    + Add Milestone
                  </button>
                </div>
                <div className="space-y-2">
                  {newPlan.milestones.map((milestone, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => {
                          const updatedMilestones = [...newPlan.milestones];
                          updatedMilestones[index].title = e.target.value;
                          setNewPlan({ ...newPlan, milestones: updatedMilestones });
                        }}
                        className="flex-1 px-3 py-2 border rounded-md"
                        placeholder="Milestone title"
                      />
                      <input
                        type="date"
                        value={milestone.targetDate}
                        onChange={(e) => {
                          const updatedMilestones = [...newPlan.milestones];
                          updatedMilestones[index].targetDate = e.target.value;
                          setNewPlan({ ...newPlan, milestones: updatedMilestones });
                        }}
                        className="px-3 py-2 border rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Medications
                  </label>
                  <button
                    onClick={handleAddMedication}
                    className="text-sm text-primary hover:text-primary/90"
                  >
                    + Add Medication
                  </button>
                </div>
                <div className="space-y-2">
                  {newPlan.medications.map((medication, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => {
                          const updatedMedications = [...newPlan.medications];
                          updatedMedications[index].name = e.target.value;
                          setNewPlan({ ...newPlan, medications: updatedMedications });
                        }}
                        className="px-3 py-2 border rounded-md"
                        placeholder="Medication name"
                      />
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => {
                          const updatedMedications = [...newPlan.medications];
                          updatedMedications[index].dosage = e.target.value;
                          setNewPlan({ ...newPlan, medications: updatedMedications });
                        }}
                        className="px-3 py-2 border rounded-md"
                        placeholder="Dosage"
                      />
                      <input
                        type="text"
                        value={medication.frequency}
                        onChange={(e) => {
                          const updatedMedications = [...newPlan.medications];
                          updatedMedications[index].frequency = e.target.value;
                          setNewPlan({ ...newPlan, medications: updatedMedications });
                        }}
                        className="px-3 py-2 border rounded-md"
                        placeholder="Frequency"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={newPlan.followUpDate}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, followUpDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newPlan.notes}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleNewPlan}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Create Plan
                </button>
                <button
                  onClick={() => setShowNewPlanModal(false)}
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

export default TreatmentPlans; 