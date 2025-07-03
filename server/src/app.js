// const alchemyDocs = require("@api/alchemy-docs");
const express = require("express");
const path = require("path");
var cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
require("dotenv").config();


// ----------------------------------imports
require("./db/conn");
const utility = require("./services/utility");
require("./models/payment");

const port = process.env.PORT || 8000;
const static_path = path.join(__dirname, "../public");
const views_path = path.join(__dirname, "../views");

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',  // React dev server
    'http://localhost:9000', 
    '13.228.225.19',
    '18.142.128.26',
    '54.254.162.138',
    'https://quantumpay-onrender.onrender.com'
  ], // Allow both localhost and 127.0.0.1
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
  preflightContinue: false // Handle preflight requests properly
};

// express definitions
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.static(static_path));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("views", views_path);


// Fallback to index.html for React Router
app.use(express.static(path.join(__dirname, "../../client/build")));

// ---------------------------------------------Pages
app.get("/", (req, res) => { 
  res.send("Hello From Server");
});

//Payment Routes
app.get("/payment", (req, res) => {
  const { api, order_id } = req.query;
  utility.paymentFunction(api, order_id, res);
});

app.get("/payment/coinselect", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "payment1.html"));
});

app.get("/payment/finalpayment", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "payment2.html"));
  utility.FinalpayFunction(req, res);
});

app.post("/payment/coinselect", (req, res) => {
  utility.CoinselectFunction(req, res, app);
});

app.get('/api/check-status', async (req, res) => {
  utility.checkstatus(req, res);
});



// ---------------------------------------------API Posts

app.post("/api/login", async (req, res) => {
  utility.login(req, res);
});

app.post("api/signup", async (req, res) => {
  utility.signup(req, res, app);
});

app.post("/api/contact", async (req, res) => {
  utility.contact(req, res, app);
});

app.get("/api/auth/validate", async (req, res) => {
  utility.validateToken(req, res);
});

app.get("/api/paymentinfo", async (req, res) => {
  utility.paymentinfo(req, res);
});


// Add new userdata endpoint
app.get("/api/userdata", async (req, res) => {
  console.log("🔍 REQUEST RECEIVED: /api/userdata endpoint hit");
  console.log("Query params:", req.query);
  console.log("Headers:", req.headers);
  utility.getUserData(req, res);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build", "index.html"));
});


app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
