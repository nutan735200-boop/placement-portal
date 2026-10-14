import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(email);
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return <div className="auth-page"><div className="auth-box">
    <div className="auth-logo"><h1>Place<span>AI</span></h1><p>Recover your account</p></div>
    <div className="auth-title">Forgot password?</div>
    <p className="page-sub">Enter your account email and we will send you a secure reset link.</p>
    {message && <div className="alert alert-success">{message}</div>}
    {error && <div className="alert alert-error">{error}</div>}
    <form onSubmit={handleSubmit}>
      <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Enter your email" required /></div>
      <button className="btn btn-primary" style={{ width: "100%" }} type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</button>
    </form>
    <div className="auth-footer"><Link to="/login">Back to login</Link></div>
  </div></div>;
}