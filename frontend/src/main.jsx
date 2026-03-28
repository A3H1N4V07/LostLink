import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import AlertProvider from "./context/AlertContext";
import AuthProvider from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
      <AlertProvider>
        <App />
      </AlertProvider>
    </AuthProvider>
);