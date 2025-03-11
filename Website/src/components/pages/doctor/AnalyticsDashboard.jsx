import { useState, useEffect } from 'react';

const AnalyticsDashboard = () => {
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  useEffect(() => {
    // Load data from localStorage
    const doctor = JSON.parse(localStorage.getItem('currentDoctor'));
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const allPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    const allLabTests = JSON.parse(localStorage.getItem('labTests') || '[]');
    const allPatients = JSON.parse(localStorage.getItem('patients') || '[]');

    setCurrentDoctor(doctor);
    setAppointments(allAppointments.filter(app => app.doctorId === doctor.id));
    setPrescriptions(allPrescriptions.filter(pres => pres.doctorId === doctor.id));
    setLabTests(allLabTests.filter(test => test.doctorId === doctor.id));
    setPatients(allPatients);
  }, []);

  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 7);
    }
    
    return { start, end: now };
  };

  const filterByDateRange = (items) => {
    const { start, end } = getDateRange();
    return items.filter(item => {
      const date = new Date(item.date || item.createdAt || item.orderDate);
      return date >= start && date <= end;
    });
  };

  const getStatistics = () => {
    const filteredAppointments = filterByDateRange(appointments);
    const filteredPrescriptions = filterByDateRange(prescriptions);
    const filteredLabTests = filterByDateRange(labTests);

    const completedAppointments = filteredAppointments.filter(app => app.status === 'completed');
    const uniquePatients = [...new Set(filteredAppointments.map(app => app.patientId))];

    return {
      totalAppointments: filteredAppointments.length,
      completedAppointments: completedAppointments.length,
      appointmentCompletionRate: completedAppointments.length > 0
        ? ((completedAppointments.length / filteredAppointments.length) * 100).toFixed(1)
        : 0,
      uniquePatients: uniquePatients.length,
      prescriptions: filteredPrescriptions.length,
      labTests: filteredLabTests.length,
      averageAppointmentsPerDay: filteredAppointments.length > 0
        ? (filteredAppointments.length / (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365)).toFixed(1)
        : 0,
    };
  };

  const getAppointmentsByStatus = () => {
    const filteredAppointments = filterByDateRange(appointments);
    const status = {
      pending: 0,
      completed: 0,
      cancelled: 0,
    };

    filteredAppointments.forEach(app => {
      status[app.status] = (status[app.status] || 0) + 1;
    });

    return status;
  };

  const getCommonDiagnoses = () => {
    const filteredAppointments = filterByDateRange(appointments);
    const diagnoses = {};

    filteredAppointments.forEach(app => {
      if (app.diagnosis) {
        diagnoses[app.diagnosis] = (diagnoses[app.diagnosis] || 0) + 1;
      }
    });

    return Object.entries(diagnoses)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const stats = getStatistics();
  const appointmentStatus = getAppointmentsByStatus();
  const commonDiagnoses = getCommonDiagnoses();

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Total Appointments</h3>
          <p className="text-3xl font-bold">{stats.totalAppointments}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.averageAppointmentsPerDay} per day
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Completion Rate</h3>
          <p className="text-3xl font-bold">{stats.appointmentCompletionRate}%</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.completedAppointments} completed
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Unique Patients</h3>
          <p className="text-3xl font-bold">{stats.uniquePatients}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Prescriptions</h3>
          <p className="text-3xl font-bold">{stats.prescriptions}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.labTests} lab tests ordered
          </p>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointment Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Appointment Status</h3>
          <div className="space-y-4">
            {Object.entries(appointmentStatus).map(([status, count]) => (
              <div key={status} className="flex items-center">
                <div className="w-32 text-sm">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        status === 'completed'
                          ? 'bg-green-500'
                          : status === 'pending'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${(count / stats.totalAppointments) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right text-sm">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Diagnoses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Common Diagnoses</h3>
          <div className="space-y-4">
            {commonDiagnoses.map(([diagnosis, count]) => (
              <div key={diagnosis} className="flex items-center">
                <div className="flex-1 text-sm">{diagnosis}</div>
                <div className="w-16 text-right text-sm">{count} cases</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 