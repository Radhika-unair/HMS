import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../url_config";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data["status"]==="success") {

        localStorage.setItem("currentAdmin", JSON.stringify([
          {
            email: email,
            id: data["id"],
            role: "admin"
          }
        ]));
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
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
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login as Admin"}
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
