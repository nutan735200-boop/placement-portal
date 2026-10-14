import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Landing from "./pages/Landing";
import StudentDashboard from "./pages/StudentDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import StudentProfile from "./pages/StudentProfile";
import RecruiterProfile from "./pages/RecruiterProfile";
import AvailableDrives from "./pages/AvailableDrives";
import DriveDetails from "./pages/DriveDetails";
import Shortlist from "./pages/Shortlist";
import Analytics from "./pages/Analytics";
import Navbar from "./components/Navbar";
import "./App.css";

const PrivateRoute = ({ children, roles }) => {
  const { user, token } = useAuth();

  if (!token || !user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  const { user, token } = useAuth();

  const getDashboard = () => {
    if (!user) return "/login";
    if (user.role === "student") return "/student";
    if (user.role === "recruiter") return "/recruiter";
    if (user.role === "tpo") return "/tpo";
    return "/login";
  };

  return (
    <>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={token ? <Navigate to={getDashboard()} /> : <Landing />} />
          <Route path="/login" element={token ? <Navigate to={getDashboard()} /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to={getDashboard()} /> : <Register />} />
          <Route path="/forgot-password" element={token ? <Navigate to={getDashboard()} /> : <ForgotPassword />} />
          <Route path="/reset-password/:token" element={token ? <Navigate to={getDashboard()} /> : <ResetPassword />} />
          <Route path="/student" element={<PrivateRoute roles={["student"]}><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/dashboard" element={<Navigate to="/student" replace />} />
          <Route path="/student/profile" element={<PrivateRoute roles={["student"]}><StudentProfile /></PrivateRoute>} />
          <Route path="/student/drives" element={<PrivateRoute roles={["student"]}><AvailableDrives /></PrivateRoute>} />
          <Route path="/student/drives/:id" element={<PrivateRoute roles={["student"]}><DriveDetails /></PrivateRoute>} />
          <Route path="/recruiter" element={<PrivateRoute roles={["recruiter"]}><RecruiterDashboard /></PrivateRoute>} />
          <Route path="/recruiter/dashboard" element={<Navigate to="/recruiter" replace />} />
          <Route path="/recruiter/profile" element={<PrivateRoute roles={["recruiter"]}><RecruiterProfile /></PrivateRoute>} />
          <Route path="/recruiter/shortlist/:driveId" element={<PrivateRoute roles={["recruiter"]}><Shortlist /></PrivateRoute>} />
          <Route path="/tpo" element={<PrivateRoute roles={["tpo"]}><Analytics /></PrivateRoute>} />
          <Route path="/analytics" element={<Navigate to="/tpo" replace />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
