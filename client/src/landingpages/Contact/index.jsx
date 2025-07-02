import React, { useState } from "react";
import Navbar from "../navbar";
import Footer from "../footer";
import "../../styles/landingpage/contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    comment: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to send message");
      } else {
        setSuccessMsg(data.message || "Message sent successfully!");
        setFormData({ email: "", subject: "", comment: "" });
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
      {/* fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Raleway&display=swap"
        rel="stylesheet"
      />
      
      <div className="maincontainer">
        <form method="post" onSubmit={handleSubmit}>
          <h1 className="loginhead">Contact Us</h1>
          <div className={`issueelement ${error ? "" : "displaynone"}`}>
            <p className="issueelementp">{error}</p>
          </div>
          <div className={`issueelement ${successMsg ? "" : "displaynone"}`} style={{ color: "green" }}>
            <p className="issueelementp">{successMsg}</p>
          </div>
          <div className="formcontainer">
            <div className="formelements">
              <label htmlFor="email">Email: </label>
              <br />
              <input
                type="email"
                placeholder="Enter Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required=""
                disabled={isSubmitting}
              />
            </div>
            <div className="formelements">
              <label htmlFor="subject">Subject: </label>
              <br />
              <input
                type="text"
                placeholder="Enter Subject"
                name="subject"
                className="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required=""
                disabled={isSubmitting}
              />
            </div>
            <div className="formelements textareatemp">
              <label htmlFor="comment">Description: </label>
              <br />
              <textarea
                className="comment"
                name="comment"
                rows={4}
                cols={25}
                value={formData.comment}
                onChange={handleInputChange}
                required=""
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="sbmtbtnparent">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
