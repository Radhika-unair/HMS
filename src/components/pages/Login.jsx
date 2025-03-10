import "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [userType, setUserType] = useState("patient");
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");

    // Basic validation
    if (!email || !password || (state === "Sign Up" && !name)) {
      setError("Please fill in all fields");
      return;
    }

    try {
      // Get the appropriate storage key based on user type
      const storageKey = userType === "doctor" ? "doctors" : "users";
      const existingUsers = JSON.parse(localStorage.getItem(storageKey) || "[]");

      if (state === "Sign Up") {
        // Check if email already exists
        if (existingUsers.some((user) => user.email === email)) {
          setError("Email already exists");
          return;
        }

        // Create new user
        const newUser = {
          id: Date.now(),
          name,
          email,
          password,
          type: userType,
          createdAt: new Date().toISOString(),
        };

        // Save to storage
        localStorage.setItem(
          storageKey,
          JSON.stringify([...existingUsers, newUser])
        );
        localStorage.setItem(
          userType === "doctor" ? "currentDoctor" : "currentUser",
          JSON.stringify(newUser)
        );
        navigate(userType === "doctor" ? "/doctor/dashboard" : "/home");
      } else {
        // Login logic
        const user = existingUsers.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          localStorage.setItem(
            userType === "doctor" ? "currentDoctor" : "currentUser",
            JSON.stringify(user)
          );
          navigate(userType === "doctor" ? "/doctor/dashboard" : "/home");
        } else {
          setError("Invalid email or password");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <form className="min-h-[80vh] flex items-center" onSubmit={onSubmitHandler}>
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </p>
        <p>Please {state === "Sign Up" ? "sign up" : "log in"} to continue</p>
        {error && (
          <p className="w-full text-center text-red-500 text-sm">{error}</p>
        )}

        {/* User Type Selection */}
        <div className="w-full flex gap-4 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="userType"
              value="patient"
              checked={userType === "patient"}
              onChange={(e) => setUserType(e.target.value)}
              className="text-primary"
            />
            Patient
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="userType"
              value="doctor"
              checked={userType === "doctor"}
              onChange={(e) => setUserType(e.target.value)}
              className="text-primary"
            />
            Doctor
          </label>
        </div>

        {/* Name field (only for Sign Up) */}
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

        {/* Email field */}
        <div className="w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded outline-none focus:border-primary"
          />
        </div>

        {/* Password field */}
        <div className="w-full">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded outline-none focus:border-primary"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-primary text-white py-2.5 rounded"
        >
          {state === "Sign Up" ? "Sign Up" : "Login"}
        </button>

        {/* Toggle between Sign Up and Login */}
        <p className="w-full text-center">
          {state === "Sign Up" ? "Already have an account?" : "New to our platform?"}{" "}
          <span
            onClick={() => setState(state === "Sign Up" ? "Login" : "Sign Up")}
            className="text-primary cursor-pointer"
          >
            {state === "Sign Up" ? "Login" : "Sign Up"}
          </span>
        </p>

        {/* Admin Login Link */}
        <div className="w-full text-center mt-2">
          <p className="text-gray-500">
            Are you an admin?{" "}
            <span
              onClick={() => navigate("/admin/login")}
              className="text-primary cursor-pointer hover:text-primary/80"
            >
              Admin Login
            </span>
          </p>
        </div>
      </div>
    </form>
  );
};

export default Login;
