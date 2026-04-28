import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navClassName = ({ isActive }) =>
  `nav-link${isActive ? " nav-link-active" : ""}`;

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <div className="brand-card">
            <p className="eyebrow">Smart Campus Suite</p>
            <h1>Smart College Platform</h1>
            <p className="muted">
              Academic resources, student discussions, clubs, and events in one place.
            </p>
          </div>

          <nav className="nav-group">
            <NavLink to="/" end className={navClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/notes" className={navClassName}>
              Notes Hub
            </NavLink>
            <NavLink to="/community" className={navClassName}>
              Community Chat
            </NavLink>
            <NavLink to="/events" className={navClassName}>
              Events
            </NavLink>
            <NavLink to="/research-papers" className={navClassName}>
              Research Papers
            </NavLink>
            {["club_admin", "professor"].includes(user?.role) && (
              <NavLink to="/event-admin" className={navClassName}>
                Event Control
              </NavLink>
            )}
          </nav>
        </div>

        <div className="user-panel">
          <div>
            <p className="panel-title">{user?.name}</p>
            <p className="muted">
              {user?.role?.replace("_", " ")} - {user?.branch}
            </p>
          </div>
          <button type="button" className="ghost-button" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
