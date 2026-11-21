# 🏨 Hostel Allotment & Management System

A MERN-stack web application designed to automate and simplify the hostel allotment process in educational institutions. The system provides a structured, transparent and merit-based approach to student applications, verification, hostel allocation, offer management and vacancy handling.

## 📌 Project Overview

The Hostel Allotment & Management System aims to replace manual hostel allocation procedures with a centralized digital platform.

It provides separate interfaces for students and administrators, allowing students to submit hostel applications and administrators to verify applications, generate allotment previews, publish allotments and manage vacancies.

## 🏢 Hostel Capacity

The institution has six hostels with a total capacity of **430 beds**.

| Hostel Type | Number of Hostels | Rooms per Hostel | Beds per Room | Total Beds |
|---|---:|---:|---:|---:|
| Single Seater | 5 | 32 | 1 | 160 |
| Three Seater | 1 | 90 | 3 | 270 |
| **Total** | **6** | **250** | — | **430** |

## ✨ Key Features

### 👨‍🎓 Student Module
- Student registration and login.
- Student profile management.
- Online hostel application submission.
- Marksheet upload.
- Hostel preference selection.
- Application status tracking.
- View hostel allotment details.
- Accept or decline hostel offers.
- View offer deadlines.

### 👨‍💼 Admin Module
- Admin authentication.
- Application management.
- Student application verification and rejection.
- Marksheet viewing.
- CGPA verification.
- Allotment preview before publishing.
- Hostel vacancy management.
- Waitlist management.
- Vacancy release and waitlist promotion.
- Audit logs for administrative activities.

### 🏠 Hostel Allotment Engine
- Merit-based student ranking.
- Preference-based hostel allocation.
- Single-seater hostels are filled before the three-seater hostel.
- Students selecting single-seater only are not assigned three-seater rooms.
- Physically disabled students receive ground-floor eligibility as a mandatory allocation constraint.
- Students without an eligible available bed can be waitlisted.
- Preview functionality allows administrators to inspect allocation results before publishing.

### ⏳ Offer Management
- Allotment offers are generated for selected students.
- Students can accept or decline their offers.
- Offers have a 48-hour response window.
- Declined or expired offers release beds for subsequent eligible students through the waitlist workflow.

### 📋 Audit Logging
Important administrative and allotment activities are recorded, including:
- Application submission.
- Application verification.
- Application rejection.
- Allotment publication.
- Offer acceptance.
- Offer rejection or expiry.

## 📊 Student Scoring System

The allotment engine uses a **90-point merit-based scoring system**.

| Parameter | Maximum Marks |
|---|---:|
| CGPA | 40 |
| Semester | 25 |
| Home Distance | 15 |
| Previous Hostel | 10 |
| **Total** | **90** |

Students are ranked according to their calculated scores before the allotment process.

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- Multer for file uploads

### Database
- MongoDB
- Mongoose

### Development Tools
- Visual Studio Code
- Git
- GitHub
- Postman

## 📂 Project Structure

```text
mini5/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── server.js
│   │
│   ├── uploads/
│   └── package.json
│
├── uploads/
│
└── README.md
```

*The structure above represents the main project organization.*

## ⚙️ Installation and Setup

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MongoDB or MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd mini5
```

### 2. Setup Backend

```bash
cd server
npm install
```

Run `Copy-Item .env.example .env` to create your backend environment file. Update its values, especially MONGO_URI, JWT_SECRET and CLIENT_URL.

Start the backend:

```bash
npm run dev
```

The backend API runs locally at:

```text
http://localhost:5000
```

### 3. Setup Frontend

Open another terminal:

```bash
cd client
npm install
```

Create the frontend `.env` file:

```env
VITE_API_URL=http://127.0.0.1:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend runs locally at:

```text
http://localhost:5173
```

## ⚠️ Database Seeding Warning

The seed script (`server/src/seed/seed.js`) deletes existing hostel, room and bed records before creating new ones.

**Never run `npm run seed` against a database containing existing student allotments or production data.**
## 🔐 Security

- Role-based access for students and administrators.
- Protected API routes.
- JWT-based authentication.
- Authorized marksheet access.
- Server-side application validation.
- Database-level constraints to prevent duplicate active allotments.

**Important:** Never commit `.env` files, authentication secrets, database credentials, uploaded marksheets or private student information to GitHub.

## 🧪 Testing

The project includes automated tests for the scoring service.

Run the tests using:

```bash
cd server
node --test ./src/services/scoringService.test.js
```

Current scoring test results:

- 5 tests passed.
- 0 tests failed.

The frontend production build can be checked using:

```bash
cd client
npm run build
```

## 📸 Application Screenshots

Screenshots of the following application modules will be added after deployment:

1. Student Login and Registration
2. Student Dashboard
3. Hostel Application Form
4. Admin Dashboard
5. Application Verification
6. Allotment Preview
7. Vacancy Management
8. Waitlist Management
9. Student Allotment Details
10. Audit Logs

## 🚀 Deployment

Production deployment is planned using:

- AWS EC2 for backend hosting.
- AWS S3 for frontend hosting.
- AWS CloudFront for frontend delivery.
- MongoDB Atlas for cloud database hosting.

The live application URL will be added after successful deployment.

## 👥 Contributors

This project is developed collaboratively by the following team members:

| Name | GitHub Profile | Role |
|---|---|---|
| Priyanshu Gautam | [@priyanshu-gautam11](https://github.com/priyanshu-gautam11) | Project Lead |
| Deepanshu | [@lambadeepanshu36-hub](https://github.com/lambadeepanshu36-hub) | Contributor |
| Ayush | [@rastogiayush9839-art](https://github.com/rastogiayush9839-art) | Contributor |
| Vansh | [@vansh210106](https://github.com/vansh210106) | Contributor |

**Project:** Hostel Allotment & Management System  
**Technology Stack:** MongoDB, Express.js, React.js, Node.js


## 🎯 Project Objective

The primary objective of this project is to provide a fair, efficient and transparent hostel allotment system that reduces manual administrative work, improves allocation accuracy and simplifies hostel management.

---

**Hostel Allotment & Management System**
B.Tech Computer Science and Engineering
IET Lucknow
