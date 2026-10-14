import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        Dream<span>2Reality</span>
      </div>
      <div className="navbar-right">
        {user && (
          <>
            <span className="navbar-user">
              User: {user.name} | <span style={{ textTransform: "capitalize", color: "#02C39A" }}>{user.role}</span>
            </span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}