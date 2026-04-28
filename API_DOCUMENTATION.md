# API Documentation - Smart College Platform

## Table of Contents
1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Auth Endpoints](#auth-endpoints)
4. [Event Endpoints](#event-endpoints)
5. [Notes Endpoints](#notes-endpoints)
6. [Forum Endpoints](#forum-endpoints)
7. [Research Paper Endpoints](#research-paper-endpoints)
8. [Error Handling](#error-handling)

## API Overview

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email already exists) |
| 500 | Internal Server Error | Server-side error |

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

**Protected Routes:**
- All `/api/events/*` endpoints
- All `/api/notes/*` endpoints
- All `/api/forum/*` endpoints
- All `/api/research-papers/*` endpoints

**Public Routes:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health`

## Auth Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "student",
  "rollNumber": "21CS001",
  "branch": "CSE",
  "year": "3rd"
}
```

**Field Validation:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | String | Yes | Non-empty, trimmed |
| email | String | Yes | Valid email, unique, lowercase |
| password | String | Yes | Min 6 characters |
| role | String | No | Enum: student, club_admin, professor (default: student) |
| rollNumber | String | Conditional | Required if role != professor |
| branch | String | Yes | Valid branch code (CSE, ECE, etc.) |
| year | String | Conditional | Required if role != professor |

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "rollNumber": "21CS001",
    "branch": "CSE",
    "year": "3rd"
  }
}
```

**Error Responses:**

400 - Missing required fields:
```json
{
  "message": "Name, email, password, and branch are required"
}
```

400 - Invalid branch:
```json
{
  "message": "Invalid branch selected"
}
```

409 - Email already exists:
```json
{
  "message": "User already exists with this email"
}
```

### Login User

Authenticate existing user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "rollNumber": "21CS001",
    "branch": "CSE",
    "year": "3rd"
  }
}
```

**Error Responses:**

400 - Missing credentials:
```json
{
  "message": "Email and password are required"
}
```

401 - Invalid credentials:
```json
{
  "message": "Invalid email or password"
}
```

## Event Endpoints

### Create Event

Create a new event (requires club_admin role).

**Endpoint:** `POST /api/events`

**Authentication:** Required (club_admin only)

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
```javascript
const formData = new FormData();
formData.append('title', 'Tech Fest 2024');
formData.append('description', 'Annual technical festival');
formData.append('clubName', 'Tech Club');
formData.append('startDate', '2024-03-15T10:00:00Z');
formData.append('endDate', '2024-03-17T18:00:00Z');
formData.append('venue', 'Main Auditorium');
formData.append('targetBranch', 'ALL'); // or specific branch
formData.append('poster', posterFile); // File object
```

**Field Details:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | String | Yes | Event name |
| description | String | Yes | Event details |
| clubName | String | Yes | Organizing club name |
| startDate | ISO Date | Yes | Event start date/time |
| endDate | ISO Date | No | Event end date/time |
| venue | String | Yes | Event location |
| targetBranch | String | No | "ALL" or specific branch (defaults to user's branch) |
| poster | File | No | Event poster image |

**Success Response (201):**
```json
{
  "message": "Event created and submitted for approval",
  "event": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Tech Fest 2024",
    "description": "Annual technical festival",
    "clubName": "Tech Club",
    "branch": "CSE",
    "department": "CSE",
    "creatorId": "507f1f77bcf86cd799439012",
    "createdBy": "507f1f77bcf86cd799439012",
    "startDate": "2024-03-15T10:00:00.000Z",
    "endDate": "2024-03-17T18:00:00.000Z",
    "venue": "Main Auditorium",
    "status": "Pending",
    "posterPath": "uploads/posters/1234567890-poster.jpg",
    "attendees": [],
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**

400 - Invalid date range:
```json
{
  "message": "End date cannot be before start date"
}
```

403 - Insufficient permissions:
```json
{
  "message": "Only branch admins can create events"
}
```

### Get Approved Events

Retrieve all approved events visible to the current user.

**Endpoint:** `GET /api/events`

**Authentication:** Required

**Query Parameters:** None

**Success Response (200):**
```json
{
  "events": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Tech Fest 2024",
      "description": "Annual technical festival",
      "clubName": "Tech Club",
      "branch": "CSE",
      "status": "Approved",
      "startDate": "2024-03-15T10:00:00.000Z",
      "endDate": "2024-03-17T18:00:00.000Z",
      "venue": "Main Auditorium",
      "posterPath": "uploads/posters/1234567890-poster.jpg",
      "creatorId": {
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "isRegistered": false,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

**Filtering Logic:**
- Students see events for their branch OR "ALL" branch events
- Club admins and professors see all approved events

### Get Managed Events

Retrieve events managed by the current user.

**Endpoint:** `GET /api/events/manage`

**Authentication:** Required (club_admin or professor)

**Success Response (200):**
```json
{
  "events": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Tech Fest 2024",
      "status": "Pending",
      "branch": "CSE",
      "creatorId": { /* user details */ },
      "attendees": [],
      /* ... other event fields ... */
    }
  ]
}
```

**Access Logic:**
- Club admins see events they created
- Professors see all events for their branch

### Approve/Reject Event

Update event approval status (professors only).

**Endpoint:** `PATCH /api/events/:eventId/approval`

**Authentication:** Required (professor only, same branch as event)

**Request Body:**
```json
{
  "status": "Approved"
}
```

**Valid Status Values:** "Approved", "Rejected"

**Success Response (200):**
```json
{
  "message": "Event Approved successfully",
  "event": { /* updated event object */ }
}
```

**Error Responses:**

400 - Already reviewed:
```json
{
  "message": "This event has already been reviewed"
}
```

403 - Wrong branch:
```json
{
  "message": "Professors can only approve or reject events from their own branch"
}
```

404 - Event not found:
```json
{
  "message": "Event not found"
}
```

### Register for Event

Register current user for an approved event.

**Endpoint:** `POST /api/events/:eventId/register`

**Authentication:** Required

**Request Body (optional - uses user data if not provided):**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "branch": "CSE",
  "rollNumber": "21CS001",
  "year": "3rd"
}
```

**Success Response (201):**
```json
{
  "message": "Event form submitted successfully",
  "registration": {
    "userId": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "branch": "CSE",
    "rollNumber": "21CS001",
    "year": "3rd",
    "submittedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**

404 - Event not found or not approved:
```json
{
  "message": "Approved event not found"
}
```

403 - Branch mismatch:
```json
{
  "message": "You can only register for events in your branch or all-branch events"
}
```

409 - Already registered:
```json
{
  "message": "Form already submitted for this event"
}
```

### Get Event Attendees

Retrieve list of registered attendees for an event.

**Endpoint:** `GET /api/events/:eventId/attendees`

**Authentication:** Required (event creator or professor of same branch)

**Success Response (200):**
```json
{
  "eventId": "507f1f77bcf86cd799439011",
  "title": "Tech Fest 2024",
  "attendees": [
    {
      "userId": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "student",
      "branch": "CSE",
      "rollNumber": "21CS001",
      "year": "3rd",
      "submittedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

403 - Unauthorized access:
```json
{
  "message": "You are not allowed to view submissions for this event"
}
```

### Delete Event

Delete an event (creator or professor of same branch).

**Endpoint:** `DELETE /api/events/:eventId`

**Authentication:** Required (event creator or professor)

**Success Response (200):**
```json
{
  "message": "Event deleted successfully"
}
```

**Error Responses:**

403 - Insufficient permissions:
```json
{
  "message": "You are not allowed to delete this event"
}
```

404 - Event not found:
```json
{
  "message": "Event not found"
}
```

## Notes Endpoints

### Upload Note

Upload a new study note with file attachment.

**Endpoint:** `POST /api/notes`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
```javascript
const formData = new FormData();
formData.append('title', 'Data Structures Notes');
formData.append('branch', 'CSE');
formData.append('semester', '3rd');
formData.append('subject', 'Data Structures and Algorithms');
formData.append('tags', 'algorithms,trees,graphs'); // comma-separated
formData.append('file', noteFile); // File object
```

**Success Response (201):**
```json
{
  "message": "Note uploaded successfully",
  "note": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Data Structures Notes",
    "filePath": "uploads/notes/1234567890-notes.pdf",
    "fileUrl": "uploads/notes/1234567890-notes.pdf",
    "uploaderId": "507f1f77bcf86cd799439012",
    "branch": "CSE",
    "semester": "3rd",
    "subject": "Data Structures and Algorithms",
    "tags": ["algorithms", "trees", "graphs"],
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**

400 - Missing file:
```json
{
  "message": "A note file is required"
}
```

400 - Invalid branch:
```json
{
  "message": "Invalid branch selected"
}
```

400 - Invalid semester:
```json
{
  "message": "Invalid semester selected"
}
```

### Get Notes

Retrieve notes with optional filtering.

**Endpoint:** `GET /api/notes`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| branch | String | Filter by branch | `?branch=CSE` |
| semester | String | Filter by semester | `?semester=3rd` |
| subject | String | Filter by subject | `?subject=Data Structures` |
| tag | String | Filter by tag | `?tag=algorithms` |
| search | String | Search in title, subject, tags | `?search=algorithm` |

**Example Request:**
```
GET /api/notes?branch=CSE&semester=3rd&search=data
```

**Success Response (200):**
```json
{
  "notes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Data Structures Notes",
      "fileUrl": "uploads/notes/1234567890-notes.pdf",
      "branch": "CSE",
      "semester": "3rd",
      "subject": "Data Structures and Algorithms",
      "tags": ["algorithms", "trees", "graphs"],
      "uploaderId": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "rollNumber": "21CS001",
        "branch": "CSE",
        "year": "3rd"
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Note by ID

Retrieve detailed information about a specific note.

**Endpoint:** `GET /api/notes/:noteId`

**Authentication:** Required

**Success Response (200):**
```json
{
  "note": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Data Structures Notes",
    "fileUrl": "uploads/notes/1234567890-notes.pdf",
    "branch": "CSE",
    "semester": "3rd",
    "subject": "Data Structures and Algorithms",
    "tags": ["algorithms", "trees", "graphs"],
    "uploaderId": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "rollNumber": "21CS001",
      "branch": "CSE",
      "year": "3rd"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Response:**

404 - Note not found:
```json
{
  "message": "Note not found"
}
```

### Download Note

Download the note file.

**Endpoint:** `GET /api/notes/:noteId/download`

**Authentication:** Required

**Success Response (200):**
- Content-Type: Based on file type
- Content-Disposition: attachment; filename="..."
- Binary file data

**Error Response:**

404 - Note not found:
```json
{
  "message": "Note not found"
}
```

500 - File not accessible:
```json
{
  "message": "Failed to download note"
}
```

---

**Continued in next section...**


## Forum Endpoints

### Create Forum Post

Create a new discussion post with anonymous identity.

**Endpoint:** `POST /api/forum`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "How to prepare for placement interviews?",
  "body": "I'm in my final year and looking for tips on technical interview preparation. What resources do you recommend?"
}
```

**Success Response (201):**
```json
{
  "message": "Forum post created successfully",
  "post": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "How to prepare for placement interviews?",
    "body": "I'm in my final year and looking for tips...",
    "anonymousName": "User1234",
    "points": 0,
    "score": 0,
    "upvotes": 0,
    "downvotes": 0,
    "comments": [],
    "commentCount": 0,
    "canDelete": true,
    "shareUrl": "http://localhost:3000/community?post=507f1f77bcf86cd799439011",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Field Descriptions:**
- `anonymousName`: Auto-generated (format: User + 4 random digits)
- `points`: Calculated as upvotes - downvotes
- `canDelete`: True if user is post author or professor
- `shareUrl`: Shareable link to the post

### Get All Forum Posts

Retrieve all forum posts with optional sorting.

**Endpoint:** `GET /api/forum`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Values | Default | Description |
|-----------|------|--------|---------|-------------|
| sortBy | String | recent, oldest, top | recent | Sort order |

**Example Requests:**
```
GET /api/forum                    # Recent posts (default)
GET /api/forum?sortBy=top         # Highest scored posts
GET /api/forum?sortBy=oldest      # Oldest posts first
```

**Success Response (200):**
```json
{
  "posts": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "How to prepare for placement interviews?",
      "body": "I'm in my final year...",
      "anonymousName": "User1234",
      "points": 15,
      "score": 15,
      "upvotes": 18,
      "downvotes": 3,
      "comments": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "body": "Start with LeetCode and practice daily",
          "anonymousName": "User5678",
          "parentCommentId": null,
          "upvotes": 5,
          "downvotes": 0,
          "points": 5,
          "canDelete": false,
          "createdAt": "2024-01-15T11:00:00.000Z",
          "updatedAt": "2024-01-15T11:00:00.000Z"
        }
      ],
      "commentCount": 1,
      "canDelete": false,
      "shareUrl": "http://localhost:3000/community?post=507f1f77bcf86cd799439011",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Forum Post by ID

Retrieve a specific forum post with all comments.

**Endpoint:** `GET /api/forum/:postId`

**Authentication:** Required

**Success Response (200):**
```json
{
  "post": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "How to prepare for placement interviews?",
    "body": "I'm in my final year...",
    "anonymousName": "User1234",
    "points": 15,
    "upvotes": 18,
    "downvotes": 3,
    "comments": [ /* array of comments */ ],
    "commentCount": 5,
    "canDelete": true,
    "shareUrl": "http://localhost:3000/community?post=507f1f77bcf86cd799439011",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Response:**

404 - Post not found:
```json
{
  "message": "Forum post not found"
}
```

### Add Comment to Post

Add a comment or reply to a forum post.

**Endpoint:** `POST /api/forum/:postId/comments`

**Authentication:** Required

**Request Body:**

Top-level comment:
```json
{
  "body": "Great question! I recommend starting with data structures."
}
```

Reply to comment:
```json
{
  "body": "I agree, especially trees and graphs.",
  "parentCommentId": "507f1f77bcf86cd799439012"
}
```

**Success Response (201):**
```json
{
  "message": "Comment added successfully",
  "comments": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "body": "Great question! I recommend starting with data structures.",
      "anonymousName": "User9012",
      "parentCommentId": null,
      "upvotes": 0,
      "downvotes": 0,
      "points": 0,
      "canDelete": true,
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

404 - Post not found:
```json
{
  "message": "Forum post not found"
}
```

400 - Invalid parent comment:
```json
{
  "message": "Parent comment does not exist"
}
```

### Vote on Post

Upvote or downvote a forum post.

**Endpoint:** `PATCH /api/forum/:postId/vote`

**Authentication:** Required

**Request Body:**
```json
{
  "voteType": "upvote"
}
```

**Valid voteType values:** "upvote", "downvote"

**Voting Behavior:**
- Clicking upvote when already upvoted: Removes upvote
- Clicking downvote when already downvoted: Removes downvote
- Clicking upvote when downvoted: Removes downvote, adds upvote
- Clicking downvote when upvoted: Removes upvote, adds downvote

**Success Response (200):**
```json
{
  "message": "Post vote updated successfully",
  "upvotes": 19,
  "downvotes": 3,
  "points": 16,
  "score": 16
}
```

**Error Responses:**

400 - Invalid vote type:
```json
{
  "message": "voteType must be upvote or downvote"
}
```

404 - Post not found:
```json
{
  "message": "Forum post not found"
}
```

### Vote on Comment

Upvote or downvote a comment.

**Endpoint:** `PATCH /api/forum/:postId/comments/:commentId/vote`

**Authentication:** Required

**Request Body:**
```json
{
  "voteType": "upvote"
}
```

**Success Response (200):**
```json
{
  "message": "Comment vote updated successfully",
  "upvotes": 6,
  "downvotes": 0,
  "score": 6
}
```

**Error Responses:**

404 - Post not found:
```json
{
  "message": "Forum post not found"
}
```

404 - Comment not found:
```json
{
  "message": "Comment not found"
}
```

### Get Share URL

Generate a shareable URL for a forum post.

**Endpoint:** `GET /api/forum/:postId/share`

**Authentication:** Required

**Success Response (200):**
```json
{
  "shareUrl": "http://localhost:3000/community?post=507f1f77bcf86cd799439011"
}
```

### Delete Forum Post

Delete a forum post (author or professor only).

**Endpoint:** `DELETE /api/forum/:postId`

**Authentication:** Required

**Authorization:**
- Post author can delete their own post
- Professors can delete any post (moderation)

**Success Response (200):**
```json
{
  "message": "Post deleted successfully"
}
```

**Error Responses:**

403 - Insufficient permissions:
```json
{
  "message": "You are not allowed to delete this post"
}
```

404 - Post not found:
```json
{
  "message": "Forum post not found"
}
```

### Delete Comment

Delete a comment from a forum post.

**Endpoint:** `DELETE /api/forum/:postId/comments/:commentId`

**Authentication:** Required

**Authorization:**
- Comment author can delete their own comment
- Post author can delete comments on their post
- Professors can delete any comment (moderation)

**Success Response (200):**
```json
{
  "message": "Comment deleted successfully"
}
```

**Error Responses:**

403 - Insufficient permissions:
```json
{
  "message": "You are not allowed to delete this comment"
}
```

404 - Post or comment not found:
```json
{
  "message": "Forum post not found"
}
```
```json
{
  "message": "Comment not found"
}
```

## Research Paper Endpoints

### Search Papers

Search for academic papers on arXiv.

**Endpoint:** `GET /api/research-papers/search`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| q | String | Yes | Search query | `?q=machine learning` |
| limit | Number | No | Max results (default: 10) | `?limit=20` |

**Example Request:**
```
GET /api/research-papers/search?q=quantum computing&limit=15
```

**Success Response (200):**
```json
{
  "papers": [
    {
      "id": "http://arxiv.org/abs/2301.12345",
      "title": "Advances in Quantum Computing Algorithms",
      "summary": "This paper presents novel approaches to quantum algorithm design...",
      "authors": [
        "John Smith",
        "Jane Doe",
        "Robert Johnson"
      ],
      "published": "2023-01-15T00:00:00Z",
      "pdfLink": "http://arxiv.org/pdf/2301.12345.pdf"
    }
  ],
  "total": 15,
  "query": "quantum computing"
}
```

**Field Descriptions:**
- `id`: arXiv paper identifier URL
- `title`: Paper title (newlines removed, trimmed)
- `summary`: Paper abstract (newlines removed, trimmed)
- `authors`: Array of author names
- `published`: Publication date in ISO format
- `pdfLink`: Direct link to PDF on arXiv

**Error Responses:**

400 - Missing query:
```json
{
  "message": "Search query is required."
}
```

500 - arXiv API error:
```json
{
  "message": "Failed to search papers. Please try again."
}
```

### Summarize Paper

Generate an AI-powered summary of a research paper.

**Endpoint:** `POST /api/research-papers/summarize`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Advances in Quantum Computing Algorithms",
  "abstract": "This paper presents novel approaches to quantum algorithm design focusing on optimization problems. We introduce three new algorithms that demonstrate significant improvements in computational complexity..."
}
```

**AI Processing Flow:**
1. Try Groq (Llama 3.3 70B) first
2. If Groq fails, fallback to Google Gemini 2.0 Flash
3. Return summary with provider attribution

**Success Response (200):**
```json
{
  "summary": "**Overview**: This research introduces three innovative quantum algorithms designed to solve complex optimization problems more efficiently than classical approaches.\n\n**Problem**: Traditional quantum algorithms struggle with certain classes of optimization problems, particularly those involving large-scale combinatorial challenges.\n\n**Methodology**: The researchers developed three distinct algorithmic approaches: (1) A hybrid quantum-classical framework, (2) A novel qubit encoding scheme, and (3) An adaptive error mitigation technique.\n\n**Key Findings**:\n1. Algorithm 1 reduces computational complexity from O(n³) to O(n²log n)\n2. The new qubit encoding improves gate fidelity by 15%\n3. Error rates decreased by 40% compared to baseline methods\n4. Scalability tests showed linear improvement up to 100 qubits\n5. Real-world optimization problems solved 3x faster\n\n**Limitations**: The algorithms require quantum hardware with at least 50 qubits and specific error correction capabilities. Current NISQ devices may not fully support implementation.\n\n**Real-World Impact**: These algorithms could accelerate drug discovery, financial modeling, and logistics optimization. Industries dealing with complex scheduling and resource allocation problems would benefit significantly.\n\n**Future Work**: The authors suggest exploring applications in quantum machine learning and investigating hybrid approaches that combine these algorithms with classical heuristics.",
  "provider": "Groq (Llama 3)"
}
```

**Summary Structure:**
The AI generates summaries with these sections:
1. **Overview**: 2-3 sentence plain-language explanation
2. **Problem**: Specific problem being addressed
3. **Methodology**: Research approach and methods
4. **Key Findings**: 5 most important results (numbered list)
5. **Limitations**: Known weaknesses or constraints
6. **Real-World Impact**: Practical applications and beneficiaries
7. **Future Work**: Suggested research directions

**Provider Attribution:**
- "Groq (Llama 3)" - Primary provider
- "Google Gemini" - Fallback provider

**Error Responses:**

400 - Missing required fields:
```json
{
  "message": "Paper title and abstract are required."
}
```

500 - All AI providers failed:
```json
{
  "message": "All AI summarization providers failed. Please try again later."
}
```

**AI Configuration Details:**

Groq Configuration:
- Model: llama-3.3-70b-versatile
- Temperature: 0.6 (balanced creativity/consistency)
- Max Tokens: 1800 (comprehensive summaries)

Gemini Configuration:
- Model: gemini-2.0-flash
- Uses same prompt as Groq for consistency

## Error Handling

### Global Error Handler

The API includes a global error handler that catches:
- Multer errors (file upload issues)
- Validation errors
- Unexpected errors

### Common Error Patterns

**Validation Errors (400):**
```json
{
  "message": "Validation failed: email: Email is required"
}
```

**Authentication Errors (401):**
```json
{
  "message": "Authorization token is missing"
}
```
```json
{
  "message": "Invalid token user"
}
```
```json
{
  "message": "Unauthorized access"
}
```

**Authorization Errors (403):**
```json
{
  "message": "Access denied for role: student"
}
```

**Resource Not Found (404):**
```json
{
  "message": "Resource not found"
}
```

**Conflict Errors (409):**
```json
{
  "message": "User already exists with this email"
}
```

**Server Errors (500):**
```json
{
  "message": "Failed to perform operation",
  "error": "Detailed error message (development only)"
}
```

### File Upload Errors

**Multer Errors:**
```json
{
  "message": "File too large"
}
```
```json
{
  "message": "Invalid file type"
}
```
```json
{
  "message": "Too many files"
}
```

### Best Practices for Error Handling

**Client-Side:**
1. Always check response status code
2. Parse error messages for user display
3. Implement retry logic for 500 errors
4. Handle 401 by redirecting to login
5. Show user-friendly error messages

**Example Error Handling (JavaScript):**
```javascript
try {
  const response = await axios.post('/api/auth/login', credentials);
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data.message;
    
    if (status === 401) {
      // Invalid credentials
      showError('Invalid email or password');
    } else if (status === 500) {
      // Server error
      showError('Server error. Please try again later.');
    } else {
      // Other errors
      showError(message);
    }
  } else if (error.request) {
    // Request made but no response
    showError('Network error. Please check your connection.');
  } else {
    // Other errors
    showError('An unexpected error occurred.');
  }
}
```

## Rate Limiting

Currently, the API does not implement rate limiting. For production deployment, consider:
- Implementing rate limiting middleware (e.g., express-rate-limit)
- Setting appropriate limits per endpoint
- Different limits for authenticated vs. unauthenticated requests
- Special handling for AI endpoints (higher cost)

## CORS Configuration

The API uses CORS middleware with the following configuration:

```javascript
cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
})
```

**Development:** Allows all origins (*)
**Production:** Should be restricted to specific frontend domain

## File Upload Configuration

**Multer Configuration:**

Poster uploads (events):
- Destination: `backend/uploads/posters/`
- Filename: `{timestamp}-{originalname}`
- Field name: `poster`

Note uploads:
- Destination: `backend/uploads/notes/`
- Filename: `{timestamp}-{originalname}`
- Field name: `file`

**Recommendations for Production:**
- Add file size limits
- Validate file types (MIME type checking)
- Implement virus scanning
- Use cloud storage (AWS S3, Google Cloud Storage)
- Generate unique filenames (UUID)
- Implement file cleanup for deleted resources

## API Versioning

Current API version: v1 (implicit)

For future versions, consider:
- URL versioning: `/api/v2/...`
- Header versioning: `Accept: application/vnd.api+json; version=2`
- Maintain backward compatibility
- Deprecation notices for old endpoints

## Testing the API

### Using cURL

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "branch": "CSE",
    "rollNumber": "21CS001",
    "year": "3rd"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Events (with auth):**
```bash
curl -X GET http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the API endpoints
2. Set up environment variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (set after login)
3. Use {{base_url}} and {{token}} in requests
4. Create a collection for each resource

### Using JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example: Search papers
const searchPapers = async (query) => {
  const response = await api.get('/research-papers/search', {
    params: { q: query, limit: 10 }
  });
  return response.data;
};
```

---

**For AI integration details, see [AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md)**
