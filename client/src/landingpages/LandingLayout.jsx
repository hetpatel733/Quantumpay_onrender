import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./footer";

const LandingLayout = () => {
  const location = useLocation();
  
  // Add script loading based on the current route
  useEffect(() => {
    const loadScripts = () => {
      // Clear any previously loaded scripts
      const oldScripts = document.querySelectorAll('script.dynamic-script');
      oldScripts.forEach(script => script.remove());
      
      // Load page-specific scripts
      if (location.pathname === '/login') {
        const loginScript = document.createElement('script');
        loginScript.src = '/js/login.js';
        loginScript.className = 'dynamic-script';
        loginScript.defer = true;
        document.body.appendChild(loginScript);
      } else if (location.pathname === '/signup') {
        const signupScript = document.createElement('script');
        signupScript.src = '/js/signup.js';
        signupScript.className = 'dynamic-script';
        signupScript.defer = true;
        document.body.appendChild(signupScript);
        
        // Add jQuery for the signup validator
        const jQueryScript = document.createElement('script');
        jQueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        jQueryScript.className = 'dynamic-script';
        document.body.appendChild(jQueryScript);
      }
    };

    loadScripts();
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <main style={{ marginTop: "80px" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default LandingLayout;
