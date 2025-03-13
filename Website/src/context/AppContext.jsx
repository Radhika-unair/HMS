import { createContext, useState, useEffect } from "react";
import { fetchDoctors } from "../assets/assets";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);

  const currencySymbol = "₹";

  useEffect(() => {
    const fetchAndStoreDoctors = async () => {
      console.log("Fetching fresh doctors data...");
      const doctorsData = await fetchDoctors();
      setDoctors(doctorsData);
      sessionStorage.setItem("doctors", JSON.stringify(doctorsData));
    };

    fetchAndStoreDoctors(); // Always fetch fresh data on page reload
  }, []);

  return (
    <AppContext.Provider value={{ doctors, currencySymbol }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
