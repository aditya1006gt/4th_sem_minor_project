# Smart College Platform

## Description

Smart College Platform is a full-stack web application built to streamline common campus workflows in one place. It combines student authentication, event management, study note sharing, and forum-based collaboration into a single portal designed for local development today and production deployment later.

This project uses a React frontend and a Node.js/Express backend with MongoDB for persistent storage. It is structured as a monorepo with separate `frontend` and `backend` applications.

## Features

- Role-based authentication for students, club admins, and professors
- Secure login and registration with JWT-based authentication
- Event creation, approval, registration, and attendee management
- Notes upload, listing, detail view, and download support
- Forum posting, commenting, and voting features
- QR code dependency in the backend for event-related workflows
- Protected frontend routes for authenticated user access
- File upload handling for posters and notes

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router DOM, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT, bcryptjs |
| File Uploads | Multer |
| Development Tools | Nodemon, npm |

## Installation

### Prerequisites

- Node.js (recommended: current LTS version)
- npm
- MongoDB installed locally or a MongoDB Atlas connection string

### Step-by-Step Setup

1. Clone the repository:

```bash
git clone <your_repository_url>
cd "4th Sem Minor Project"
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Create the backend environment file:

```bash
copy .env.example .env
```

4. Update `backend/.env` with your local or production values.

5. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

6. Create the frontend environment file:

```bash
copy .env.example .env
```

7. Update `frontend/.env` so the frontend points to the correct backend API origin.

## Usage

### Run the Backend

```bash
cd backend
npm run dev
```

The backend runs on the configured `PORT` and exposes the API under `/api`.

### Run the Frontend

```bash
cd frontend
npm run dev
```

The frontend Vite dev server usually runs on `http://localhost:5173` unless configured otherwise.

### Production Notes

- For production, use `npm start` in the backend instead of `npm run dev`.
- Replace local MongoDB URLs with a secure managed database connection string.
- Set a strong private JWT secret and restrict CORS to trusted frontend origins only.
- Store environment variables through your hosting platform or server configuration, not in committed `.env` files.

## Environment Variables

Use placeholders in your `.env` files and never commit real secrets.

### Backend

| Variable | Example Placeholder | Description |
| --- | --- | --- |
| `PORT` | `5000` | Port on which the backend server runs |
| `MONGODB_URI` | `<your_mongodb_uri>` | MongoDB connection string |
| `JWT_SECRET` | `<your_jwt_secret>` | Secret used to sign authentication tokens |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiration duration |
| `CLIENT_URL` | `http://localhost:3000` | Frontend origin allowed by CORS |

### Frontend

| Variable | Example Placeholder | Description |
| --- | --- | --- |
| `VITE_API_ORIGIN` | `http://localhost:5000` | Base URL for the backend API |

### Local Development vs Production

- In local development, `MONGODB_URI` can point to `mongodb://127.0.0.1:27017/<database_name>`.
- In production, use a hosted database and a strong random `JWT_SECRET`.
- `CLIENT_URL` should match your deployed frontend domain in production.
- Keep `.env.example` committed, but keep real `.env` files out of version control.

## Folder Structure

```text
4th Sem Minor Project/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- utils/
|   |   |-- app.js
|   |   `-- server.js
|   |-- uploads/
|   |   |-- notes/
|   |   `-- posters/
|   |-- .env.example
|   `-- package.json
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- .env.example
|   `-- package.json
`-- README.md
```

## Screenshots

Add project screenshots here before publishing the repository.

| Section | Preview |
| --- | --- |
| Login Page | `![Login Page](./screenshots/login-page.png)` |
| Dashboard | `![Dashboard](./screenshots/dashboard.png)` |
| Events Module | `![Events](./screenshots/events-page.png)` |
| Notes Module | `![Notes](./screenshots/notes-page.png)` |
| Forum Module | `![Forum](./screenshots/forum-page.png)` |

## API Endpoints

Base URL for local backend:

```text
http://localhost:5000/api
```

### Health

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Check whether the API is running |

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Authenticate a user and issue a token |

### Events

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/events` | Get approved events |
| `GET` | `/events/manage` | Get events managed by club admins or professors |
| `POST` | `/events` | Create a new event with poster upload |
| `PATCH` | `/events/:eventId/approval` | Approve or update event approval status |
| `POST` | `/events/:eventId/register` | Register a student for an event |
| `GET` | `/events/:eventId/attendees` | Get event attendee list |
| `DELETE` | `/events/:eventId` | Delete an event |

### Notes

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/notes` | Get available notes |
| `GET` | `/notes/:noteId` | Get note details |
| `GET` | `/notes/:noteId/download` | Download a note file |
| `POST` | `/notes` | Upload a new note |

### Forum

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/forum` | Get all forum posts |
| `GET` | `/forum/:postId` | Get a specific forum post |
| `POST` | `/forum` | Create a new forum post |
| `POST` | `/forum/:postId/comments` | Add a comment to a post |
| `PATCH` | `/forum/:postId/vote` | Vote on a post |
| `PATCH` | `/forum/:postId/comments/:commentId/vote` | Vote on a comment |

## Future Improvements

- Add automated testing for frontend and backend modules
- Introduce refresh tokens and stronger session management
- Add role-based dashboards with richer analytics
- Improve file storage by integrating cloud storage services
- Add search, filtering, and pagination for notes, events, and forum posts
- Add Docker support for easier deployment
- Add CI/CD workflows for build, test, and deployment automation

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes:

```bash
git commit -m "Add your feature"
```

4. Push your branch:

```bash
git push origin feature/your-feature-name
```

5. Open a pull request

## License

This project is currently available for academic and portfolio use. You can replace this section with a specific license such as `MIT` if you want to open-source it formally.
