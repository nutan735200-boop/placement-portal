import React, { useEffect, useState } from "react";
import { analyticsAPI, drivesAPI } from "../utils/api";

const Analytics = () => {
  const [data, setData] = useState(null);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchAnalytics();
    fetchDrives();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrives = async () => {
    try {
      const res = await drivesAPI.getAll();
      setDrives(res.data || []);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to load drives");
    }
  };

  const approveDrive = async (driveId) => {
    setActionError("");
    try {
      await drivesAPI.updateStatus(driveId, "active");
      await Promise.all([fetchDrives(), fetchAnalytics()]);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to approve drive");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!data) return <div className="alert alert-danger">Failed to load analytics</div>;

  return (
    <div>
      <h1 className="page-title">Campus Placement Analytics 📊</h1>

      {actionError && <div className="alert alert-danger">{actionError}</div>}

      <div className="card">
        <div className="card-header">
          <h2>Drive Approvals</h2>
        </div>
        {drives.filter((drive) => drive.status === "upcoming").length === 0 ? (
          <p>No drives awaiting approval</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Drive Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {drives.filter((drive) => drive.status === "upcoming").map((drive) => (
                  <tr key={drive._id}>
                    <td>{drive.company}</td>
                    <td>{drive.role}</td>
                    <td>{drive.driveDate ? new Date(drive.driveDate).toLocaleDateString() : "-"}</td>
                    <td>{drive.status}</td>
                    <td>
                      <button className="btn btn-success btn-sm" onClick={() => approveDrive(drive._id)}>
                        Approve & Publish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Summary Statistics</h2>
        </div>

        <div className="stats-grid">
          <div className="stat-card primary">
            <h3>Total Students</h3>
            <div className="value">{data.summary.totalStudents}</div>
          </div>
          <div className="stat-card primary">
            <h3>Total Drives</h3>
            <div className="value">{data.summary.totalDrives}</div>
          </div>
          <div className="stat-card success">
            <h3>Active Drives</h3>
            <div className="value">{data.summary.activeDrives}</div>
          </div>
          <div className="stat-card warning">
            <h3>Total Applications</h3>
            <div className="value">{data.summary.totalApplications}</div>
          </div>
          <div className="stat-card success">
            <h3>Shortlisted</h3>
            <div className="value">{data.summary.shortlisted}</div>
          </div>
          <div className="stat-card danger">
            <h3>Selected</h3>
            <div className="value">{data.summary.selected}</div>
          </div>
          <div className="stat-card primary">
            <h3>Shortlist Rate</h3>
            <div className="value">{data.summary.shortlistRate}%</div>
          </div>
          <div className="stat-card warning">
            <h3>Avg AI Score</h3>
            <div className="value">{data.aiScores.avg?.toFixed(2)}%</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2>Branch-wise Distribution</h2>
          </div>
          {data.branchStats && data.branchStats.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {data.branchStats.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item._id || "N/A"}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data available</p>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>AI Score Statistics</h2>
          </div>
          <p>
            <strong>Average Score:</strong> {data.aiScores.avg?.toFixed(2)}%
          </p>
          <p>
            <strong>Maximum Score:</strong> {data.aiScores.max?.toFixed(2)}%
          </p>
          <p>
            <strong>Minimum Score:</strong> {data.aiScores.min?.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Top Companies</h2>
        </div>
        {data.companyStats && data.companyStats.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Drives</th>
                <th>Total Applicants</th>
              </tr>
            </thead>
            <tbody>
              {data.companyStats.map((item, idx) => (
                <tr key={idx}>
                  <td>{item._id}</td>
                  <td>{item.drives}</td>
                  <td>{item.applicants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
