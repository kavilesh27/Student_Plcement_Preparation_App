# AI-Powered Student Placement Preparation and Performance Analytics Portal

> A modern, responsive, role-based full-stack web application designed to help college students excel in campus recruitment drives through AI-powered resume analysis, dynamic interview question generation, daily programming tests in C/C++/Java, company eligibility tracking, and comprehensive staff/admin performance analytics.

---

## 🌟 Key Features

### 1. 🎓 Student Dashboard & Placement Readiness
- **Placement Readiness Indicator**: Multi-factor weighted evaluation across Aptitude (20%), Programming (30%), Core CS (20%), Resume Profile (20%), and Interview Communication (10%).
- **Weakness Detection System**: Automatically pinpoints topics where the student repeatedly drops marks and prescribes customized next steps.
- **Campus Recruitment Drives**: Live tracker for major hiring drives (TCS, Zoho, Infosys, Accenture, Wipro) with recruitment stages, salary ranges, deadlines, and syllabus.
- **Company Eligibility Checker**: Live automated criteria matching against recorded requirements (CGPA cutoff, allowed departments, graduation batch, backlog count, and skill overlap) with clear explanations and disclaimers.
- **Daily Diagnostic Tests**: Timed assessments in C, C++, and Java with instant automatic scoring, detailed solutions, and topic accuracy analytics.
- **Coding Practice Module**: Code editor supporting C, C++, and Java with sample test cases, execution time/memory benchmarking, and transparent execution mode disclosure.
- **Calendar Activity Heatmap**: 90-day learning streaks, weekly score trends, and achievement badges.
- **Personalized Weekly Study Planner**: Interactive checklist linking daily preparation hours directly to upcoming target drives.

### 2. 🤖 AI Resume Analyzer & Personalized Question Generator
- **Secure Resume Ingestion**: Uploads PDF, DOCX, or text files (up to 5MB) securely isolated per student.
- **Automated Skill & Project Extraction**: NLP parser extracts programming languages, web frameworks, databases, cloud tools, certifications, and academic projects.
- **Profile Review & Confirmation**: Students review and confirm their extracted technical profile before assessment generation.
- **Personalized Question Generation**: AI model synthesizes 6 targeted questions based on the student's *actual* declared projects and tech stack across:
  - Resume-based questions
  - Project architectural deep-dive
  - Programming fundamentals (C / C++ / Java)
  - Technical framework questions
  - Algorithmic problem-solving
  - HR & behavioral scenarios
- **Automated Rubric Evaluation**: Written answers are evaluated on **Concept Accuracy**, **Technical Correctness**, and **Clarity**, returning marks, missing points, actionable improvements, and a model answer.
- **Configurable AI Provider**: Works seamlessly with **Google Gemini 1.5 Flash API** or runs on the built-in offline NLP semantic generator when no API key is supplied.

### 3. 👥 Staff & Placement Coordinator Portal
- **Real-Time Operational Overview**: Daily test completion rates, average department scores, and upcoming company drives.
- **Searchable Student Performance Roster**: Multi-filter table (Department, Academic Year, Score Range, Performance Category) with individual student progress drill-downs.
- **"Students Requiring Support" Early Warning System**: Dedicated monitoring page for students scoring below passing thresholds or missing assigned tests. Allows coordinators to assign remedial quizzes, training modules, or private mentoring notes.
- **Company Recruitment Management**: Full CRUD interface for adding drives, configuring multi-stage recruitment rounds, topics, and eligibility rules. Automatically re-evaluates all student eligibility records on update.
- **Export Reports**: One-click tabular exports to **CSV** and **Microsoft Excel (.xlsx)**.

### 4. 🛡️ Admin & Institutional Portal
- **Platform Analytics**: Institution-wide readiness benchmarks, department comparisons, and monthly score trends.
- **User Management**: Student and staff account provisioning, role assignment, and account status toggles (Active / Deactivated).
- **Academic Department Management**: Configuration of engineering departments, codes, and leadership details.
- **Audit Logging**: Comprehensive, timestamped audit trail of administrative actions, role changes, and drive publications.
- **Platform Settings & Connectivity**: Real-time status diagnostics for MongoDB, AI provider, and code execution sandbox.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, REST API, JWT Authentication, bcrypt, Multer |
| **Database** | MongoDB, Mongoose ODM (13 collections with references and indexes) |
| **Document Parsing** | pdf-parse, mammoth (DOCX text extraction) |
| **AI Integration** | Google Gemini 1.5 Flash API + Intelligent Offline Fallback Engine |
| **Code Runner** | Secure execution runner (Supports Judge0/Piston + Safe Mock Mode) |
| **Data Export** | csv-writer, ExcelJS |

