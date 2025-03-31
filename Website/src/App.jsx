import "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./components/pages/Home";
import Doctors from "./components/pages/Doctors";
import About from "./components/pages/About";
import Login from "./components/pages/Login";
import Contact from "./components/pages/Contact";
import Myprofile from "./components/pages/Myprofile";
import Myappointment from "./components/pages/Myappointment"; // Ensure this file exists
import Appointment from "./components/pages/Appointment";
import AdminLogin from "./components/pages/AdminLogin";
import AdminDashboard from "./components/pages/AdminDashboard";
import DoctorDashboard from "./components/pages/DoctorDashboard";
import AddDoctor from "./components/pages/admin/AddDoctor";
import EditDoctor from "./components/pages/admin/EditDoctor";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";
import DoctorDetails from "./components/pages/DoctorDetails";
import PatientDetails from "./components/pages/PatientDetails";
//import VisitHistoryPage from "./components/pages/VisitHistoryPage";

// Protected Route Component
const ProtectedRoute = ({ children, requireAuth = true }) => {
  const currentUser = localStorage.getItem("currentUser");
  const currentAdmin = localStorage.getItem("currentAdmin");
  const currentDoctor = localStorage.getItem("currentDoctor");
  const location = useLocation();

  // If this is a public route (requireAuth is false), allow access
  if (!requireAuth) {
    return children;
  }

  // If user is admin, allow access to admin routes
  if (location.pathname.startsWith("/admin")) {
    if (!currentAdmin) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  }

  // If it's a doctor route, check for doctor authentication
  if (location.pathname.startsWith("/doctor")) {
    if (!currentDoctor) {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  // For routes that require authentication
  if (!currentUser && !currentDoctor && !currentAdmin && 
      location.pathname !== "/login" && location.pathname !== "/admin/login") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <div className="mx-4 sm:mx-[10%]">
      <Routes>
        {/* Root route redirects to home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Routes that don't require authentication */}
        <Route
          path="/home"
          element={
            <ProtectedRoute requireAuth={false}>
              <div>
                <Navbar />
                <Home />
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctors"
          element={
            <ProtectedRoute requireAuth={false}>
              <div>
                <Navbar />
                <Doctors />
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctors/:speciality"
          element={
            <ProtectedRoute requireAuth={false}>
              <div>
                <Navbar />
                <Doctors />
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/about"
          element={
            <ProtectedRoute requireAuth={false}>
              <div>
                <Navbar />
                <About />
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contact"
          element={
            <ProtectedRoute requireAuth={false}>
              <div>
                <Navbar />
                <Contact />
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <Myprofile />
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />

        

        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <Myappointment />
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointment/:docId"
          element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <Appointment />
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <AdminDashboard />
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/add-doctor"
          element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <AddDoctor />
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/edit-doctor/:id"
          element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <EditDoctor />
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/doctor/details" element={<DoctorDetails />} />
        <Route path="/patient/details" element={<PatientDetails />} />
        
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <DoctorDashboard />
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <ChatBot />
    </div>
  );
};

export default App;
