import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL 
  || (import.meta.env.PROD ? "https://lostlink-wbtc.onrender.com" : "http://localhost:5000");

function Dashboard() {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(res.data);
    } catch (err) {
      console.log("Error fetching items:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-4 fw-bold">📦 Your Items</h3>

      {items.length === 0 && (
        <p className="text-muted">No items uploaded yet</p>
      )}

      <div className="row">
        {items.map((item) => (
          <div className="col-md-4 mb-4" key={item._id}>
            <div
              className="card shadow-lg border-0 h-100"
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                transition: "0.3s",
              }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt="item"
                  style={{
                    height: "200px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: "200px",
                    background: "#f1f1f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                  }}
                >
                  No Image
                </div>
              )}
              <div className="card-body d-flex flex-column">
                <h5 className="fw-bold mb-2">{item.title}</h5>

                <p className="text-muted flex-grow-1">{item.description}</p>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span
                    className={`badge ${
                      item.type === "lost" ? "bg-danger" : "bg-success"
                    }`}
                  >
                    {item.type}
                  </span>

                  <span className="badge bg-secondary">{item.status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;