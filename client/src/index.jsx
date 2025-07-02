import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import 'bootstrap/dist/css/bootstrap.min.css';

// Landing page styles
import "./styles/landingpage/home.css";
import "./styles/landingpage/home_hover.css";
import "./styles/landingpage/home-responsive.css"; // Add the new combined file
import "./styles/landingpage/login.css";
import "./styles/landingpage/signup.css";
import "./styles/landingpage/contact.css";
import "./styles/landingpage/navbar.css";
import "./styles/landingpage/footer.css";

// Payment media queries
// import "./styles/landingpage/mediaqueries/payment1_max1100.css";
// import "./styles/landingpage/mediaqueries/payment1_max900.css";
// import "./styles/landingpage/mediaqueries/payment1_max400.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);