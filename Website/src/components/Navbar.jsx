import "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [userData, setUserData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const currentAdmin = localStorage.getItem("currentAdmin");
    const currentDoctor = localStorage.getItem("currentDoctor");

    console.log("Auth State:", {
      currentUser,
      currentAdmin,
      currentDoctor,
      isAuthenticated,
      isAdmin,
      isDoctor
    });

    if (currentAdmin) {
      setIsAdmin(true);
      setIsAuthenticated(true);
      setUserData(JSON.parse(currentAdmin));
    } else if (currentDoctor) {
      setIsDoctor(true);
      setIsAuthenticated(true);
      setUserData(JSON.parse(currentDoctor));
    } else if (currentUser) {
      setIsAuthenticated(true);
      setUserData(JSON.parse(currentUser));
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsDoctor(false);
      setUserData(null);
    }

    // Load referrals if user is a doctor
    if (currentDoctor) {
      const loadedReferrals = JSON.parse(localStorage.getItem("referrals") || "[]");
      setReferrals(loadedReferrals);
    }
  }, []);

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem("currentAdmin");
    } else if (isDoctor) {
      localStorage.removeItem("currentDoctor");
    } else {
      localStorage.removeItem("currentUser");
    }
    navigate("/login");
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (isAdmin) {
      navigate("/admin/dashboard");
    } else if (isDoctor) {
      navigate("/doctor/dashboard");
    } else {
      navigate("/home");
    }
  };

  const handleNavigation = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  const handleSendReferral = () => {
    const message = prompt("Please enter your referral message:");
    if (!message) return;

    // Get existing referrals or initialize empty array
    const referrals = JSON.parse(localStorage.getItem("referrals") || "[]");
    
    // Create new referral
    const newReferral = {
      id: Date.now(),
      doctorId: userData.id,
      doctorName: userData.name,
      message: message,
      status: "pending",
      createdAt: new Date().toISOString(),
      isRead: false
    };

    // Add to referrals array
    const updatedReferrals = [...referrals, newReferral];
    localStorage.setItem("referrals", JSON.stringify(updatedReferrals));
    setReferrals(updatedReferrals);
    alert("Referral message sent successfully!");
  };

  const getDoctorReferrals = () => {
    return referrals.filter(r => r.doctorId === userData?.id);
  };

  const getUnreadReferrals = () => {
    return getDoctorReferrals().filter(r => !r.isRead);
  };

  return (
    <div className="flex justify-between text-sm py-4 mb-5 border-b border-gray-400">
      <img
        onClick={() =>
          isAdmin ? navigate("/admin/dashboard") : isDoctor ? navigate("/doctor/dashboard") : navigate("/home")
        }
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt="Logo"
      />
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <li 
          onClick={() => isAdmin ? navigate("/admin/dashboard") : isDoctor ? navigate("/doctor/dashboard") : navigate("/home")}
          className="py-1 cursor-pointer"
        >
          HOME
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </li>
        <li 
          onClick={() => navigate("/doctors")}
          className="py-1 cursor-pointer"
        >
          ALL DOCTORS
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </li>
        <li 
          onClick={() => navigate("/about")}
          className="py-1 cursor-pointer"
        >
          ABOUT
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </li>
        <li 
          onClick={() => navigate("/contact")}
          className="py-1 cursor-pointer"
        >
          CONTACT
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </li>
        {isAuthenticated && !isAdmin && !isDoctor && (
          <li 
            onClick={() => navigate("/my-profile")}
            className="py-1 cursor-pointer"
          >
            MY PROFILE
            <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
          </li>
        )}
      </ul>
      <div className="flex items-center gap-4">
        {isAuthenticated && !window.location.pathname.includes('/dashboard') ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        ) : !isAuthenticated ? (
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Login
          </button>
        ) : null}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt=""
        />
        {/** Mobile Menu */}
        <div
          className={`${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-36" src={assets.logo} alt="" />
            <img
              className="w-7"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt=""
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 text-lg font-medium">
            <li 
              onClick={() => {
                setShowMenu(false);
                if (isAdmin) {
                  navigate("/admin/dashboard");
                } else if (isDoctor) {
                  navigate("/doctor/dashboard");
                } else {
                  navigate("/home");
                }
              }}
              className="px-4 py-2 rounded inline-block cursor-pointer"
            >
              HOME
            </li>
            <li 
              onClick={() => {
                setShowMenu(false);
                navigate("/doctors");
              }}
              className="px-4 py-2 rounded inline-block cursor-pointer"
            >
              ALL DOCTORS
            </li>
            <li 
              onClick={() => {
                setShowMenu(false);
                navigate("/about");
              }}
              className="px-4 py-2 rounded inline-block cursor-pointer"
            >
              ABOUT
            </li>
            <li 
              onClick={() => {
                setShowMenu(false);
                navigate("/contact");
              }}
              className="px-4 py-2 rounded inline-block cursor-pointer"
            >
              CONTACT
            </li>
            {isAuthenticated && !isAdmin && !isDoctor && (
              <li 
                onClick={() => {
                  setShowMenu(false);
                  navigate("/my-profile");
                }}
                className="px-4 py-2 rounded inline-block cursor-pointer"
              >
                MY PROFILE
              </li>
            )}
            {isAuthenticated ? (
              <li
                onClick={() => {
                  handleLogout();
                  setShowMenu(false);
                }}
                className="px-4 py-2 rounded inline-block cursor-pointer text-red-500"
              >
                LOGOUT
              </li>
            ) : (
              <li
                onClick={() => {
                  navigate("/login");
                  setShowMenu(false);
                }}
                className="px-4 py-2 rounded inline-block cursor-pointer text-primary"
              >
                LOGIN
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
