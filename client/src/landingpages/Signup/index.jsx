import React, { useState, useEffect } from "react";
import Navbar from "../navbar";
import Footer from "../footer";
import { useNavigate } from "react-router-dom";
import "../../styles/landingpage/signup.css";
const server = import.meta.env.VITE_SERVER_URL || "";

const Signup = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationResults, setValidationResults] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState({
    name: "", // <-- change uname to name
    email: "",
    password: "",
    type: "Business", // Fixed default value
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validators = [
    {
      regexp: /.{8,}/,
      message: "Minimum 8 chars",
    },
    {
      regexp: /[a-z]/,
      message: "1 lowercase",
    },
    {
      regexp: /[A-Z]/,
      message: "1 uppercase",
    },
    {
      regexp: /[0-9]/,
      message: "1 number",
    },
    {
      regexp: /.*[!@#$%?=*&]/,
      message: "1 special char !@#$%?=*&",
    },
  ];

  useEffect(() => {
    if (password.length === 0) {
      setValidationResults([]);
      setIsFormValid(false);
      return;
    }

    const results = validators.map((validator) => ({
      message: validator.message,
      isValid: validator.regexp.test(password),
    }));

    // Check password confirmation
    const passwordsMatch =
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword;
    results.push({
      message: "Password confirmation must be the same",
      isValid: passwordsMatch,
    });

    setValidationResults(results);

    // Form is valid if all validators pass
    const allValid = results.every((result) => result.isValid);
    setIsFormValid(allValid);
  }, [password, confirmPassword]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setFormData((prev) => ({ ...prev, password: e.target.value }));
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleTypeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      type: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Please fix all validation errors before submitting.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${server}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (response.redirected) {
        // If server redirects, follow it
        window.location.href = response.url;
        return;
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message || "Signup failed");
      } else {
        // Signup success, redirect to login or dashboard
        navigate("/login?success=1");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="maincontainer">
        <form method="POST" onSubmit={handleSubmit}>
          <h1 className="registerhead">Register Now!</h1>
          <div className="formelements type">
            <div className="grid-wrapper grid-col-auto">
              <label htmlFor="radio-card-1" className="radio-card">
                <input
                  type="radio"
                  name="type"
                  value="Business"
                  id="radio-card-1"
                  checked={formData.type === "Business"}
                  onChange={handleTypeChange}
                />
                <div className="card-content-wrapper">
                  <span className="check-icon" />
                  <div className="card-content">
                    <img
                      src="/images/business.png"
                      alt=""
                      height="220px"
                      width="220px"
                    />
                    <h4>Business</h4>
                  </div>
                </div>
              </label>
              <label htmlFor="radio-card-2" className="radio-card">
                <input
                  type="radio"
                  name="type"
                  value="Personal"
                  id="radio-card-2"
                  checked={formData.type === "Personal"}
                  onChange={handleTypeChange}
                />
                <div className="card-content-wrapper">
                  <span className="check-icon" />
                  <div className="card-content">
                    <img
                      src="/images/personal.png"
                      alt=""
                      height="220px"
                      width="220px"
                    />
                    <h4>Personal</h4>
                  </div>
                </div>
              </label>
            </div>
            <div className={`issueelement ${error ? "" : "displaynone"}`}>
              <p className="issueelementp">{error}</p>
            </div>
          </div>
          <div className="formcontainer">
            <div className="formelements">
              <label htmlFor="name">Name: </label>
              <br />
              <input
                type="text"
                className="name"
                placeholder="Enter Your Name"
                name="name" // <-- change uname to name
                value={formData.name}
                onChange={handleInputChange}
                required=""
              />
            </div>
            <div className="formelements">
              <label htmlFor="email">Email:</label>
              <br />
              <input
                type="email"
                placeholder="Enter Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required=""
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
                value={password}
                onChange={handlePasswordChange}
                required=""
              />
            </div>
            <div className="formelements">
              <label htmlFor="confirmpassword">Confirm Password:</label>
              <br />
              <input
                type="password"
                className="cpassword"
                placeholder="Enter Confirm Password"
                name="cpassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required=""
              />
            </div>
            <div className="validator-output">
              {validationResults.map((result, index) => (
                <div
                  key={index}
                  className={result.isValid ? "valid" : "invalid"}
                >
                  {result.message}
                </div>
              ))}
            </div>
          </div>
          <div className="sbmtbtnparent">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Submit"}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default Signup;
