import { useState, useEffect } from 'react';

const Telemedicine = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [showConsultation, setShowConsultation] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(false);

  useEffect(() => {
    // Load doctor and appointments from localStorage
    const doctor = JSON.parse(localStorage.getItem('currentDoctor'));
    const loadedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]')
      .filter(app => app.doctorId === doctor.id && app.type === 'video');
    
    setCurrentDoctor(doctor);
    setAppointments(loadedAppointments);
  }, []);

  const handleStartConsultation = (appointment) => {
    setSelectedAppointment(appointment);
    setShowConsultation(true);
    setIsVideoOn(true);
  };

  const handleEndConsultation = () => {
    if (consultationNotes.trim()) {
      const updatedAppointments = appointments.map(app =>
        app.id === selectedAppointment.id
          ? { ...app, status: 'completed', notes: consultationNotes }
          : app
      );
      setAppointments(updatedAppointments);
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    }
    setShowConsultation(false);
    setSelectedAppointment(null);
    setConsultationNotes('');
    setIsVideoOn(false);
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(app => app.date === today);
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(app => app.date > today);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Telemedicine</h2>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-700">Today's Video Consultations</h3>
          </div>
          <div className="p-4">
            {getTodayAppointments().length === 0 ? (
              <p className="text-center text-gray-500">No consultations scheduled for today</p>
            ) : (
              <div className="space-y-4">
                {getTodayAppointments().map(appointment => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{appointment.patientName}</h4>
                        <p className="text-sm text-gray-500">
                          Time: {appointment.time}
                        </p>
                      </div>
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => handleStartConsultation(appointment)}
                          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                        >
                          Start Consultation
                        </button>
                      )}
                      {appointment.status === 'completed' && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-700">Upcoming Consultations</h3>
          </div>
          <div className="p-4">
            {getUpcomingAppointments().length === 0 ? (
              <p className="text-center text-gray-500">No upcoming consultations</p>
            ) : (
              <div className="space-y-4">
                {getUpcomingAppointments().map(appointment => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{appointment.patientName}</h4>
                        <p className="text-sm text-gray-500">
                          Date: {new Date(appointment.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Time: {appointment.time}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        Scheduled
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      {showConsultation && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[1000px] max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">
                Consultation with {selectedAppointment.patientName}
              </h3>
              <button
                onClick={handleEndConsultation}
                className="text-red-500 hover:text-red-700"
              >
                End Consultation
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 p-4">
              {/* Video Streams */}
              <div className="col-span-2 space-y-4">
                {/* Main Video Stream */}
                <div className="bg-gray-900 rounded-lg aspect-video relative">
                  {isVideoOn ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white">Video Stream</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                      Video Off
                    </div>
                  )}
                </div>
                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-3 rounded-full ${
                      isVideoOn ? 'bg-gray-200' : 'bg-red-500 text-white'
                    }`}
                  >
                    {isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
                  </button>
                </div>
              </div>

              {/* Consultation Notes */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Consultation Notes</h4>
                  <textarea
                    value={consultationNotes}
                    onChange={(e) => setConsultationNotes(e.target.value)}
                    className="w-full h-[400px] p-3 border rounded-md"
                    placeholder="Enter consultation notes..."
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Patient Information</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><span className="text-gray-500">Name:</span> {selectedAppointment.patientName}</p>
                    <p><span className="text-gray-500">Time:</span> {selectedAppointment.time}</p>
                    {selectedAppointment.symptoms && (
                      <p><span className="text-gray-500">Symptoms:</span> {selectedAppointment.symptoms}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Telemedicine; 