import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api"
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password })
};

// Student API
export const studentAPI = {
  getProfile: () => api.get("/student/profile"),
  updateProfile: (data) => api.put("/student/profile", data),
  uploadResume: (formData) => api.post("/student/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  getAvailableDrives: () => api.get("/student/drives"),
  applyToDrive: (driveId) => api.post(`/student/apply/${driveId}`),
  getApplications: () => api.get("/student/applications")
};

// Drives API
export const drivesAPI = {
  getAll: () => api.get("/drives"),
  getById: (id) => api.get(`/drives/${id}`),
  create: (data) => api.post("/drives", data),
  updateStatus: (id, status) => api.put(`/drives/${id}/status`, { status }),
  update: (id, data) => api.put(`/drives/${id}`, data),
  getApplicants: (id) => api.get(`/drives/${id}/applicants`)
};

// Recruiter API
export const recruiterAPI = {
  getProfile: () => api.get("/recruiter/profile"),
  updateProfile: (data) => api.put("/recruiter/profile", data)
};

// Shortlist API
export const shortlistAPI = {
  runMSCEA: (data) => api.post("/shortlist/run", data),
  getResults: (driveId) => api.get(`/shortlist/${driveId}`),
  updateStatus: (driveId, studentId, status) =>
    api.put(`/shortlist/update/${driveId}/${studentId}`, { status })
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get("/analytics/dashboard")
};

export default api;
