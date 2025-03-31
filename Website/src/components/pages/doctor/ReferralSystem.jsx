import { useState, useEffect } from "react";
import { BASE_URL } from "../../../url_config";


const ReferralSystem = () => {
  // Doctor Search State
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState(null);

  // Appointment Search State
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Referral State
  const [referralDescription, setReferralDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // Fetch Doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${BASE_URL}/asset/doctors`);
        if (!response.ok) throw new Error('Failed to fetch doctors');
        const data = await response.json();
        setDoctors(data.doctors || data);
        setDoctorError(null);
        console.log(data);
      } catch (err) {
        setDoctorError(err.message);
      } finally {
        setDoctorLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Load Appointments from localStorage
  useEffect(() => {
    const storedAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    setAppointments(storedAppointments);
  }, []);

  // Filter Doctors
  const filteredDoctors = doctors.filter(doctor =>
    (doctor.name?.toLowerCase() || '').includes(doctorSearch.toLowerCase())
  );

  // Filter Appointments
  const filteredAppointments = appointments.filter(appointment =>
    (appointment["Patient Name"]?.toLowerCase() || '').includes(appointmentSearch.toLowerCase())
  );

  // Handle selection clearing
  const handleClearSelection = (type) => {
    if (type === 'doctor') {
      setSelectedDoctor(null);
      setDoctorSearch("");
    } else {
      setSelectedAppointment(null);
      setAppointmentSearch("");
    }
  };

  // Handle referral submission
  const handleSubmitReferral = async () => {
    if (!selectedDoctor || !selectedAppointment) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const response = await fetch(`${BASE_URL}/referrals/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctor_id: selectedDoctor._id,
          app_id: selectedAppointment.app_id,
          patient_id: selectedAppointment.patient_id,
          currentdoc : (JSON.parse(localStorage.getItem("currentDoctor")))["id"],
          app_id : selectedAppointment.app_id,
          description: referralDescription
        })
      });

      if (!response.ok) throw new Error('Referral submission failed');
      if(!response.status==="Fail") throw new Error("Referral submission failed");

      // Clear selections on success
      setSelectedDoctor(null);
      setSelectedAppointment(null);
      setReferralDescription("");
    } catch (error) {
      setSubmissionError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancellation
  const handleCancelReferral = () => {
    setSelectedDoctor(null);
    setSelectedAppointment(null);
    setReferralDescription("");
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-8">
      {/* Doctor Search Section */}
      {!selectedDoctor && (
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search doctor by name"
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <div className="absolute right-3 top-3.5 text-sm text-gray-500">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? "match" : "matches"}
            </div>
          </div>

          {doctorSearch && filteredDoctors.length > 0 && (
            <div className="mt-2 border rounded-lg shadow-lg bg-white">
              <div className="p-4 relative">
                <button
                  onClick={() => setDoctorSearch("")}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
                <div className="max-h-60 overflow-y-auto">
                  {filteredDoctors.map((doctor) => (
                    <div 
                      key={doctor._id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{doctor.name}</h3>
                          <p className="text-sm text-gray-600">{doctor.speciality}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          ID: {doctor._id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Appointment Search Section */}
      {!selectedAppointment && (
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search appointments by patient name"
              value={appointmentSearch}
              onChange={(e) => setAppointmentSearch(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <div className="absolute right-3 top-3.5 text-sm text-gray-500">
              {filteredAppointments.length} {filteredAppointments.length === 1 ? "match" : "matches"}
            </div>
          </div>

          {appointmentSearch && filteredAppointments.length > 0 && (
            <div className="mt-2 border rounded-lg shadow-lg bg-white">
              <div className="p-4 relative">
                <button
                  onClick={() => setAppointmentSearch("")}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
                <div className="max-h-60 overflow-y-auto">
                  {filteredAppointments.map((appointment) => (
                    <div 
                      key={appointment.app_id}
                      onClick={() => setSelectedAppointment(appointment)}
                      className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{appointment["Patient Name"]}</h3>
                          <p className="bg-green-100 text-green-800  rounded-full">
                            ID : {appointment["app_id"]}
                          </p>
                          <p className="text-sm text-gray-600">
                            {appointment["Appointment Date"]} at {appointment["Appointment Time"]}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          appointment.Status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        }`}>
                          {appointment.Status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Items Display */}
      <div className="space-y-4">
        {selectedDoctor && (
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Selected Doctor: {selectedDoctor.name}</h3>
                <p className="text-sm">Specialty: {selectedDoctor.specialty}</p>
                <p className="text-sm">ID: {selectedDoctor._id}</p>
              </div>
              <button
                onClick={() => handleClearSelection('doctor')}
                className="text-blue-500 hover:text-blue-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {selectedAppointment && (
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Selected Patient: {selectedAppointment["Patient Name"]}</h3>
                <p className="text-sm">
                  ID : {selectedAppointment["app_id"]}
                </p>
                <p className="text-sm">
                  {selectedAppointment["Appointment Date"]} at {selectedAppointment["Appointment Time"]}
                </p>
                <p className="text-sm">Status: {selectedAppointment.Status}</p>
              </div>
              <button
                onClick={() => handleClearSelection('appointment')}
                className="text-blue-500 hover:text-blue-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Referral Form */}
      {selectedDoctor && selectedAppointment && (
        <div className="mt-6 p-4 border rounded-lg bg-white shadow-md">
          <h3 className="text-lg font-semibold mb-4">Create Referral Note</h3>
          
          <textarea
            value={referralDescription}
            onChange={(e) => setReferralDescription(e.target.value)}
            placeholder="Enter referral description..."
            className="w-full p-3 border rounded-lg mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />

          {submissionError && (
            <div className="text-red-500 mb-2">{submissionError}</div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancelReferral}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReferral}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Referral'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralSystem;