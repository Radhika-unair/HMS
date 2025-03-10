import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing auth data
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentAdmin");
    
    // Initialize admin account if it doesn't exist
    const admins = JSON.parse(localStorage.getItem("admins") || "[]");
    if (admins.length === 0) {
      localStorage.setItem("admins", JSON.stringify([
        {
          email: "admin@hospital.com",
          password: "admin123",
          role: "admin"
        }
      ]));
    }
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const admins = JSON.parse(localStorage.getItem("admins") || "[]");
      const admin = admins.find(a => a.email === email && a.password === password);

      if (admin) {
        localStorage.setItem("currentAdmin", JSON.stringify(admin));
        navigate("/admin/dashboard");
      } else {
        setError("Invalid admin credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <form className="min-h-[80vh] flex items-center" onSubmit={handleAdminLogin}>
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">Admin Login</p>
        <p>Please login to access admin dashboard</p>
        
        {error && (
          <p className="w-full text-center text-red-500 text-sm">{error}</p>
        )}
        
        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="admin@hospital.com"
            required
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Enter your password"
            required
          />
        </div>
        <button 
          type="submit"
          className="bg-primary text-white w-full py-2 rounded-md text-base hover:bg-primary/90 transition-colors"
        >
          Login as Admin
        </button>
        <p className="w-full text-center">
          <span
            onClick={() => navigate("/login")}
            className="text-primary cursor-pointer hover:text-primary/80"
          >
            Back to User Login
          </span>
        </p>
      </div>
    </form>
  );
};

export default AdminLogin; 