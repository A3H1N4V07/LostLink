import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
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

    if (!form.email || !form.password) {
      showAlert("Please fill all fields", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      // Save token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Save globally
      setUser(res.data.user);

      showAlert("Login successful 🎉", "success");

      // smooth redirect
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err) {
      showAlert(err.response?.data?.msg || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: "90vh",
        background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)"
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          width: "400px",
          borderRadius: "12px"
        }}
      >
        <h3 className="text-center mb-4 fw-bold">
          Welcome Back 👋
        </h3>

        <form onSubmit={handleSubmit}>
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
              placeholder="Enter password"
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="btn btn-dark w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-3">
          <small>
            Don’t have an account?{" "}
            <span
              style={{ cursor: "pointer", color: "#0d6efd" }}
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;