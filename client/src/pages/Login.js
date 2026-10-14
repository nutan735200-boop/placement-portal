import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const result = await login(form.email, form.password);
    if (!result.success) return setError(result.message);
    if (result.role === "student") navigate("/student");
    if (result.role === "recruiter") navigate("/recruiter");
    if (result.role === "tpo") navigate("/tpo");
  };

  return <div className="auth-page"><div className="auth-box">
    <div className="auth-logo"><h1>Place<span>AI</span></h1><p>Campus Placement Portal - MCA Project</p></div>
    <div className="auth-title">Login to your account</div>
    {error && <div className="alert alert-error">{error}</div>}
    <form onSubmit={handleSubmit}>
      <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" name="email" placeholder="Enter your email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} required /></div>
      <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" name="password" placeholder="Enter your password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} required /></div>
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px" }} type="submit" disabled={loading}>{loading ? "Logging in..." : "Login ->"}</button>
    </form>
    <div className="demo-note"><strong>Demo access</strong><br />student@test.com / 123456<br />recruiter@test.com / 123456<br />tpo@test.com / 123456</div>
    <div className="auth-footer"><Link to="/forgot-password">Forgot password?</Link><br />Don't have an account? <Link to="/register">Register here</Link></div>
  </div></div>;
}