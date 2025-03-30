import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BASE_URL } from '../../../url_config';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [appointments, setAppointments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/doc_dash`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "true"
          },
          body: JSON.stringify({
            id: JSON.parse(localStorage.getItem('currentDoctor')).id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        setAnalyticsData({
          status: data.status,
          totalAppointments: data["totalAppointments"],
          pending : data.pending,
          appointmentCompletionRate: data?.appointmentCompletionRate ?? 100,
          referAppointments: data.refer_appoint,
          prescriptions: data.Prescriptions,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      const currentDoctor = JSON.parse(localStorage.getItem('currentDoctor'));
    
      if (!currentDoctor || !currentDoctor.id) {
        setError("Doctor ID not found in localStorage");
        setLoading(false);
        return;
      }
    
      try {
        const response = await fetch(`${BASE_URL}/app/data?doctorId=${currentDoctor.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "true"
          }
        });
    
        if (!response.ok) {
          throw new Error('Failed to fetch appointments data');
        }
    
        const data = await response.json();
        console.log("API Response:", data.appointments); // Debugging
        
        
        const normalizedAppointments = [];
        data.appointments?.forEach(appt => {
             normalizedAppointments.push({
                patientName: appt?.["Patient Name"] ?? "Unknown",
                status: appt?.["Status"] ?? "Unknown",
                appointmentDate: appt?.["Appointment Date"] ?? "Unknown",
                appointmentTime: appt?.["Appointment Time"] ?? "Unknown",
              });
        });

          setAppointments(normalizedAppointments);
          localStorage.setItem("appointments", JSON.stringify(data.appointments));

        
      } catch (err) {
        console.error("❌ Error fetching appointments:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    
    fetchAppointments();
  }, []);
  console.log(analyticsData)
  if (loading) return <p>Loading analytics data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const pieData = [
    { name: 'Completed', value: analyticsData?.totalAppointments ? (analyticsData.totalAppointments - analyticsData.pending) : 0 },
    { name: 'Pending', value: analyticsData?.pending || 0 }
  ];
  
  
  const barData = [
    { name: 'Total', value: analyticsData.totalAppointments || 0 },
    { name: 'Referred', value: analyticsData.referAppointments || 0 },
    { name: 'Prescriptions', value: (analyticsData.totalAppointments - analyticsData.pending) || 0 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Total Appointments</h3>
          <p className="text-3xl font-bold">{analyticsData.totalAppointments}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Completion Rate</h3>
          <p className="text-3xl font-bold">{analyticsData.appointmentCompletionRate}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Refer Appointments</h3>
          <p className="text-3xl font-bold">{analyticsData.referAppointments}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Prescriptions</h3>
          <p className="text-3xl font-bold">{(analyticsData.totalAppointments - analyticsData.pending)}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Appointment Completion Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={100} label>
                <Cell fill="#4CAF50" />
                <Cell fill="#FFC107" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Appointments & Prescriptions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#007BFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Appointment list */}
      <div className='bg-white rounded-lg shadow p-6'>
  <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
  <table className="table-auto w-full border-collapse border border-gray-200">
    <thead>
      <tr className="bg-gray-100">
        <th className="border border-gray-300 px-4 py-2">Patient Name</th>
        <th className="border border-gray-300 px-4 py-2">Status</th>
        <th className="border border-gray-300 px-4 py-2">Date</th>
        <th className="border border-gray-300 px-4 py-2">Time</th>
      </tr>
    </thead>
    <tbody>
  {Array.isArray(appointments) && appointments.length > 0 ? (
    appointments.map((app, index) => (
      <tr key={index} className="text-center">
        <td className="border border-gray-300 px-4 py-2">{app.patientName}</td>
        <td className="border border-gray-300 px-4 py-2">{app.status}</td>
        <td className="border border-gray-300 px-4 py-2">{app.appointmentDate}</td>
        <td className="border border-gray-300 px-4 py-2">{app.appointmentTime}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="4" className="text-center border border-gray-300 px-4 py-2">No appointments found.</td>
    </tr>
  )}
</tbody>
  </table>
</div>
    
    </div>
    
  );
};

export default AnalyticsDashboard;