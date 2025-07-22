import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Navbar from "../navbar";
import Footer from "../footer";

const server = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

const Login = () => {
  const navigate = useNavigate();
  const { handleLoginSuccess, isAuthenticated, isLoading } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // If already authenticated, redirect immediately
  if (isAuthenticated && !isLoading) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const authenticateUser = async (credentials) => {
    try {
      console.log("🚀 REQUEST SENT: Login request to", `${server}/api/auth/login`);
      console.log("Credentials:", { email: credentials.email, password: "[HIDDEN]" });

      const response = await fetch(`${server}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify(credentials),
      });

      console.log(`✅ RESPONSE RECEIVED: Status ${response.status}`);

      // Handle different HTTP status codes
      if (!response.ok) {
        let errorMessage = "Login failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Login response data:", {
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user
      });

      return data;
    } catch (error) {
      console.error("❌ ERROR: Authentication request failed:", error);
      
      // Handle network errors specifically
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error("Cannot connect to server. Please check if the server is running.");
      }
      
      throw new Error(error.message || "Network error occurred");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      console.log("Starting login process...");
      const result = await authenticateUser(formData);

      if (result.success && result.token && result.user) {
        console.log("✅ Login successful!");
        
        // Store token in localStorage as backup
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("userData", JSON.stringify(result.user));
        
        console.log("Cookies after login:", document.cookie);
        
        // Update auth context with user data
        handleLoginSuccess(result.user, result.token);
        
        console.log("Redirecting to dashboard...");
        
        // Navigate to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        console.error("Login response missing required data:", result);
        throw new Error(result.message || "Invalid login response from server");
      }
    } catch (error) {
      console.error("❌ LOGIN ERROR:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading if auth is still being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-lg">Checking authentication...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="maincontainer">
        <form
          className="LoginForm"
          name="LoginForm"
          method="POST"
          onSubmit={handleSubmit}
        >
          <h1 className="loginhead">Login</h1>
          {error && (
            <div className="issueelement">
              <p className="issueelementp">{error}</p>
            </div>
          )}
          <div className="formcontainer">
            <div className="formelements">
              <label htmlFor="email">Email:</label>
              <br />
              <input
                type="email"
                placeholder="Enter Email"
                name="email"
                className="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
            <div className="formelements">
              <label htmlFor="password">Password:</label>
              <br />
              <input
                type="password"
                className="password"
                placeholder="Enter password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>
            <a href="#">Forgot Password?</a>
          </div>
          <div className="sbmtbtnparent">
            <button
              type="submit"
              className="sbmtbtn"
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Logging in..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Login;