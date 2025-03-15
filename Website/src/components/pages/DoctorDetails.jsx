import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../url_config";

const specializations = [
  "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", 
  "Neurology", "Oncology", "Orthopedics", "Pediatrics", "Psychiatry",
  "Radiology", "Urology", "General Medicine"
];

const DoctorDetails = () => {
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [degree, setDegree] = useState("");
  const [experience, setExperience] = useState("");
  const [fees, setFees] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const doctor = JSON.parse(localStorage.getItem("currentDoctor"));
    if (!doctor) {
      navigate("/login");
      return;
    }
    setCurrentDoctor(doctor);
  }, [navigate]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");

    if (!currentDoctor) {
      setError("Please log in again.");
      navigate("/login");
      return;
    }

    if (!degree || !experience || !fees || !speciality || !phoneNumber || !addressLine1 || !bio) {
      setError("Please fill in all required fields.");
      return;
    }

    // Convert experience and fees to integers
    const parsedExperience = parseInt(experience, 10);
    const parsedFees = parseInt(fees, 10);

    if (isNaN(parsedExperience) || isNaN(parsedFees)) {
      setError("Experience and Fees must be valid numbers.");
      return;
    }

    // Validate phone number (should be 10 digits)
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    const doctorData = {
      userId: currentDoctor.id, 
      usertype: currentDoctor.type,
      degree,
      experience: parsedExperience,
      fees: parsedFees,
      speciality,
      phone_number: phoneNumber,
      address_line1: addressLine1,
      address_line2: addressLine2,
      bio,
    };

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/detail/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doctorData),
      });

      const data = await response.json();
      setLoading(false);

      if (data.status) {
        // Update the doctor details in localStorage
        const updatedDoctor = {
          ...currentDoctor,
          ...doctorData,
          detailsCompleted: true
        };
        localStorage.setItem("currentDoctor", JSON.stringify(updatedDoctor));

        // Update in doctors array
        const doctors = JSON.parse(localStorage.getItem("doctors") || "[]");
        const updatedDoctors = doctors.map(doc => 
          doc.id === currentDoctor.id ? updatedDoctor : doc
        );
        localStorage.setItem("doctors", JSON.stringify(updatedDoctors));

        navigate("/doctor/dashboard");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setLoading(false);
      setError("An error occurred. Please check your network and try again.");
    }
  };

  if (!currentDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <form className="min-h-[80vh] flex items-center" onSubmit={onSubmitHandler}>
      <div className="flex flex-col gap-3 m-auto p-8 border rounded-xl shadow-lg w-full max-w-md">
        <p className="text-2xl font-semibold">Doctor Additional Details</p>
        {error && <p className="text-red-500">{error}</p>}

        <input 
          type="text" 
          placeholder="Degree" 
          value={degree} 
          onChange={(e) => setDegree(e.target.value)} 
          className="border p-2 rounded"
          required
        />

        <input 
          type="number" 
          placeholder="Experience (years)" 
          value={experience} 
          onChange={(e) => setExperience(e.target.value)} 
          className="border p-2 rounded"
          required
        />

        <input 
          type="number" 
          placeholder="Consultation Fees" 
          value={fees} 
          onChange={(e) => setFees(e.target.value)} 
          className="border p-2 rounded"
          required
        />

        <select 
          value={speciality} 
          onChange={(e) => setSpeciality(e.target.value)} 
          className="border p-2 rounded bg-white"
          required
        >
          <option value="">Select Speciality</option>
          {specializations.map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>

        <input 
          type="text" 
          placeholder="Phone Number" 
          value={phoneNumber} 
          onChange={(e) => setPhoneNumber(e.target.value)} 
          className="border p-2 rounded"
          required
        />

        <input 
          type="text" 
          placeholder="Address Line 1" 
          value={addressLine1} 
          onChange={(e) => setAddressLine1(e.target.value)} 
          className="border p-2 rounded"
          required
        />

        <input 
          type="text" 
          placeholder="Address Line 2 (Optional)" 
          value={addressLine2} 
          onChange={(e) => setAddressLine2(e.target.value)} 
          className="border p-2 rounded"
        />

        <textarea 
          placeholder="Write a short bio..." 
          value={bio} 
          onChange={(e) => setBio(e.target.value)} 
          className="border p-2 rounded h-24"
          required
        />

        <button 
          type="submit" 
          className="bg-primary text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Save & Proceed"}
        </button>
      </div>
    </form>
  );
};

export default DoctorDetails;
