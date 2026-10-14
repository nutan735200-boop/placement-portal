import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", college: "", company: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = event => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async event => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const result = await register(form);
    if (result.success) {
      setSuccess(`${result.message} Redirecting to login...`);
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setError(result.message);
    }
  };

  return <div className="auth-page"><div className="auth-box" style={{ maxWidth: "500px" }}>
    <div className="auth-logo"><h1>Place<span>AI</span></h1><p>Create your account</p></div>
    {error && <div className="alert alert-error">{error}</div>}
    {success && <div className="alert alert-success">{success}</div>}
    <form onSubmit={handleSubmit}>
      <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required /></div>
      <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required /></div>
      <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} /></div>
      <div className="form-group"><label className="form-label">Register As</label><select className="form-select" name="role" value={form.role} onChange={handleChange}><option value="student">Student</option><option value="recruiter">Recruiter</option><option value="tpo">TPO Admin</option></select></div>
      {form.role === "student" && <div className="form-group"><label className="form-label">College Name</label><input className="form-input" name="college" placeholder="G.L. Bajaj Institute of Technology & Management" value={form.college} onChange={handleChange} /></div>}
      {form.role === "recruiter" && <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" name="company" placeholder="Company name" value={form.company} onChange={handleChange} /></div>}
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px" }} type="submit" disabled={loading}>{loading ? "Registering..." : "Create Account ->"}</button>
    </form>
    <div className="auth-footer">Already have an account? <Link to="/login">Login here</Link></div>
  </div></div>;
}