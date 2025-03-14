import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://87c6-2409-40f3-1003-a579-98e8-4f69-6382-2c13.ngrok-free.app"; // Replace with actual API endpoint

const Login = () => {
  const [state, setState] = useState("Login"); // Toggle between "Sign Up" & "Login"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only for sign-up
  const [error, setError] = useState("");
  const [userType, setUserType] = useState("patient"); // Default to patient
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password || (state === "Sign Up" && !name)) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const endpoint = state === "Sign Up" ? "/auth/signup" : "/auth/login";
      const requestBody = {
        email,
        password,
        user_type: userType,
      };

      if (state === "Sign Up") {
        requestBody.name = name;
      }

      console.log("Sending request to:", `${API_URL}${endpoint}`);
      console.log("Request body:", requestBody);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response data:", result);

      if (!response.ok) {
        throw new Error(result.message || "Authentication failed");
      }

      if (result.access !== "True") {
        setError("Invalid credentials. Please try again.");
        return;
      }

      // Store user data in localStorage
      const userData = {
        id: result.id || Date.now(),
        name: result.name || name,
        email,
        type: userType,
        createdAt: new Date().toISOString()
      };

      console.log("Storing user data:", userData);

      // Store in appropriate localStorage key based on user type
      if (userType === "doctor") {
        localStorage.setItem("currentDoctor", JSON.stringify(userData));
        // Also store in doctors array if it doesn't exist
        const existingDoctors = JSON.parse(localStorage.getItem("doctors") || "[]");
        if (!existingDoctors.some(doc => doc.id === userData.id)) {
          localStorage.setItem("doctors", JSON.stringify([...existingDoctors, userData]));
        }
      } else {
        localStorage.setItem("currentUser", JSON.stringify(userData));
        // Also store in users array if it doesn't exist
        const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
        if (!existingUsers.some(user => user.id === userData.id)) {
          localStorage.setItem("users", JSON.stringify([...existingUsers, userData]));
        }
      }

      // Navigate based on user type
      if (userType === "doctor") {
        console.log("Navigating to doctor dashboard");
        navigate("/doctor/dashboard");
      } else {
        console.log("Navigating to home");
        navigate("/home");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  return (
    <form className="min-h-[80vh] flex items-center" onSubmit={onSubmitHandler}>
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">{state === "Sign Up" ? "Create Account" : "Login"}</p>
        <p>Please {state === "Sign Up" ? "sign up" : "log in"} to continue</p>
        {error && <p className="w-full text-center text-red-500 text-sm">{error}</p>}

        {/* User Type Selection */}
        <div className="w-full flex gap-4 mb-2">
          {["patient", "doctor"].map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="radio"
                name="userType"
                value={type}
                checked={userType === type}
                onChange={(e) => setUserType(e.target.value)}
                className="text-primary"
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>

        {/* Name Field (only for Sign Up) */}
        {state === "Sign Up" && (
          <div className="w-full">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded outline-none focus:border-primary"
            />
          </div>
        )}

        {/* Email Field */}
        <div className="w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded outline-none focus:border-primary"
          />
        </div>

        {/* Password Field */}
        <div className="w-full">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded outline-none focus:border-primary"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="w-full bg-primary text-white py-2.5 rounded">
          {state === "Sign Up" ? "Sign Up" : "Login"}
        </button>

        {/* Toggle Between Sign Up & Login */}
        <p className="w-full text-center">
          {state === "Sign Up" ? "Already have an account?" : "New to our platform?"}{" "}
          <span onClick={() => setState(state === "Sign Up" ? "Login" : "Sign Up")} className="text-primary cursor-pointer">
            {state === "Sign Up" ? "Login" : "Sign Up"}
          </span>
        </p>

        {/* Admin Login */}
        <div className="w-full text-center mt-2">
          <p className="text-gray-500">
            Are you an admin?{" "}
            <span onClick={() => navigate("/admin/login")} className="text-primary cursor-pointer hover:text-primary/80">
              Admin Login
            </span>
          </p>
        </div>
      </div>
    </form>
  );
};

export default Login;
