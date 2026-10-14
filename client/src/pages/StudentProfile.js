import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { studentAPI } from "../utils/api";

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await studentAPI.getProfile();
      setProfile(res.data);
      setFormData(res.data);
    } catch (err) {
      setError("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.updateProfile(formData);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    setUploadingResume(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await studentAPI.uploadResume(formData);
      setSuccess(res.data.message);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1 className="page-title">My Profile</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h2>Personal Information</h2>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile}>
            <div className="grid-2">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>College</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Degree</label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Branch</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>CGPA</label>
                <input
                  type="number"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Graduation Year</label>
                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>LinkedIn</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>GitHub</label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
              />
            </div>

            <div className="divider"></div>
            <button type="submit" className="btn btn-success">
              Save Changes
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditing(false)}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <div>
            <p><strong>Name:</strong> {profile?.name}</p>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Phone:</strong> {profile?.phone || "N/A"}</p>
            <p><strong>College:</strong> {profile?.college || "N/A"}</p>
            <p><strong>Degree:</strong> {profile?.degree || "N/A"}</p>
            <p><strong>Branch:</strong> {profile?.branch || "N/A"}</p>
            <p><strong>CGPA:</strong> {profile?.cgpa || "N/A"}</p>
            <p><strong>Graduation Year:</strong> {profile?.graduationYear || "N/A"}</p>
            <p><strong>LinkedIn:</strong> {profile?.linkedin ? <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">View</a> : "N/A"}</p>
            <p><strong>GitHub:</strong> {profile?.github ? <a href={profile.github} target="_blank" rel="noopener noreferrer">View</a> : "N/A"}</p>
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Resume</h2>
        </div>
        {profile?.resumeUrl ? (
          <p>✓ Resume uploaded: <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">Download</a></p>
        ) : (
          <p>No resume uploaded yet</p>
        )}
        <div className="form-group">
          <label>Upload Resume (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleResumeUpload}
            disabled={uploadingResume}
          />
        </div>
        {profile?.skills && profile.skills.length > 0 && (
          <div>
            <h3>Detected Skills:</h3>
            <div>
              {profile.skills.map((skill, idx) => (
                <span key={idx} className="skill-tag matched">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
