import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ResearchPaperDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paper = location.state?.paper;

  const [summary, setSummary] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const res = await axios.post(`${API}/research-papers/summarize`, {
        title: paper.title,
        abstract: paper.summary,
      });
      setSummary(res.data.summary);
      setProvider(res.data.provider);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to generate summary. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Render summary text with markdown-like bold support
  const renderSummary = (text) => {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      // Bold **text**
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="rp-summary-line">
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
        </p>
      );
    });
  };

  if (!paper) {
    return (
      <div className="rp-page">
        <div className="rp-empty">
          <p className="rp-empty-icon">❓</p>
          <h3>Paper not found</h3>
          <p className="muted">Please go back and select a paper from the search results.</p>
          <button className="primary-button" onClick={() => navigate("/research-papers")}>
            ← Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rp-page">
      {/* Back Button */}
      <button className="rp-back-btn" onClick={() => navigate("/research-papers")}>
        ← Back to Search
      </button>

      {/* Paper Meta */}
      <div className="rp-detail-card">
        <div className="rp-card-badge">arXiv</div>
        <h1 className="rp-detail-title">{paper.title}</h1>

        <div className="rp-detail-meta">
          <span>👥 {paper.authors.join(", ")}</span>
          <span>📅 {formatDate(paper.published)}</span>
          {paper.pdfLink && (
            <a
              href={paper.pdfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rp-pdf-link"
            >
              📄 View PDF on arXiv
            </a>
          )}
        </div>

        <div className="rp-abstract-box">
          <h3>Abstract</h3>
          <p>{paper.summary}</p>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="rp-ai-section">
        <div className="rp-ai-header">
          <div>
            <h2>✨ AI-Powered Summary</h2>
            <p className="muted">
              Get an instant, student-friendly breakdown of this paper using AI.
            </p>
          </div>
          {!summary && !loading && (
            <button
              className="primary-button"
              onClick={handleGenerateSummary}
              id="generate-summary-btn"
            >
              Generate Summary
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="rp-ai-loading">
            <div className="rp-ai-spinner" />
            <p>AI is analyzing the paper… This may take a few seconds.</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rp-error-box">
            <p>{error}</p>
            <button className="ghost-button" onClick={handleGenerateSummary}>
              Try Again
            </button>
          </div>
        )}

        {/* Summary Result */}
        {summary && !loading && (
          <div className="rp-summary-box">
            <div className="rp-summary-provider">
              Powered by <strong>{provider}</strong>
            </div>
            <div className="rp-summary-content">
              {renderSummary(summary)}
            </div>
            <button
              className="ghost-button rp-regenerate-btn"
              onClick={handleGenerateSummary}
            >
              🔄 Regenerate Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchPaperDetailPage;
