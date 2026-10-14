# 🎓 Campus Placement Portal

A full-stack web application for managing campus placements with AI-powered candidate shortlisting using the **MSCEA (Multi-Stage Candidate Elimination Algorithm)**.

## Research Readiness Status
This project is best viewed as a strong engineering prototype with a clear research path. It is already functional for campus placement workflows, but publication quality depends on stronger evaluation, fairness analysis, and real recruiter-grounded evidence.

## Research-Ready Focus
- Compare against BM25, TF-IDF, and embedding-based ranking baselines
- Use recruiter-labeled ground truth and independent rater agreement
- Measure ranking quality using NDCG@k, MAP, and precision/recall at k
- Run ablation studies to isolate each MSCEA stage
- Audit fairness across demographic and academic groups
- Validate the skill-impact guidance with real outcome data
- Avoid publishing final improvement claims until they are measured on real evaluation data

## Features

### Student Features
- **Profile Management**: Create and update student profiles with resume upload
- **Resume Upload**: PDF resume parsing with automatic skill, CGPA, and branch extraction
- **Browse Drives**: View all active placement drives
- **Apply for Drives**: Submit applications to recruitment drives
- **Track Applications**: Monitor application status and results
- **Skills Display**: View extracted skills from resume

### Recruiter Features
- **Create Drives**: Post new recruitment drives with detailed job descriptions
- **View Applicants**: See all applicants for each drive
- **AI Shortlisting**: Run the MSCEA algorithm to shortlist candidates
- **Manual Override**: Adjust application statuses manually
- **Profile Management**: Update recruiter profile information

### Admin/TPO Features
- **Dashboard Analytics**: View comprehensive placement statistics
- **Candidate Statistics**: Branch-wise student distribution
- **Company Analytics**: Top companies by drives and applicants
- **AI Scoring Insights**: Average, min, and max AI scores across all applications

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **PDF Parsing**: pdf-parse
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer

### Frontend
- **Library**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS3 (Custom styles)

### Algorithm
- **MSCEA**: Custom-built Multi-Stage Candidate Elimination Algorithm (no ML libraries)
  - TF-IDF text similarity
  - Cosine similarity matching
  - Skill gap scoring with knowledge graph
  - Multi-stage filtering (eligibility, skills, AI scoring, diversity)

## Research and Publication Roadmap

This project is already a strong engineering system for campus recruitment workflows, but to make it publication-ready, the next phase should focus on evidence rather than additional features.

### Priority research tasks
- Evaluate against stronger baselines: BM25, TF-IDF, and embedding-based matching
- Use recruiter-labeled data and report inter-rater agreement
- Add ranking metrics such as NDCG@k and MAP, not only precision/recall
- Run ablation studies to isolate the value of each MSCEA stage
- Add fairness audits for gender, college tier, and category-sensitive disparities
- Validate the skill-impact predictor with real outcome data
- Measure recruiter time saved and usability in practice, rather than assuming estimates
- Avoid publishing target numbers until they are measured on real evaluation data

### Publication direction
The best framing is to position the project as an explainable resume-to-job matching system for campus hiring, with rigorous empirical validation as the core contribution.

## Project Structure

```
placement-portal/
├── client/                      # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/             # React Context (Auth)
│   │   │   └── AuthContext.js
│   │   ├── pages/               # Page components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── StudentProfile.js
│   │   │   ├── AvailableDrives.js
│   │   │   ├── DriveDetails.js
│   │   │   ├── RecruiterDashboard.js
│   │   │   ├── RecruiterProfile.js
│   │   │   ├── Shortlist.js
│   │   │   └── Analytics.js
│   │   ├── utils/               # Utility functions
│   │   │   └── api.js           # API client
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env.local
│
├── server/                      # Express backend
│   ├── models/                  # MongoDB models
│   │   ├── user.js
│   │   ├── student.js
│   │   ├── recruiter.js
│   │   ├── drive.js
│   │   └── application.js
│   ├── routes/                  # API routes
│   │   ├── auth.js
│   │   ├── student.js
│   │   ├── recruiter.js
│   │   ├── drives.js
│   │   ├── shortlist.js
│   │   └── analytics.js
│   ├── middleware/              # Custom middleware
│   │   └── auth.js              # JWT protection & role-based access
│   ├── algorithm/               # MSCEA algorithm
│   │   └── MSCEA.js
│   ├── config/                  # Configuration files
│   ├── uploads/                 # Resume uploads directory
│   ├── index.js                 # Server entry point
│   ├── package.json
│   └── .env
│
└── .gitignore
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your configuration:
```env
MONGO_URI=mongodb://127.0.0.1:27017/placement_portal
JWT_SECRET=your_jwt_secret_key
PORT=5000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

4. Create `uploads` directory:
```bash
mkdir uploads
mkdir uploads/resumes
```

5. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Student
- `GET /api/student/profile` - Get student profile
- `PUT /api/student/profile` - Update student profile
- `POST /api/student/resume` - Upload resume (multipart/form-data)
- `GET /api/student/drives` - Get available drives
- `POST /api/student/apply/:driveId` - Apply for a drive
- `GET /api/student/applications` - Get my applications

### Recruiter
- `GET /api/recruiter/profile` - Get recruiter profile
- `PUT /api/recruiter/profile` - Update recruiter profile

### Drives
- `POST /api/drives` - Create new drive (Recruiter/TPO)
- `GET /api/drives` - Get all drives
- `GET /api/drives/:id` - Get drive details
- `PUT /api/drives/:id/status` - Update drive status
- `GET /api/drives/:id/applicants` - Get drive applicants

### Shortlist
- `POST /api/shortlist/run` - Run MSCEA algorithm
- `GET /api/shortlist/:driveId` - Get shortlist results
- `PUT /api/shortlist/update/:driveId/:studentId` - Update application status

### Analytics
- `GET /api/analytics/dashboard` - Get placement analytics

## MSCEA Algorithm Overview

The Multi-Stage Candidate Elimination Algorithm consists of 4 stages:

1. **Stage 1: Hard Eligibility Check**
   - CGPA validation
   - Branch matching
   - Backlog verification
   - Graduation year validation

2. **Stage 2: Skill Gap Filtering**
   - Extracts skills from resume
   - Compares against job requirements
   - Assigns skill match scores (25% minimum required)

3. **Stage 3: AI Scoring**
   - TF-IDF text similarity between resume and job description
   - CGPA scoring normalization
   - Weighted scoring model:
     - Skill Match: 40%
     - CGPA Score: 25%
     - Text Similarity: 20%
     - Eligibility Score: 15%

4. **Stage 4: Diversity Balance**
   - Applies college caps
   - Respects shortlist limits
   - Final ranking by AI score

## User Roles

### Student
- Can register and manage profile
- Can upload and parse resume
- Can browse and apply for drives
- Can view application status

### Recruiter
- Can create and manage recruitment drives
- Can view all applicants
- Can run AI shortlisting
- Can manually override application status

### TPO (Placement Officer)
- Can access analytics dashboard
- Can view all placement data
- Can manage all drives and applications

## Features Highlights

✨ **No External ML Libraries**: Pure JavaScript implementation of text analysis and similarity matching

📄 **Smart Resume Parsing**: Automatic extraction of skills, CGPA, branch from PDF resumes

🤖 **AI-Powered Shortlisting**: Multi-stage algorithm for fair and objective candidate evaluation

🔐 **Secure Authentication**: JWT-based authorization with role-based access control

📊 **Comprehensive Analytics**: Detailed statistics on placements, companies, and candidate performance

📱 **Responsive Design**: Mobile-friendly interface for seamless user experience

## Testing the Application

### Test Credentials

**Student Account:**
- Email: `student@college.com`
- Password: `password123`

**Recruiter Account:**
- Email: `recruiter@company.com`
- Password: `password123`

**Admin/TPO Account:**
- Email: `admin@college.com`
- Password: `password123`

### Testing Flow

1. Register as a new student
2. Upload a resume (PDF format)
3. Browse available drives
4. Apply for a drive
5. As recruiter, create a new drive and view applicants
6. Run the MSCEA algorithm to shortlist candidates
7. View analytics dashboard

## Database Schema

### User
```
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "student" | "recruiter" | "tpo",
  isActive: Boolean,
  createdAt: Date
}
```

### Student
```
{
  userId: ObjectId,
  name: String,
  email: String,
  phone: String,
  college: String,
  degree: String,
  branch: String,
  cgpa: Number,
  graduationYear: Number,
  backlogs: Number,
  skills: [String],
  projects: [String],
  certifications: [String],
  linkedin: String,
  github: String,
  resumeUrl: String,
  resumeText: String,
  createdAt: Date
}
```

### Drive
```
{
  recruiterId: ObjectId,
  title: String,
  company: String,
  role: String,
  description: String,
  packageLpa: Number,
  location: String,
  requiredSkills: [String],
  preferredSkills: [String],
  minCgpa: Number,
  allowedBranches: [String],
  maxBacklogs: Number,
  graduationYears: [Number],
  deadline: Date,
  driveDate: Date,
  status: "upcoming" | "active" | "closed",
  totalApplicants: Number,
  createdAt: Date
}
```

### Application
```
{
  studentId: ObjectId,
  driveId: ObjectId,
  status: "applied" | "shortlisted" | "rejected" | "selected" | "on_hold",
  aiScore: Number (0-100),
  skillScore: Number,
  cgpaScore: Number,
  textScore: Number,
  eligScore: Number,
  matchedSkills: [String],
  missingSkills: [String],
  partialSkills: [Object],
  reasons: [String],
  appliedAt: Date,
  aiRunAt: Date
}
```

## Contributing

This is an MCA project by Nutan Kumari. Feel free to fork and contribute improvements!

## License

This project is provided as-is for educational purposes.

## Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for Campus Placements**
