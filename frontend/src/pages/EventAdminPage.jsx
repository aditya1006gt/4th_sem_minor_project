import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";

const initialEventForm = {
  title: "",
  description: "",
  clubName: "",
  targetBranch: "",
  startDate: "",
  endDate: "",
  venue: "",
  poster: null
};

const formatEventDates = (event) => {
  const start = new Date(event.startDate).toLocaleDateString();
  const end = event.endDate ? new Date(event.endDate).toLocaleDateString() : null;
  return end ? `${start} - ${end}` : start;
};

const EventAdminPage = () => {
  const { user } = useAuth();
  const [eventForm, setEventForm] = useState(initialEventForm);
  const [events, setEvents] = useState([]);
  const [attendeeEventId, setAttendeeEventId] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingApprovalEventId, setPendingApprovalEventId] = useState("");

  const fetchManagedEvents = async () => {
    try {
      const response = await axiosClient.get("/events/manage");
      setEvents(response.data.events);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to fetch events");
    }
  };

  useEffect(() => {
    fetchManagedEvents();
  }, []);

  const handleFormChange = (event) => {
    const { name, value, files } = event.target;
    setEventForm((current) => ({
      ...current,
      [name]: files ? files[0] : value
    }));
  };

  const createEvent = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const payload = new FormData();
      payload.append("title", eventForm.title);
      payload.append("description", eventForm.description);
      payload.append("clubName", eventForm.clubName);
      payload.append("targetBranch", eventForm.targetBranch || user?.branch || "");
      payload.append("startDate", eventForm.startDate);
      if (eventForm.endDate) {
        payload.append("endDate", eventForm.endDate);
      }
      payload.append("venue", eventForm.venue);
      if (eventForm.poster) {
        payload.append("poster", eventForm.poster);
      }

      await axiosClient.post("/events", payload, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage("Event submitted for approval.");
      setEventForm(initialEventForm);
      await fetchManagedEvents();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to create event");
    }
  };

  const updateApproval = async (eventId, status) => {
    setError("");
    setMessage("");
    setPendingApprovalEventId(eventId);

    try {
      await axiosClient.patch(`/events/${eventId}/approval`, { status });
      setEvents((current) =>
        current.map((event) =>
          event._id === eventId ? { ...event, status } : event
        )
      );
      setMessage(`Event ${status} successfully.`);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to update event status");
    } finally {
      setPendingApprovalEventId("");
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await axiosClient.delete(`/events/${eventId}`);
      setMessage("Event deleted successfully.");
      if (attendeeEventId === eventId) {
        setAttendeeEventId("");
        setAttendees([]);
      }
      await fetchManagedEvents();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete event");
    }
  };

  const fetchAttendees = async () => {
    if (!attendeeEventId) {
      return;
    }

    try {
      const response = await axiosClient.get(`/events/${attendeeEventId}/attendees`);
      setAttendees(response.data.attendees);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to fetch form submissions");
    }
  };

  const isHigherAdmin = user?.role === "professor";
  const isBranchAdmin = user?.role === "club_admin";

  return (
    <section>
      <PageHeader
        eyebrow="Event Control"
        title="Club & Event Management"
        description="Create events, approve club requests, and review the student details submitted for each event."
      />

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="two-panel-grid">
        {isBranchAdmin ? (
          <article className="panel">
            <h3>Create Event</h3>
            <form className="stack-form" onSubmit={createEvent}>
              <label>
                Title
                <input name="title" value={eventForm.title} onChange={handleFormChange} required />
              </label>
              <label>
                Description
                <textarea
                  rows="4"
                  name="description"
                  value={eventForm.description}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                Club Name
                <input
                  name="clubName"
                  value={eventForm.clubName}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                Event Scope
                <select
                  name="targetBranch"
                  value={eventForm.targetBranch || user?.branch || ""}
                  onChange={handleFormChange}
                  required
                >
                  <option value={user?.branch || ""}>{user?.branch || "My Branch"}</option>
                  <option value="ALL">All Branches</option>
                </select>
              </label>
              <label>
                Start Date
                <input
                  name="startDate"
                  type="date"
                  value={eventForm.startDate}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                End Date
                <input
                  name="endDate"
                  type="date"
                  value={eventForm.endDate}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Venue
                <input name="venue" value={eventForm.venue} onChange={handleFormChange} required />
              </label>
              <label>
                Poster
                <input name="poster" type="file" accept="image/*" onChange={handleFormChange} />
              </label>
              <button type="submit" className="primary-button">
                Submit Event
              </button>
            </form>
          </article>
        ) : null}

        <article className="panel">
          <h3>Student Registrations</h3>
          <label>
            Select Event
            <select value={attendeeEventId} onChange={(event) => setAttendeeEventId(event.target.value)}>
              <option value="">Choose an event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="secondary-button compact-button" onClick={fetchAttendees}>
            Load Submissions
          </button>
        </article>
      </div>

      <div className="list-grid">
        {events.map((event) => (
          <article key={event._id} className="list-card">
            <div>
              <h3>{event.title}</h3>
              <p className="muted">
                {event.clubName} - {event.venue}
              </p>
              <p className="muted">{formatEventDates(event)}</p>
              <p className="muted">
                Branch: {(event.branch || event.department || event.creatorId?.branch || "N/A") === "ALL"
                  ? "All Branches"
                  : (event.branch || event.department || event.creatorId?.branch || "N/A")}
              </p>
              <p className="muted">Status: {event.status}</p>
            </div>

            {isHigherAdmin ? (
              <div className="button-row">
                {event.status === "Pending" ? (
                  <>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={pendingApprovalEventId === event._id}
                      onClick={() => updateApproval(event._id, "Approved")}
                    >
                      {pendingApprovalEventId === event._id ? "Updating..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      disabled={pendingApprovalEventId === event._id}
                      onClick={() => updateApproval(event._id, "Rejected")}
                    >
                      {pendingApprovalEventId === event._id ? "Updating..." : "Reject"}
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => deleteEvent(event._id)}
                >
                  Delete
                </button>
              </div>
            ) : (
              <div className="button-row">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => deleteEvent(event._id)}
                >
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {attendees.length ? (
        <article className="panel">
          <h3>Registered Students</h3>
          <div className="attendee-list">
            {attendees.map((attendee) => (
              <div key={attendee.userId?._id || attendee.email} className="attendee-item">
                <strong>{attendee.name}</strong>
                <span className="muted">
                  {attendee.branch}
                </span>
                <span className="muted">{attendee.email}</span>
                {attendee.rollNumber || attendee.year ? (
                  <span className="muted">
                    {attendee.rollNumber ? `Roll: ${attendee.rollNumber}` : ""}
                    {attendee.rollNumber && attendee.year ? " - " : ""}
                    {attendee.year ? `Year ${attendee.year}` : ""}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  );
};

export default EventAdminPage;
