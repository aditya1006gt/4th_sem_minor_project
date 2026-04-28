# Smart College Platform - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Core Features](#core-features)
4. [Installation & Setup](#installation--setup)
5. [Environment Configuration](#environment-configuration)

## Project Overview

Smart College Platform is a comprehensive full-stack web application designed to streamline campus workflows and enhance academic collaboration. The platform serves as a unified portal for students, club administrators, and professors, providing tools for event management, study resource sharing, academic discussions, and research paper exploration.

### What Makes This Platform Unique

- **Role-Based Access Control**: Three distinct user roles (Student, Club Admin, Professor) with tailored permissions
- **AI-Powered Research Tools**: Integration with arXiv API and AI summarization using Groq (Llama 3) and Google Gemini
- **Anonymous Community Forum**: Reddit-style discussion platform with voting and nested comments
- **Event Management System**: Complete workflow from event creation to approval and attendee tracking
- **Study Resource Hub**: Centralized note-sharing system with filtering by branch, semester, and subject

### Target Audience

- **Students**: Access study materials, participate in events, engage in academic discussions, explore research papers
- **Club Administrators**: Create and manage events, share resources with specific branches
- **Professors**: Approve events, moderate forums, contribute academic resources

## Architecture & Tech Stack

### System Architecture

The application follows a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer (React)                   │
│  - Vite Build Tool                                          │
│  - React Router for Navigation                              │
│  - Axios for API Communication                              │
│  - Context API for State Management                         │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                  Backend Layer (Node.js/Express)            │
│  - RESTful API Endpoints                                    │
│  - JWT Authentication Middleware                            │
│  - Multer File Upload Handling                              │
│  - AI Service Integration (Groq + Gemini)                   │
│  - arXiv API Integration                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer (MongoDB)                   │
│  - User Collection                                          │
│  - Event Collection                                         │
│  - Note Collection                                          │
│  - ForumPost Collection                                     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library for building component-based interfaces |
| **Vite** | 5.4.2 | Fast build tool and development server |
| **React Router DOM** | 6.26.0 | Client-side routing and navigation |
| **Axios** | 1.7.2 | HTTP client for API requests |

#### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | LTS | JavaScript runtime environment |
| **Express.js** | 4.19.2 | Web application framework |
| **MongoDB** | - | NoSQL database for data persistence |
| **Mongoose** | 8.5.1 | MongoDB object modeling (ODM) |
| **JWT** | 9.0.2 | JSON Web Token authentication |
| **bcryptjs** | 2.4.3 | Password hashing and encryption |
| **Multer** | 1.4.5-lts.1 | Multipart/form-data file upload handling |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing middleware |
| **QRCode** | 1.5.4 | QR code generation for events |

#### AI & External Services

| Service | Purpose |
|---------|---------|
| **Groq SDK** (1.1.2) | Primary AI provider using Llama 3.3 70B model for research paper summarization |
| **Google GenAI** (1.50.1) | Fallback AI provider using Gemini 2.0 Flash for summarization |
| **arXiv API** | Academic paper search and retrieval |
| **xml2js** (0.6.2) | XML parsing for arXiv API responses |

## Core Features

### 1. Authentication & Authorization System

#### User Registration
- Multi-role registration (Student, Club Admin, Professor)
- Branch-based organization (CSE, ECE, ME, CE, EE, etc.)
- Year/semester tracking for students
- Email uniqueness validation
- Password hashing using bcryptjs (10 salt rounds)

#### User Login
- JWT-based authentication
- Token expiration: 7 days (configurable)
- Secure password comparison
- Persistent sessions via localStorage

#### Role-Based Access Control (RBAC)

**Student Permissions:**
- View approved events for their branch or all-branch events
- Register for events
- Upload and download study notes
- Create forum posts and comments
- Search and summarize research papers

**Club Admin Permissions:**
- All student permissions
- Create events for their branch or all branches
- View event attendee lists for their events
- Delete their own events

**Professor Permissions:**
- All student permissions
- Approve/reject events for their branch
- View all events in their branch
- Delete any forum post or comment (moderation)
- Access event attendee lists for branch events

### 2. Event Management System

#### Event Creation Workflow


```
Club Admin Creates Event → Pending Status → Professor Reviews → Approved/Rejected
                                                                        ↓
                                                              Students Can Register
```

**Event Data Model:**
- Title, Description, Club Name
- Department/Branch (specific or "ALL")
- Start Date, End Date (optional)
- Venue
- Poster Image (uploaded via Multer)
- Status: Pending, Approved, Rejected
- Attendees Array (embedded subdocuments)

**Event Features:**
- Poster upload (stored in `backend/uploads/posters/`)
- Date validation (end date cannot precede start date)
- Branch-specific or all-branch targeting
- Attendee tracking with full user details
- QR code generation capability
- Duplicate registration prevention

#### Event Approval Process

Professors can only approve events that match one of these criteria:
1. Event is for their specific branch
2. Event is marked as "ALL" branches

Status transitions are strictly enforced:
- Only "Pending" events can be approved/rejected
- Once reviewed, status cannot be changed back

#### Event Registration

Students can register for events if:
- Event status is "Approved"
- Event is for their branch OR marked as "ALL"
- They haven't already registered

Registration captures:
- User ID, Name, Email
- Role, Branch, Roll Number, Year
- Submission timestamp

### 3. Notes Sharing System

#### Note Upload
- File upload via Multer (stored in `backend/uploads/notes/`)
- Metadata: Title, Branch, Semester, Subject
- Tag system for categorization
- Uploader tracking (linked to User model)

#### Note Discovery & Filtering

**Available Filters:**
- Branch (CSE, ECE, ME, CE, EE, etc.)
- Semester (1st through 8th)
- Subject (free text)
- Tags (array matching)
- Search (regex across title, subject, tags)

**Note Data Model:**
```javascript
{
  title: String,
  filePath: String,
  fileUrl: String,
  uploaderId: ObjectId (ref: User),
  branch: String (enum),
  semester: String (enum),
  subject: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

#### Note Download
- Secure file serving via Express static middleware
- Direct download endpoint with path resolution
- Access control via JWT authentication

### 4. Community Forum System

#### Forum Architecture

The forum implements a Reddit-style discussion platform with:
- **Anonymous Posting**: Auto-generated usernames (e.g., "User1234")
- **Voting System**: Upvotes and downvotes for posts and comments
- **Nested Comments**: Support for parent-child comment relationships
- **Point Calculation**: Score = Upvotes - Downvotes

#### Forum Post Features


**Post Creation:**
- Title and body (required)
- Automatic anonymous name generation
- Author ID tracking (hidden from public view)
- Timestamp tracking

**Voting Mechanism:**
- Toggle behavior: Click upvote again to remove vote
- Mutual exclusivity: Upvoting removes downvote and vice versa
- Real-time point calculation
- Vote tracking per user (prevents duplicate votes)

**Comment System:**
- Nested comment support via `parentCommentId`
- Independent voting for each comment
- Anonymous names for comment authors
- Timestamp tracking

**Moderation:**
- Professors can delete any post or comment
- Post authors can delete their own posts
- Comment authors can delete their own comments
- Post authors can delete comments on their posts

**Sorting Options:**
- Recent (default): Sort by creation date (newest first)
- Oldest: Sort by creation date (oldest first)
- Top: Sort by points (highest first)

**Share Functionality:**
- Generate shareable URLs for posts
- URL format: `{CLIENT_URL}/community?post={postId}`

### 5. Research Paper Explorer with AI Summarization

This is one of the most advanced features of the platform, integrating multiple external services to provide students with powerful research tools.

#### arXiv Integration

**What is arXiv?**
arXiv (pronounced "archive") is a free distribution service and open-access archive for scholarly articles in physics, mathematics, computer science, quantitative biology, quantitative finance, statistics, electrical engineering, systems science, and economics.

**How the Integration Works:**

1. **Search Query Processing:**
   ```javascript
   // User enters search term (e.g., "machine learning")
   const url = `http://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=${limit}&sortBy=relevance&sortOrder=descending`;
   ```

2. **XML Response Parsing:**
   - arXiv returns data in Atom XML format
   - xml2js library converts XML to JavaScript objects
   - Handles single entry (object) vs multiple entries (array)

3. **Data Extraction:**
   ```javascript
   {
     id: "http://arxiv.org/abs/2301.12345",
     title: "Paper Title",
     summary: "Abstract text...",
     authors: ["Author 1", "Author 2"],
     published: "2023-01-15T00:00:00Z",
     pdfLink: "http://arxiv.org/pdf/2301.12345.pdf"
   }
   ```

4. **PDF Link Construction:**
   - Primary: Extract from link elements with title="pdf"
   - Fallback: Convert abstract URL to PDF URL
   - Format: Replace `/abs/` with `/pdf/` and append `.pdf`

**Search Capabilities:**
- Search across all fields (title, abstract, authors, comments)
- Relevance-based sorting
- Configurable result limits (default: 10, max: 12 in UI)
- Real-time search without database storage

#### AI Summarization System

The platform uses a sophisticated dual-provider AI system for generating student-friendly research paper summaries.

**Primary Provider: Groq (Llama 3.3 70B)**

Groq provides ultra-fast inference using their custom LPU (Language Processing Unit) architecture.

**Configuration:**
```javascript
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const completion = await groq.chat.completions.create({
  messages: [{ role: 'user', content: SUMMARY_PROMPT }],
  model: 'llama-3.3-70b-versatile',
  temperature: 0.6,
  max_tokens: 1800,
});
```

**Why Groq?**
- Extremely fast inference (10-100x faster than traditional cloud providers)
- High-quality outputs from Llama 3.3 70B model
- Cost-effective for educational use
- Reliable API with good uptime

**Fallback Provider: Google Gemini 2.0 Flash**

If Groq fails (API down, rate limit, network error), the system automatically falls back to Google's Gemini.

**Configuration:**
```javascript
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await genAI.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: SUMMARY_PROMPT,
});
```

**Why Gemini as Fallback?**
- High reliability and uptime
- Fast inference with Flash model
- Good quality summaries
- Generous free tier for development

**The Summarization Prompt:**

The system uses a carefully crafted prompt to ensure consistent, educational summaries:

```
You are an expert academic researcher. Based on the following research paper, 
provide a clear and structured summary that is easy for a student to understand.

