import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div
        className="navbar-brand"
        onClick={() => navigate("/")}
        title="Go to Dashboard"
      >
        <div className="navbar-logo">📱</div>
        <div>
          <div className="navbar-title">
            Apple<span>Mobiles</span>
          </div>
          <div className="navbar-subtitle">Shop Manager</div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
