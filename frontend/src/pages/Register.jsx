import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext";

const API_URL = import.meta.env.VITE_API_URL;

function Register() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/api/auth/signup`,   // ✅ FIXED
        form
      );

      showAlert("Registration successful 🎉", "success");

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (err) {
      showAlert(
        err.response?.data?.msg || "Registration failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: "90vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{ width: "420px", borderRadius: "12px" }}
      >
        <h3 className="text-center mb-4 fw-bold">Create Account 🚀</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Enter your name"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Create password"
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-3">
          <small>
            Already have an account?{" "}
            <span
              style={{ cursor: "pointer", color: "#0d6efd" }}
              onClick={() => navigate("/login")}  
            >
              Login
            </span>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Register;