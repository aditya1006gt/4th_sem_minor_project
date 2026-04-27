import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import BranchDropdown from "../components/BranchDropdown";
import PageHeader from "../components/PageHeader";
import SemesterDropdown from "../components/SemesterDropdown";

const initialForm = {
  title: "",
  branch: "",
  semester: "",
  subject: "",
  tags: "",
  noteFile: null
};

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [filters, setFilters] = useState({ branch: "", semester: "", subject: "", search: "" });
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/notes", { params: filters });
      setNotes(response.data.notes);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleFormChange = (event) => {
    const { name, value, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value
    }));
  };

  const applyFilters = async (event) => {
    event.preventDefault();
    setError("");
    await fetchNotes();
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setUploading(true);
    setError("");
    setMessage("");

    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("branch", form.branch);
      payload.append("semester", form.semester);
      payload.append("subject", form.subject);
      payload.append("tags", form.tags);
      payload.append("noteFile", form.noteFile);

      await axiosClient.post("/notes", payload, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage("Note uploaded successfully.");
      setForm(initialForm);
      await fetchNotes();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to upload note");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section>
      <PageHeader
        eyebrow="Academic Hub"
        title="Notes Repository"
        description="Share subject notes, browse by branch, and download resources instantly."
      />

      <div className="two-panel-grid">
        <article className="panel">
          <h3>Find Notes</h3>
          <form className="stack-form" onSubmit={applyFilters}>
            <BranchDropdown value={filters.branch} onChange={handleFilterChange} />
            <SemesterDropdown value={filters.semester} onChange={handleFilterChange} />
            <label>
              Subject
              <input name="subject" value={filters.subject} onChange={handleFilterChange} />
            </label>
            <label>
              Search
              <input
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Title, subject, or tag"
              />
            </label>
            <button type="submit" className="primary-button">
              Apply Filters
            </button>
          </form>
        </article>

        <article className="panel">
          <h3>Upload Notes</h3>
          <form className="stack-form" onSubmit={handleUpload}>
            <label>
              Title
              <input name="title" value={form.title} onChange={handleFormChange} required />
            </label>
            <BranchDropdown value={form.branch} onChange={handleFormChange} required />
            <SemesterDropdown value={form.semester} onChange={handleFormChange} required />
            <label>
              Subject
              <input name="subject" value={form.subject} onChange={handleFormChange} required />
            </label>
            <label>
              Tags
              <input
                name="tags"
                value={form.tags}
                onChange={handleFormChange}
                placeholder="semester-4, unit-1, important"
              />
            </label>
            <label>
              Note File
              <input
                name="noteFile"
                type="file"
                accept=".pdf,image/*"
                onChange={handleFormChange}
                required
              />
            </label>
            <button type="submit" className="primary-button" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Note"}
            </button>
          </form>
        </article>
      </div>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="list-grid">
        {loading ? <p className="muted">Loading notes...</p> : null}
        {!loading &&
          notes.map((note) => (
            <article key={note._id} className="list-card">
              <div>
                <h3>{note.title}</h3>
                <p className="muted">
                  {note.branch} - {note.semester || "Semester not set"} - {note.subject}
                </p>
                <p className="muted">Tags: {note.tags?.join(", ") || "No tags"}</p>
                <p className="muted">Uploaded by {note.uploaderId?.name}</p>
              </div>
              <a
                className="secondary-button"
                href={`${import.meta.env.VITE_API_ORIGIN || "http://localhost:5000"}/${note.fileUrl || note.filePath}`}
                target="_blank"
                rel="noreferrer"
              >
                View File
              </a>
            </article>
          ))}
      </div>
    </section>
  );
};

export default NotesPage;
