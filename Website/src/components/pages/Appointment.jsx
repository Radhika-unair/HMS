import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import RelatedDoctors from "../RelatedDoctors";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  // Fetch doctor info
  useEffect(() => {
    const fetchDocInfo = () => {
      const doc = doctors.find((doc) => doc._id === docId);
      if (doc) setDocInfo(doc);
    };
    fetchDocInfo();
  }, [doctors, docId]);

  // Generate available time slots
  useEffect(() => {
    if (!docInfo) return;

    const getAvailableSlots = () => {
      let today = new Date();
      let slots = [];

      for (let i = 0; i < 7; i++) {
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        let startTime = new Date(currentDate);
        let endTime = new Date(currentDate);
        endTime.setHours(21, 0, 0, 0); // End time is 9 PM

        // Special handling for today
        if (i === 0) {
          let now = new Date();
          let nextMinutes = now.getMinutes() + (30 - (now.getMinutes() % 30));
          now.setMinutes(nextMinutes, 0, 0);
          startTime = new Date(now);
        } else {
          startTime.setHours(10, 0, 0, 0); // Other days start at 10 AM
        }

        let timeSlots = [];
        while (startTime < endTime) {
          timeSlots.push({
            datetime: new Date(startTime),
            time: startTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true, // Ensures AM/PM format
            }),
          });
          startTime.setMinutes(startTime.getMinutes() + 30);
        }

        slots.push(timeSlots);
      }

      setDocSlots(slots);
    };

    getAvailableSlots();
  }, [docInfo]);

  return (
    docInfo &&
    docSlots.length > 0 && (
      <div>
        {/*--------------------- Doctor Details -----------------------*/}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt=""
            />
          </div>

          <div className="flex-1 border border-x-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            {/* Doctor Info */}
            <p className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              {docInfo.name}{" "}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div>
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {docInfo.experience}
              </button>
            </div>

            {/* Doctor About Section */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/*-------------------- Booking Slots ----------*/}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking Slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.map((item, index) => {
              let currentDate = new Date();
              currentDate.setDate(currentDate.getDate() + index);

              return (
                <div
                  onClick={() => setSlotIndex(index)}
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                    slotIndex === index
                      ? "bg-primary text-white"
                      : "border border-gray-200"
                  }`}
                  key={index}
                >
                  <p className="text-xs font-semibold">
                    {daysOfWeek[currentDate.getDay()]}
                  </p>
                  <p className="text-sm">{currentDate.getDate()}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
            {docSlots[slotIndex]?.length > 0 ? (
              docSlots[slotIndex].map((item, index) => (
                <p
                  onClick={() => setSlotTime(item.time)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 cursor-pointer ${
                    item.time === slotTime
                      ? "bg-primary text-white"
                      : "text-gray-400 border rounded-full border-gray-300"
                  }`}
                  key={index}
                >
                  {item.time}
                </p>
              ))
            ) : (
              <p className="text-gray-500">No slots available</p>
            )}
          </div>
          <button className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6">
            Book an Appointment
          </button>
        </div>

        {/* Listing Related Doctors */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;
