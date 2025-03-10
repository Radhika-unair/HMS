import { useState, useEffect } from "react";

const BedStatus = () => {
  const [beds, setBeds] = useState([]);

  useEffect(() => {
    // Get beds data from localStorage
    const bedsData = JSON.parse(localStorage.getItem("beds") || "[]");
    setBeds(bedsData);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Hospital Bed Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beds.map((bed) => (
          <div
            key={bed.id}
            className={`p-4 rounded-lg shadow-md ${
              bed.status === "occupied"
                ? "bg-red-50 border border-red-200"
                : bed.status === "reserved"
                ? "bg-yellow-50 border border-yellow-200"
                : "bg-green-50 border border-green-200"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl font-bold mb-2">{bed.bedNumber}</div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  bed.status === "occupied"
                    ? "bg-red-100 text-red-800"
                    : bed.status === "reserved"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {bed.status === "occupied"
                  ? "Occupied"
                  : bed.status === "reserved"
                  ? "Reserved"
                  : "Available"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BedStatus; 