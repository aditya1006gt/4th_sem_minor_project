import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
// import ProtectedRoute from "./components/ProtectedRoute"; // Comment this out
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import NotesPage from "./pages/NotesPage";
import EventsPage from "./pages/EventsPage";
import EventAdminPage from "./pages/EventAdminPage";
import Community from "./pages/Community";
import ResearchPapersPage from "./pages/ResearchPapersPage";
import ResearchPaperDetailPage from "./pages/ResearchPaperDetailPage";
import { useAuth } from "./hooks/useAuth";

const App = () => {
  // You can comment this out or ignore it for now
  // const { isAuthenticated } = useAuth(); 

  return ( 
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
       
      {/* 1. Removed ProtectedRoute wrapper here */}
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="forum" element={<Navigate to="/community" replace />} />
        <Route path="community" element={<Community />} />
        <Route path="events" element={<EventsPage />} />
        
        {/* 2. Removed ProtectedRoute wrapper here as well */}
        <Route path="event-admin" element={<EventAdminPage />} />
        
        <Route path="research-papers" element={<ResearchPapersPage />} />
        <Route path="research-papers/:paperId" element={<ResearchPaperDetailPage />} />
      </Route>
      
      {/* 3. Changed fallback to just go to the dashboard instead of login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}; 

export default App; 