---

## 🚀 Quick Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22.x recommended)
- **MongoDB**: Local MongoDB instance running on `localhost:27017` (or a MongoDB Atlas connection URI)

### 1. Clone or Open Project
```bash
cd C:\Users\kavil\.gemini\antigravity\scratch\student-placement-portal
```

### 2. Environment Configuration
Create the backend environment file from the example:

```cmd
copy server\.env.example server\.env
```

Set `JWT_SECRET` in `server/.env` to a unique random value. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The Gemini API key and code execution URL are optional; leave them blank to use the built-in offline behavior.

### 3. Seed the Database
Run the comprehensive seed script to populate 20 realistic student records, 3 staff accounts, 1 admin account, 5 company recruitment drives (TCS, Zoho, Infosys, Accenture, Wipro), question banks, and training courses:

```bash
npm run seed
```

### 4. Start the Application

#### Option A: Run Unified Full-Stack Server (API + Frontend on Port 5000)
```bash
cd server
npm start
```
Visit: **http://localhost:5000**

#### Option B: Run Concurrently with Vite Dev Server (Hot Module Reloading)
In terminal 1 (Backend):
```bash
npm run server
```
In terminal 2 (Frontend):
```bash
npm run client
```
Visit: **http://localhost:5173** (Proxies API calls to port 5000)

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Student (Top Performer)** | `aditya.verma@student.college.edu` | `Password@123` | CGPA: 8.9, 12-day streak, active resume |
| **Student (Intermediate)** | `rohan.gupta@student.college.edu` | `Password@123` | CGPA: 7.4, IT Department |
| **Student (Needs Support)** | `rahul.sharma@student.college.edu` | `Password@123` | CGPA: 5.9, Backlogs, flagged in At-Risk list |
| **Placement Staff** | `placement.coordinator@college.edu` | `Password@123` | Head Placement Coordinator |
| **Coding Trainer** | `trainer.coding@college.edu` | `Password@123` | Technical Interviewer & DSA Coach |
| **Admin** | `admin@college.edu` | `Password@123` | Director of Placements & System Admin |

> 💡 **Quick Switcher**: The navigation bar includes a **"Demo Role" quick-toggle pill** so evaluators and testers can switch between Student, Staff, and Admin roles with a single click without logging out.

---

## 🧪 Running Unit & Integration Tests

Run the native Node.js test suite:
```bash
npm test
```

Expected output:
```
# tests 4
# suites 0
# pass 4
# fail 0
```

---

## 📁 Project Architecture

```
student-placement-portal/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Common UI components (Navbar, Sidebar, StatCard)
│   │   ├── context/            # AuthContext (JWT, session, role switching)
│   │   ├── layouts/            # DashboardLayout (Role-based navigation)
│   │   ├── pages/
│   │   │   ├── auth/           # Login & Student Registration
│   │   │   ├── student/        # Dashboard, Drives, Tests, Coding, AI Resume, LMS
│   │   │   ├── staff/          # Coordinator Overview, Roster, Support List, Reports
│   │   │   └── admin/          # Admin KPIs, Users, Departments, Audit Logs
│   │   ├── services/           # Axios API Client organized by feature
│   │   ├── App.jsx             # Role-guarded routing
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js + Express REST API
│   ├── config/                 # MongoDB connection
│   ├── controllers/            # Feature controllers (auth, student, company, etc.)
│   ├── middleware/             # JWT auth, role authorization, multer, audit
│   ├── models/                 # 13 Mongoose Schemas (User, Company, Resume, etc.)
│   ├── routes/                 # REST API endpoints
│   ├── scripts/                # Database seed script (20 students, 3 staff, admin)
│   ├── services/
│   │   ├── ai/                 # Gemini API + Semantic Offline Fallback Engine
│   │   ├── coding/             # Code Execution Runner & Sandbox Mock
│   │   ├── resume/             # PDF & DOCX Text Extraction
│   │   └── analytics/          # Placement Readiness & Eligibility Evaluators
│   ├── test/                   # Unit & integration tests
│   ├── app.js                  # Express application setup & static build serving
│   ├── server.js               # Server entry point
│   ├── package.json
│   └── .env.example
├── README.md
└── package.json                # Root orchestration scripts
```

---

## 🎓 Recommended Project Title for College Documentation
> **"AI-Powered Student Placement Preparation and Performance Analytics Portal"**