Paper Title: "{title}"
Abstract: "{abstract}"

Please provide:
1. Overview: A 2-3 sentence plain-language explanation
2. Problem: What specific problem is this paper trying to solve?
3. Methodology: How did the researchers approach solving the problem?
4. Key Findings: List the 5 most important results or contributions
5. Limitations: What are the known limitations or weaknesses?
6. Real-World Impact: Why does this research matter? Who does it benefit?
7. Future Work: What follow-up research directions do the authors suggest?
```

**Summary Structure:**
- Numbered sections for easy navigation
- Plain language explanations
- Student-focused perspective
- Comprehensive coverage of paper aspects
- Actionable insights

**Error Handling:**
```javascript
try {
  // Try Groq first
  return { summary, provider: 'Groq (Llama 3)' };
} catch (groqError) {
  console.warn('Groq failed, trying Gemini...');
  try {
    // Fallback to Gemini
    return { summary, provider: 'Google Gemini' };
  } catch (geminiError) {
    throw new Error('All AI providers failed');
  }
}
```

**Provider Attribution:**
The system returns which provider generated the summary, displayed to users for transparency.

## Installation & Setup

### Prerequisites

Before installing, ensure you have:
- **Node.js**: v18.x or higher (LTS recommended)
- **npm**: v9.x or higher (comes with Node.js)
- **MongoDB**: v6.x or higher
  - Local installation OR MongoDB Atlas account
- **Git**: For cloning the repository

### Step 1: Clone the Repository

```bash
git clone <repository_url>
cd "4th Sem Minor Project"
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

