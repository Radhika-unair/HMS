import { useState, useEffect } from 'react';

const ScheduleManagement = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [blockoutDates, setBlockoutDates] = useState([]);

  const WORKING_HOURS = {
    start: 9, // 9 AM
    end: 17, // 5 PM
  };

  useEffect(() => {
    // Load appointments and blockout dates from localStorage
    const loadedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const loadedBlockouts = JSON.parse(localStorage.getItem('blockoutDates') || '[]');
    setAppointments(loadedAppointments);
    setBlockoutDates(loadedBlockouts.map(date => new Date(date)));
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const addDays = (date, days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  const generateTimeSlots = (date) => {
    const slots = [];
    const baseDate = new Date(date);
    baseDate.setHours(WORKING_HOURS.start, 0, 0, 0);
    
    for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
      const slotDate = new Date(baseDate);
      slotDate.setHours(hour);
      slots.push(slotDate);
    }
    
    return slots;
  };

  const generateWeekDays = () => {
    const weekStart = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const handleSlotClick = (date) => {
    setSelectedSlot(date);
    setShowModal(true);
  };

  const handleBlockDate = (date) => {
    const newBlockouts = [...blockoutDates, date];
    setBlockoutDates(newBlockouts);
    localStorage.setItem('blockoutDates', JSON.stringify(newBlockouts));
  };

  const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isSlotBooked = (slot) => {
    return appointments.some(app => 
      isSameDay(new Date(app.date), slot) && 
      new Date(app.date).getHours() === slot.getHours()
    );
  };

  const isDateBlocked = (date) => {
    return blockoutDates.some(blocked => isSameDay(new Date(blocked), date));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Schedule Management</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Today
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="px-3 py-1 rounded-md hover:bg-gray-100"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="px-3 py-1 rounded-md hover:bg-gray-100"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 text-sm font-medium text-gray-500">Time</div>
          {generateWeekDays().map(day => (
            <div key={day.toString()} className="p-4 text-center border-l">
              <div className="font-medium">{formatDate(day).split(',')[0]}</div>
              <div className="text-sm text-gray-500">{formatDate(day).split(',')[1]}</div>
            </div>
          ))}
        </div>

        <div className="divide-y">
          {generateTimeSlots(currentDate).map(timeSlot => (
            <div key={timeSlot.toString()} className="grid grid-cols-8">
              <div className="p-4 text-sm text-gray-500">
                {formatTime(timeSlot)}
              </div>
              {generateWeekDays().map(day => {
                const slotDate = new Date(day);
                slotDate.setHours(timeSlot.getHours());
                const isBooked = isSlotBooked(slotDate);
                const isBlocked = isDateBlocked(slotDate);

                return (
                  <div
                    key={slotDate.toString()}
                    className={`p-2 border-l relative ${
                      isBooked
                        ? 'bg-blue-50'
                        : isBlocked
                        ? 'bg-gray-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {isBooked && (
                      <div className="text-xs p-1 bg-blue-100 rounded">
                        Booked
                      </div>
                    )}
                    {isBlocked && (
                      <div className="text-xs p-1 bg-gray-200 rounded">
                        Blocked
                      </div>
                    )}
                    {!isBooked && !isBlocked && (
                      <button
                        onClick={() => handleSlotClick(slotDate)}
                        className="absolute inset-0 w-full h-full"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Block Out Dates Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Manage Availability</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Blocked Dates</h4>
            <div className="flex flex-wrap gap-2">
              {blockoutDates.map(date => (
                <div
                  key={date.toString()}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {formatDate(date)}
                  <button
                    onClick={() => {
                      const newBlockouts = blockoutDates.filter(
                        d => !isSameDay(new Date(d), new Date(date))
                      );
                      setBlockoutDates(newBlockouts);
                      localStorage.setItem('blockoutDates', JSON.stringify(newBlockouts));
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              Schedule for {formatDate(selectedSlot)} {formatTime(selectedSlot)}
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => handleBlockDate(selectedSlot)}
                className="w-full px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Block This Time
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement; 