import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authAPI } from "../utils/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      navigate("/login", { state: { message: "Password reset successful. Please login." } });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return <div className="auth-page"><div className="auth-box">
    <div className="auth-logo"><h1>Place<span>AI</span></h1><p>Choose a new password</p></div>
    <div className="auth-title">Reset password</div>
    {error && <div className="alert alert-error">{error}</div>}
    <form onSubmit={handleSubmit}>
      <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} required /></div>
      <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Re-enter your password" minLength={6} required /></div>
      <button className="btn btn-primary" style={{ width: "100%" }} type="submit" disabled={loading}>{loading ? "Updating..." : "Update Password"}</button>
    </form>
    <div className="auth-footer"><Link to="/login">Back to login</Link></div>
  </div></div>;
}