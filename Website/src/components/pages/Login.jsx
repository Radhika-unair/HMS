import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../url_config";

const API_URL = BASE_URL; // Replace with actual API endpoint

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

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Authentication failed");
      }

      if (result.access !== "True") {
        setError("Invalid credentials. Please try again.");
        return;
      }

      // Store user data in localStorage
      const userData = {
        id: result.id,
        name: result.name || name,
        email,
        type: userType,
        createdAt: new Date().toISOString(),
      };

      if (userType === "doctor") {
        localStorage.setItem("currentDoctor", JSON.stringify(userData));
        const existingDoctors = JSON.parse(localStorage.getItem("doctors") || "[]");
        if (!existingDoctors.some(doc => doc.id === userData.id)) {
          localStorage.setItem("doctors", JSON.stringify([...existingDoctors, userData]));
        }
      } else {
        localStorage.setItem("currentUser", JSON.stringify(userData));
        const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
        if (!existingUsers.some(user => user.id === userData.id)) {
          localStorage.setItem("users", JSON.stringify([...existingUsers, userData]));
        }
      }

      // Redirect logic
      if (state === "Sign Up") {
        navigate(userType === "doctor" ? "/doctor/details" : "/patient/details");
      } else {
        navigate(userType === "doctor" ? "/doctor/dashboard" : "/home");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  return (
    <form className="min-h-[80vh] flex items-center" onSubmit={onSubmitHandler}>
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">{state === "Sign Up" ? "Create Account" : "Login"}</p>
        <p>Please {state === "Sign Up" ? "sign up" : "log in"} to continue</p>
        {error && <p className="w-full text-center text-red-500 text-sm">{error}</p>}

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

        <div className="w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded outline-none focus:border-primary"
          />
        </div>

        <div className="w-full">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded outline-none focus:border-primary"
          />
        </div>

        <button type="submit" className="w-full bg-primary text-white py-2.5 rounded">
          {state === "Sign Up" ? "Sign Up" : "Login"}
        </button>

        <p className="w-full text-center">
          {state === "Sign Up" ? "Already have an account?" : "New to our platform?"} {" "}
          <span onClick={() => setState(state === "Sign Up" ? "Login" : "Sign Up")} className="text-primary cursor-pointer">
            {state === "Sign Up" ? "Login" : "Sign Up"}
          </span>
        </p>

        <div className="w-full text-center mt-2">
          <p className="text-gray-500">
            Are you an admin? {" "}
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
