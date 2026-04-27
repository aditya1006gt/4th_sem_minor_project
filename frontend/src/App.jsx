import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import NotesPage from "./pages/NotesPage";
import EventsPage from "./pages/EventsPage";
import EventAdminPage from "./pages/EventAdminPage";
import Community from "./pages/Community";
import { useAuth } from "./hooks/useAuth";

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="forum" element={<Navigate to="/community" replace />} />
        <Route path="community" element={<Community />} />
        <Route path="events" element={<EventsPage />} />
        <Route
          path="event-admin"
          element={
            <ProtectedRoute allowedRoles={["club_admin", "professor"]}>
              <EventAdminPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
};

export default App;
