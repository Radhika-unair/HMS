import { useState, useEffect } from 'react';

const EmergencySystem = () => {
  const [onCallDoctors, setOnCallDoctors] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    priority: 'high',
    location: '',
  });

  useEffect(() => {
    // Load on-call doctors and emergency alerts from localStorage
    const loadedDoctors = JSON.parse(localStorage.getItem('doctors') || '[]')
      .filter(doctor => doctor.isOnCall);
    const loadedAlerts = JSON.parse(localStorage.getItem('emergencyAlerts') || '[]');
    
    setOnCallDoctors(loadedDoctors);
    setEmergencyAlerts(loadedAlerts);
  }, []);

  const handleNewAlert = () => {
    const alert = {
      id: Date.now(),
      ...newAlert,
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: JSON.parse(localStorage.getItem('currentDoctor')).name,
    };

    const updatedAlerts = [alert, ...emergencyAlerts];
    setEmergencyAlerts(updatedAlerts);
    localStorage.setItem('emergencyAlerts', JSON.stringify(updatedAlerts));
    setShowNewAlertModal(false);
    setNewAlert({
      title: '',
      description: '',
      priority: 'high',
      location: '',
    });
  };

  const handleAlertStatusChange = (alertId, newStatus) => {
    const updatedAlerts = emergencyAlerts.map(alert =>
      alert.id === alertId ? { ...alert, status: newStatus } : alert
    );
    setEmergencyAlerts(updatedAlerts);
    localStorage.setItem('emergencyAlerts', JSON.stringify(updatedAlerts));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Emergency System</h2>
        <button
          onClick={() => setShowNewAlertModal(true)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Create Emergency Alert
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* On-Call Doctors */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-700">On-Call Doctors</h3>
          </div>
          <div className="p-4">
            {onCallDoctors.length === 0 ? (
              <p className="text-center text-gray-500">No doctors currently on call</p>
            ) : (
              <div className="space-y-4">
                {onCallDoctors.map(doctor => (
                  <div key={doctor.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Dr. {doctor.name}</div>
                      <div className="text-sm text-gray-500">{doctor.specialty}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                        Call
                      </button>
                      <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Emergencies */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-700">Active Emergency Alerts</h3>
            </div>
            <div className="p-4">
              {emergencyAlerts.length === 0 ? (
                <p className="text-center text-gray-500">No active emergency alerts</p>
              ) : (
                <div className="space-y-4">
                  {emergencyAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`border rounded-lg p-4 ${
                        alert.priority === 'high'
                          ? 'border-red-200 bg-red-50'
                          : alert.priority === 'medium'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                        </div>
                        <select
                          value={alert.status}
                          onChange={(e) => handleAlertStatusChange(alert.id, e.target.value)}
                          className="text-sm border rounded p-1"
                        >
                          <option value="active">Active</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Location: {alert.location}</p>
                        <p>Created by: {alert.createdBy}</p>
                        <p>
                          {new Date(alert.createdAt).toLocaleString()}
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

      {/* New Alert Modal */}
      {showNewAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create Emergency Alert</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newAlert.title}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Emergency alert title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newAlert.description}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                  placeholder="Describe the emergency situation..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newAlert.priority}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newAlert.location}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Emergency location"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleNewAlert}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Create Alert
                </button>
                <button
                  onClick={() => setShowNewAlertModal(false)}
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

export default EmergencySystem; 