import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BranchDropdown from "../components/BranchDropdown";
import { useAuth } from "../hooks/useAuth";

const initialForm = {
  name: "",
  role: "student",
  rollNumber: "",
  branch: "",
  year: "",
  email: "",
  password: ""
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const isProfessor = form.role === "professor";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card auth-card-wide">
        <p className="eyebrow">Get Started</p>
        <h1>Create your account</h1>
        <p className="muted">
          Students and club admins use academic details, while professors register as faculty.
        </p>

        <form className="stack-form two-column-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="student">Student</option>
              <option value="club_admin">Club Admin</option>
              <option value="professor">Professor</option>
            </select>
          </label>

          <BranchDropdown value={form.branch} onChange={handleChange} required />

          {!isProfessor ? (
            <>
              <label>
                Roll Number
                <input
                  name="rollNumber"
                  value={form.rollNumber}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Year
                <select name="year" value={form.year} onChange={handleChange} required>
                  <option value="">Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </label>
            </>
          ) : null}

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-span">
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {error ? <p className="error-text form-span">{error}</p> : null}

          <button type="submit" className="primary-button form-span" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="muted auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
