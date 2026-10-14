import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentAPI } from "../utils/api";

const AvailableDrives = () => {
  const [drives, setDrives] = useState([]);
  const [filteredDrives, setFilteredDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchDrives();
  }, []);

  useEffect(() => {
    if (filter === "") {
      setFilteredDrives(drives);
    } else {
      setFilteredDrives(
        drives.filter((drive) =>
          drive.company.toLowerCase().includes(filter.toLowerCase()) ||
          drive.role.toLowerCase().includes(filter.toLowerCase())
        )
      );
    }
  }, [filter, drives]);

  const fetchDrives = async () => {
    try {
      const res = await studentAPI.getAvailableDrives();
      setDrives(res.data);
    } catch (err) {
      console.error("Error fetching drives:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1 className="page-title">Available Drives</h1>

      <div className="card">
        <div className="form-group">
          <input
            type="text"
            placeholder="Search by company or role..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {filteredDrives.length === 0 ? (
        <p className="text-center">No drives available</p>
      ) : (
        <div className="grid">
          {filteredDrives.map((drive) => (
            <div key={drive._id} className="drive-card">
              <div className="drive-card-header">
                <h3 className="drive-card-title">{drive.title}</h3>
                <span className="badge badge-info">{drive.status}</span>
              </div>
              <p className="drive-card-company">🏢 {drive.company}</p>
              <div className="drive-card-details">
                <div className="drive-card-detail">
                  <strong>Package:</strong> {drive.packageLpa} LPA
                </div>
                <div className="drive-card-detail">
                  <strong>Location:</strong> {drive.location}
                </div>
                <div className="drive-card-detail">
                  <strong>Min CGPA:</strong> {drive.minCgpa}
                </div>
                <div className="drive-card-detail">
                  <strong>Deadline:</strong>{" "}
                  {new Date(drive.deadline).toLocaleDateString()}
                </div>
              </div>
              {drive.requiredSkills && drive.requiredSkills.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <strong>Required Skills:</strong>
                  <div style={{ marginTop: "5px" }}>
                    {drive.requiredSkills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                    {drive.requiredSkills.length > 3 && (
                      <span className="skill-tag">
                        +{drive.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="drive-card-footer">
                <Link to={`/student/drives/${drive._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableDrives;
