import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Import CSS in correct order - base styles first
import "./styles/index.css";
import "./styles/tailwind.css";

// Bootstrap after base styles
import 'bootstrap/dist/css/bootstrap.min.css';

// Landing page styles
import "./styles/landingpage/navbar.css";
import "./styles/landingpage/footer.css";
import "./styles/landingpage/home.css";
import "./styles/landingpage/home_hover.css";
import "./styles/landingpage/home-responsive.css";
import "./styles/landingpage/login.css";
import "./styles/landingpage/signup.css";
import "./styles/landingpage/contact.css";

// Payment page styles last
import "./styles/payment/coinselect.css";
import "./styles/payment/finalpayment.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);