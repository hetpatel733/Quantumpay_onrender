import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Navbar from "../navbar";
import Footer from "../footer";

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
      console.log("🚀 REQUEST SENT: Login request to localhost:8000/login", credentials);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify(credentials),
      });

      console.log(`✅ RESPONSE RECEIVED: localhost:8000/api/login - Status: ${response.status}`);
      console.log("Response headers:", response.headers);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      return data;
    } catch (error) {
      console.error("❌ ERROR: Authentication failed:", error);
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

    setIsSubmitting(true);
    setError("");

    try {
      console.log("Starting login process...");
      const result = await authenticateUser(formData);

      console.log("Login result:", result);

      if (result.success && result.token) {
        console.log("Login successful, checking cookies...");
        console.log("All cookies after login:", document.cookie);
        
        // Update auth context with user data
        handleLoginSuccess(result.user, result.token);
        
        // Small delay to ensure state updates
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 100);
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (error) {
      console.error("❌ ERROR: Login process failed:", error);
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
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {/* fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Raleway&display=swap"
        rel="stylesheet"
      />
      <div className="maincontainer">
        <form
          className="LoginForm"
          name="LoginForm"
          method="POST"
          onSubmit={handleSubmit}
        >
          <h1 className="loginhead">Login</h1>
          <div className={`issueelement ${error ? "" : "displaynone"}`}>
            <p className="issueelementp">{error}</p>
          </div>
          <div className="formcontainer">
            <div className="formelements">
              <label htmlFor="emailoruname">Email:</label>
              <br />
              <input
                type="text"
                placeholder="Enter Email"
                name="email"
                className="email"
                value={formData.email}
                onChange={handleInputChange}
                required=""
                disabled={isSubmitting}
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
                required=""
                disabled={isSubmitting}
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
