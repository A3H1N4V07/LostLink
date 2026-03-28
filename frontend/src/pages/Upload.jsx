import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MapPicker from "../components/MapPicker";
import { useAlert } from "../context/AlertContext";

function Upload() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "lost",
    lat: "",
    lng: "",
    image: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadImage = async () => {
    if (!file) return "";

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "lostfound_upload");
    data.append("cloud_name", "dwyeklweb");

    try {
      setUploadingImage(true);

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dwyeklweb/image/upload",
        data
      );

      showAlert("Image uploaded 📸", "success");

      return res.data.secure_url;
    } catch (err) {
      showAlert("Image upload failed", "error");
      throw err;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showAlert("Title is required", "error");
      return;
    }

    if (!form.lat || !form.lng) {
      showAlert("Please select location on map", "error");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        showAlert("Please login first", "error");
        navigate("/login");
        return;
      }

      let imageUrl = "";
      if (file) {
        imageUrl = await uploadImage();
      }

      await axios.post(
        `https://lostlink-wbtc.onrender.com/api/items`,
        {
          title: form.title,
          description: form.description,
          type: form.type,
          location: {
            lat: parseFloat(form.lat),
            lng: parseFloat(form.lng),
          },
          image: imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showAlert("Item uploaded successfully 🎉", "success");

      setForm({
        title: "",
        description: "",
        type: "lost",
        lat: "",
        lng: "",
        image: "",
      });
      setFile(null);

      setTimeout(() => {
        navigate("/matches");
      }, 1200);

    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      showAlert(err.response?.data?.msg || "Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Upload Item</h3>

      <div className="card p-4 shadow">
        <form onSubmit={handleSubmit}>
          <input
            name="title"
            value={form.title}
            placeholder="Title"
            className="form-control mb-3"
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            value={form.description}
            placeholder="Description (color, brand, details)"
            className="form-control mb-3"
            onChange={handleChange}
          />

          <select
            name="type"
            value={form.type}
            className="form-control mb-3"
            onChange={handleChange}
          >
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <MapPicker setForm={setForm} />

          <input
            type="file"
            className="form-control mb-3"
            onChange={handleFileChange}
          />

          {uploadingImage && (
            <small className="text-info">Uploading image...</small>
          )}

          <button
            className="btn btn-primary w-100"
            disabled={loading || uploadingImage}
          >
            {loading
              ? "Processing..."
              : uploadingImage
              ? "Uploading Image..."
              : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Upload;