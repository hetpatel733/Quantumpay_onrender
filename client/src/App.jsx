import React from "react";
import Routes from "./Routes";
import ErrorBoundary from "components/ErrorBoundary";
import "./styles/tailwind.css";

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Routes />
      </div>
    </ErrorBoundary>
  );
}

export default App;
