import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ResearchPapersPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await axios.get(`${API}/research-papers/search`, {
        params: { q: query, limit: 12 },
      });
      setPapers(res.data.papers);
    } catch (err) {
      setError("Failed to fetch papers. Please try again.");
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperClick = (paper) => {
    // Encode paper data in URL state so detail page can use it without a DB
    navigate(`/research-papers/${encodeURIComponent(paper.id)}`, {
      state: { paper },
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rp-page">
      {/* Header */}
      <div className="rp-header">
        <div className="rp-header-text">
          <h1 className="page-title">Research Papers</h1>
          <p className="muted">
            Search millions of academic papers from arXiv and get instant AI-powered summaries.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form className="rp-search-form" onSubmit={handleSearch}>
        <div className="rp-search-wrapper">
          <span className="rp-search-icon">🔍</span>
          <input
            type="text"
            className="rp-search-input"
            placeholder='Search by topic, title, or author (e.g. "Transformer neural networks")'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && <p className="rp-error">{error}</p>}

      {/* Loading Skeletons */}
      {loading && (
        <div className="rp-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rp-card rp-card-skeleton">
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-meta" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-line skeleton-short" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && papers.length > 0 && (
        <>
          <p className="rp-result-count">
            Showing <strong>{papers.length}</strong> results for &quot;{query}&quot;
          </p>
          <div className="rp-grid">
            {papers.map((paper, index) => (
              <div
                key={index}
                className="rp-card"
                onClick={() => handlePaperClick(paper)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handlePaperClick(paper)}
              >
                <div className="rp-card-badge">arXiv</div>
                <h3 className="rp-card-title">{paper.title}</h3>
                <p className="rp-card-authors">
                  {paper.authors.slice(0, 3).join(", ")}
                  {paper.authors.length > 3 && " et al."}
                </p>
                <p className="rp-card-abstract">
                  {paper.summary.length > 200
                    ? paper.summary.substring(0, 200) + "…"
                    : paper.summary}
                </p>
                <div className="rp-card-footer">
                  <span className="rp-card-date">{formatDate(paper.published)}</span>
                  <span className="rp-card-cta">View &amp; Summarize →</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && searched && papers.length === 0 && !error && (
        <div className="rp-empty">
          <p className="rp-empty-icon">📭</p>
          <h3>No papers found</h3>
          <p className="muted">Try a different search query.</p>
        </div>
      )}

      {/* Initial State */}
      {!searched && !loading && (
        <div className="rp-empty">
          <p className="rp-empty-icon">🔬</p>
          <h3>Explore Academic Research</h3>
          <p className="muted">
            Search for any topic above to find research papers. Click on a paper to
            read its abstract and generate an AI-powered summary instantly.
          </p>
          <div className="rp-suggestions">
            {["Machine Learning", "Quantum Computing", "Climate Change", "CRISPR Gene Editing"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  className="rp-suggestion-chip"
                  onClick={() => {
                    setQuery(suggestion);
                  }}
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchPapersPage;
