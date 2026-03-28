import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); 
  };

  return (
    <nav
      className="navbar navbar-expand-lg border-0"
      style={{
        background: "transparent",
        paddingTop: "15px",
        paddingBottom: "15px",
      }}
    >
      <div className="container">

        <Link
          className="navbar-brand text-dark text-decoration-none d-flex align-items-center"
          to="/"
        >
          <div className="me-2" style={{ fontSize: "24px" }}>📦</div>

          <div className="d-flex flex-column lh-1">
            <span
              className="fw-bold"
              style={{ fontSize: "20px", letterSpacing: "1px" }}
            >
              LostLink
            </span>
            <span style={{ fontSize: "9px", color: "#666" }}>
              Recover. Connect. Restore.
            </span>
          </div>
        </Link>

        <div className="d-flex align-items-center">

          {!user ? (
            <>
              <Link to="/" className="text-decoration-none text-dark fw-medium mx-3">
                Home
              </Link>

              <Link to="/register" className="text-decoration-none text-dark fw-medium mx-3">
                Sign Up
              </Link>

              <Link
                to="/login"
                className="btn fw-medium px-4 py-1"
                style={{
                  backgroundColor: "#e8e9eb",
                  borderRadius: "20px",
                }}
              >
                Sign In
              </Link>
            </>
          ) : (

            <>
              <Link to="/" className="text-decoration-none text-dark fw-medium mx-2">
                Home
              </Link>

              <Link to="/dashboard" className="text-decoration-none text-dark fw-medium mx-2">
                Dashboard
              </Link>

              <Link to="/upload" className="text-decoration-none text-dark fw-medium mx-2">
                Upload
              </Link>

              <Link to="/matches" className="text-decoration-none text-dark fw-medium mx-2">
                Matches
              </Link>

              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#000",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "15px",
                  marginRight: "15px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {(user?.name?.charAt(0) || "U").toUpperCase()}
              </div>

              <button
                className="btn fw-medium px-4 py-1 border-0"
                onClick={handleLogout}
                style={{
                  backgroundColor: "#e2e3e5",
                  borderRadius: "20px",
                  color: "#333",
                }}
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;