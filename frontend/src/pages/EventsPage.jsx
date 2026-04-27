import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import BranchDropdown from "../components/BranchDropdown";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";

const formatEventDates = (event) => {
  const start = new Date(event.startDate).toLocaleDateString();
  const end = event.endDate ? new Date(event.endDate).toLocaleDateString() : null;
  return end ? `${start} - ${end}` : start;
};

const buildInitialForm = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  branch: user?.branch || "",
  rollNumber: user?.rollNumber || "",
  year: user?.year || ""
});

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [forms, setForms] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isStudent = user?.role === "student";

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/events");
      setEvents(response.data.events);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!user || !isStudent) {
      return;
    }

    setForms((current) => {
      const next = { ...current };
      events.forEach((event) => {
        if (!next[event._id]) {
          next[event._id] = buildInitialForm(user);
        }
      });
      return next;
    });
  }, [events, user, isStudent]);

  const handleChange = (eventId, field, value) => {
    setForms((current) => ({
      ...current,
      [eventId]: {
        ...current[eventId],
        [field]: value
      }
    }));
  };

  const submitForm = async (eventId) => {
    setError("");
    setMessage("");

    try {
      await axiosClient.post(`/events/${eventId}/register`, forms[eventId] || buildInitialForm(user));
      setMessage("Event registration submitted successfully.");
      setEvents((current) =>
        current.map((event) =>
          event._id === eventId ? { ...event, isRegistered: true } : event
        )
      );
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to submit event form");
    }
  };

  return (
    <section>
      <PageHeader
        eyebrow="Campus Activities"
        title="Approved Events"
        description={
          isStudent
            ? "Browse approved events and submit your registration form."
            : "Browse approved events. Student registrations are managed by students, while club admins and professors review them in Event Control."
        }
      />

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="muted">Loading events...</p> : null}

      <div className="card-grid">
        {events.map((event) => {
          const form = forms[event._id] || buildInitialForm(user);
          const alreadyRegistered = Boolean(event.isRegistered);

          return (
            <article key={event._id} className="feature-card">
              {event.posterPath ? (
                <img
                  className="poster-image"
                  src={`${import.meta.env.VITE_API_ORIGIN || "http://localhost:5000"}/${event.posterPath}`}
                  alt={event.title}
                />
              ) : null}
              <p className="eyebrow">{event.clubName}</p>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p className="muted">
                {formatEventDates(event)} - {event.venue}
              </p>

              {isStudent ? (
                <div className="stack-form top-gap">
                  <label>
                    Name
                    <input
                      value={form.name}
                      onChange={(inputEvent) => handleChange(event._id, "name", inputEvent.target.value)}
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={(inputEvent) => handleChange(event._id, "email", inputEvent.target.value)}
                    />
                  </label>
                  <BranchDropdown
                    value={form.branch}
                    onChange={(inputEvent) => handleChange(event._id, "branch", inputEvent.target.value)}
                  />
                  <label>
                    Roll Number
                    <input
                      value={form.rollNumber}
                      onChange={(inputEvent) =>
                        handleChange(event._id, "rollNumber", inputEvent.target.value)
                      }
                    />
                  </label>
                  <label>
                    Year
                    <input
                      value={form.year}
                      onChange={(inputEvent) => handleChange(event._id, "year", inputEvent.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => submitForm(event._id)}
                    disabled={alreadyRegistered}
                  >
                    {alreadyRegistered ? "Already Registered" : "Submit Registration"}
                  </button>
                  {alreadyRegistered ? (
                    <p className="muted">You have already registered for this event.</p>
                  ) : null}
                </div>
              ) : (
                <p className="muted top-gap">
                  Only students can register for events. Use Event Control to review student registrations.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default EventsPage;
