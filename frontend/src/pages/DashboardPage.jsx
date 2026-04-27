import PageHeader from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";

const DashboardPage = () => {
  const { user } = useAuth();

  const cards = [
    {
      title: "Academic Hub",
      value: "Notes, PDFs, branch filters",
      description: "Upload and discover notes by branch, subject, and tags."
    },
    {
      title: "Discussion Forum",
      value: "Questions, threads, voting",
      description: "Post doubts, reply in threads, and surface the best answers."
    },
    {
      title: "Events & Clubs",
      value: "Forms, approvals, event management",
      description: "Create events, approve requests, and collect event form submissions."
    }
  ];

  return (
    <section>
      <PageHeader
        eyebrow="Overview"
        title={`Hello, ${user?.name}`}
        description="Your central workspace for academics, discussions, and campus activities."
      />

      <div className="hero-panel">
        <div>
          <p className="eyebrow">Profile Snapshot</p>
          <h3>
            {user?.branch}
            {user?.role !== "professor" && user?.year ? ` - Year ${user.year}` : ""}
          </h3>
          <p className="muted">
            Logged in as <strong>{user?.role?.replace("_", " ")}</strong>. Your available actions
            across the platform are automatically adjusted by role.
          </p>
        </div>
      </div>

      <div className="card-grid">
        {cards.map((card) => (
          <article key={card.title} className="feature-card">
            <p className="eyebrow">{card.title}</p>
            <h3>{card.value}</h3>
            <p className="muted">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DashboardPage;