**Installed Dependencies:**
- express, mongoose, cors, dotenv
- jsonwebtoken, bcryptjs
- multer, qrcode
- groq-sdk, @google/genai
- axios, xml2js

**Dev Dependencies:**
- nodemon (for auto-restart during development)

### Step 3: Frontend Setup

```bash
cd ../frontend
npm install
```

**Installed Dependencies:**
- react, react-dom
- react-router-dom
- axios

**Dev Dependencies:**
- vite, @vitejs/plugin-react

### Step 4: MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod --dbpath /path/to/data/directory

# MongoDB will run on mongodb://127.0.0.1:27017
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at mongodb.com/cloud/atlas
2. Create a free cluster
3. Add database user
4. Whitelist IP address (0.0.0.0/0 for development)
5. Get connection string

### Step 5: Environment Configuration

**Backend Environment (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart-college-platform
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**Frontend Environment (.env):**
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_ORIGIN=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

### Step 6: Obtain API Keys

**Groq API Key:**
1. Visit https://console.groq.com
2. Sign up for free account
3. Navigate to API Keys section
4. Create new API key
5. Copy key to `GROQ_API_KEY` in backend/.env

**Google Gemini API Key:**
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create API key
4. Copy key to `GEMINI_API_KEY` in backend/.env

### Step 7: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Output:
```
Server running on port 5000
MongoDB connected successfully
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Output:
```
VITE v5.4.2  ready in 500 ms
➜  Local:   http://localhost:5173/
```

### Step 8: Access the Application

Open browser and navigate to: `http://localhost:5173`

**First-Time Setup:**
1. Click "Register" to create an account
2. Fill in details (name, email, password, branch, role)
3. Login with credentials
4. Explore the platform!

## Environment Configuration

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Port for Express server |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | No | 7d | JWT token expiration (e.g., 7d, 24h, 60m) |
| `CLIENT_URL` | Yes | - | Frontend URL for CORS |
| `GROQ_API_KEY` | Yes* | - | Groq API key for AI summarization |
| `GEMINI_API_KEY` | Yes* | - | Google Gemini API key (fallback) |

*At least one AI provider key is required for research paper summarization feature.

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_ORIGIN` | Yes | - | Backend server base URL |
| `VITE_API_URL` | Yes | - | Backend API base URL (with /api) |

### Security Best Practices

**Development:**
- Use placeholder secrets
- MongoDB on localhost
- CORS allows localhost origins
- Commit .env.example, not .env

**Production:**
- Generate strong JWT_SECRET (32+ random characters)
- Use MongoDB Atlas with authentication
- Restrict CORS to specific frontend domain
- Use environment variables from hosting platform
- Enable HTTPS for all connections
- Rotate API keys regularly
- Set up rate limiting
- Enable MongoDB authentication

### Branch Constants

The platform supports these academic branches:
```javascript
['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'BT', 'CHE', 'PIE', 'TT', 'IPE', 'ALL']
```

- CSE: Computer Science Engineering
- ECE: Electronics and Communication Engineering
- ME: Mechanical Engineering
- CE: Civil Engineering
- EE: Electrical Engineering
- IT: Information Technology
- BT: Biotechnology
- CHE: Chemical Engineering
- PIE: Production and Industrial Engineering
- TT: Textile Technology
- IPE: Instrumentation and Process Engineering
- ALL: All branches (for events)

### Semester Constants

```javascript
['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
```

---

**For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

**For AI integration details, see [AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md)**
