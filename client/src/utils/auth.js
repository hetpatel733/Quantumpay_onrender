export const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");
  return !!(token && userData);
};

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  // Clear any other auth-related data
  
  // Redirect to home page
  window.location.href = "/";
};

export const getAuthData = () => {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");
  
  if (token && userData) {
    try {
      return {
        token,
        user: JSON.parse(userData)
      };
    } catch (error) {
      console.error("Error parsing user data:", error);
      logout(); // Clear invalid data
      return null;
    }
  }
  
  return null;
};
