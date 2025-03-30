import { useState, useEffect } from 'react';
import { BASE_URL } from "../../../url_config";

const ScheduleManagement = () => {
  const [blockoutDates, setBlockoutDates] = useState([]);
  const [popupMessage, setPopupMessage] = useState(null);
  const [confirmationDate, setConfirmationDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlockoutDates = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentDoctor = JSON.parse(localStorage.getItem('currentDoctor'));
        if (!currentDoctor?.id) throw new Error("Doctor not found");

        const response = await fetch(`${BASE_URL}/doc/fetch/blockdate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify({ doctorId: currentDoctor.id })
        });

        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        const data_full = await response.json();
        const blockedDates = data_full.result.map(dateStr => new Date(dateStr));

        setBlockoutDates(blockedDates);
        localStorage.setItem('blockoutDates', JSON.stringify(blockedDates));
      } catch (err) {
        setError(err.message);
        const cachedDates = JSON.parse(localStorage.getItem('blockoutDates') || '[]');
        setBlockoutDates(cachedDates.map(date => new Date(date)));
      } finally {
        setLoading(false);
      }
    };
    fetchBlockoutDates();
  }, []);

  const formatDate = date => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  const generateFutureDays = () => Array.from({ length: 60 }, (_, i) => addDays(new Date(), i));
  const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();
  const isDateBlocked = date => blockoutDates.some(blocked => isSameDay(blocked, date));

  const handleBlockDate = async () => {
    if (!confirmationDate || isDateBlocked(confirmationDate)) return;
    try {
      const currentDoctor = JSON.parse(localStorage.getItem('currentDoctor'));
      if (!currentDoctor?.id) throw new Error("Doctor not found");

      const response = await fetch(`${BASE_URL}/doc/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ doctorId: currentDoctor.id, date: confirmationDate.toISOString().split('T')[0] })
      });

      if (!response.ok) throw new Error(`Failed to block: ${response.status}`);
      setBlockoutDates(prev => [...prev, confirmationDate]);
      localStorage.setItem('blockoutDates', JSON.stringify([...blockoutDates, confirmationDate]));
      setPopupMessage(`Date Blocked: ${formatDate(confirmationDate)}`);
    } catch (error) {
      setPopupMessage(`Error: ${error.message}`);
    }
    setTimeout(() => setPopupMessage(null), 3000);
    setConfirmationDate(null);
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Schedule Management</h2>
      <div className="grid grid-cols-7 gap-2 overflow-x-auto p-4 border rounded-lg bg-gray-100" style={{ maxHeight: '500px' }}>
        {generateFutureDays().map((day, index) => (
          <div key={index} className="p-4 text-center border rounded-lg bg-white shadow-sm">
            <div className="text-lg font-semibold">{formatDate(day).split(',')[0]}</div>
            <div className="text-gray-600 text-sm">{formatDate(day).split(',')[1]}</div>
            <button
              onClick={() => setConfirmationDate(day)}
              className={`mt-2 px-3 py-1 text-sm rounded-lg shadow-sm ${isDateBlocked(day) ? 'bg-gray-400' : 'bg-blue-500 text-white'}`}
            >
              {isDateBlocked(day) ? 'Blocked' : 'Block Date'}
            </button>
          </div>
        ))}
      </div>
      {confirmationDate && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Confirm Blocking Date</h3>
            <p className="text-gray-700 mt-2">Block <strong>{formatDate(confirmationDate)}</strong>?</p>
            <div className="flex justify-end mt-4 space-x-3">
              <button onClick={() => setConfirmationDate(null)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
              <button onClick={handleBlockDate} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Block</button>
            </div>
          </div>
        </div>
      )}
      {popupMessage && <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow">{popupMessage}</div>}
    </div>
  );
};

export default ScheduleManagement;