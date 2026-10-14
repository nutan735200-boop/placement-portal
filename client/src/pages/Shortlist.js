import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { drivesAPI, shortlistAPI } from "../utils/api";

const Shortlist = () => {
  const { driveId } = useParams();
  const [drive, setDrive] = useState(null);
  const [results, setResults] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [threshold, setThreshold] = useState(60);

  useEffect(() => {
    fetchData();
  }, [driveId]);

  const fetchData = async () => {
    try {
      const [driveRes, applicantsRes] = await Promise.all([
        drivesAPI.getById(driveId),
        drivesAPI.getApplicants(driveId)
      ]);
      setDrive(driveRes.data);
      setApplicants(applicantsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunShortlist = async () => {
    setRunning(true);
    try {
      const res = await shortlistAPI.runMSCEA({ driveId, threshold });
      setResults(res.data);
      alert("AI Shortlisting completed!");
      fetchData();
    } catch (err) {
      alert("Failed to run shortlisting: " + err.response?.data?.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!drive) return <div className="alert alert-danger">Drive not found</div>;

  return (
    <div>
      <h1 className="page-title">Shortlist - {drive.title}</h1>

      <div className="card">
        <div className="card-header">
          <h2>AI Shortlisting Control Panel</h2>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Shortlisting Threshold (%)</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              min="0"
              max="100"
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={handleRunShortlist}
              disabled={running}
              className="btn btn-success"
              style={{ width: "100%" }}
            >
              {running ? "Running MSCEA..." : "🤖 Run MSCEA Algorithm"}
            </button>
          </div>
        </div>

        {results && (
          <div style={{ marginTop: "20px" }}>
            <div className="stats-grid">
              <div className="stat-card primary">
                <h3>Total Applicants</h3>
                <div className="value">{results.summary.total}</div>
              </div>
              <div className="stat-card success">
                <h3>Shortlisted</h3>
                <div className="value">{results.summary.shortlisted}</div>
              </div>
              <div className="stat-card warning">
                <h3>Avg Score</h3>
                <div className="value">{results.summary.avgScore}%</div>
              </div>
              <div className="stat-card danger">
                <h3>Eliminated</h3>
                <div className="value">{results.summary.total - results.summary.shortlisted}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Applicants ({applicants.length})</h2>
        </div>

        {applicants.length === 0 ? (
          <p>No applicants yet</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>CGPA</th>
                <th>Branch</th>
                <th>AI Score</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((app) => (
                <tr key={app.applicationId}>
                  <td>{app.student?.name}</td>
                  <td>{app.student?.email}</td>
                  <td>{app.student?.cgpa}</td>
                  <td>{app.student?.branch}</td>
                  <td>
                    <strong>{app.aiScore ? app.aiScore.toFixed(2) : "N/A"}%</strong>
                  </td>
                  <td>
                    <span className={`badge badge-${app.status}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Shortlist;
