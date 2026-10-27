import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Leaflet's built-in default icon builds its image paths in a way Vite breaks,
// so the marker gets its own icon pointing at the files Vite bundles.
const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

const center = [12.9629, 77.5775];

const mapStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "6px",
};

// Listens for clicks on the map and reports the clicked point.
function ClickToPick({ onPick }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

// Moves the map to a place chosen from the search results.
function MoveTo({ target }) {
  const map = useMap();

  useEffect(() => {
    if (target) map.setView(target, 15);
  }, [target, map]);

  return null;
}

function MapPicker({ setForm }) {
  const [position, setPosition] = useState(null); // stays null until the user picks a point
  const [target, setTarget] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  const pick = (lat, lng) => {
    setPosition([lat, lng]);

    setForm((prev) => ({
      ...prev,
      lat,
      lng,
    }));
  };

  // Place search uses OpenStreetMap's free Nominatim service.
  // Its usage policy forbids search-as-you-type, so this only runs on Enter / button click.
  const search = async () => {
    const q = query.trim();
    if (!q) return;

    try {
      setSearching(true);
      setMessage("");

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`,
        { headers: { Accept: "application/json" } }
      );

      if (!res.ok) throw new Error(`Search failed (${res.status})`);

      const data = await res.json();
      setResults(data);

      if (data.length === 0) {
        setMessage("No places found. Try another name, or click on the map.");
      }
    } catch (err) {
      console.log("PLACE SEARCH ERROR:", err);
      setResults([]);
      setMessage("Search is unavailable right now. You can still click on the map.");
    } finally {
      setSearching(false);
    }
  };

  const choosePlace = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);

    pick(lat, lng);
    setTarget([lat, lng]);
    setResults([]);
    setMessage("");
    setQuery(place.display_name.split(",")[0]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // this input lives inside the Upload form: don't submit the item
      search();
    }
  };

  return (
    <div className="mb-3">
      <div className="input-group mb-2">
        <input
          type="text"
          placeholder="Search location..."
          className="form-control"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={search}
          disabled={searching || !query.trim()}
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="list-group mb-2">
          {results.map((place) => (
            <button
              type="button"
              key={place.place_id}
              className="list-group-item list-group-item-action"
              onClick={() => choosePlace(place)}
            >
              <small>{place.display_name}</small>
            </button>
          ))}
        </div>
      )}

      {message && <div className="text-muted small mb-2">{message}</div>}

      <MapContainer center={center} zoom={13} style={mapStyle} scrollWheelZoom={false}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        <ClickToPick onPick={pick} />
        <MoveTo target={target} />

        {position && (
          <Marker
            position={position}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                pick(lat, lng);
              },
            }}
          />
        )}
      </MapContainer>

      <div className="text-muted small mt-1">
        {position
          ? `📍 Selected: ${position[0].toFixed(5)}, ${position[1].toFixed(5)} (drag the pin to adjust)`
          : "Click the map or search to set the item's location"}
      </div>
    </div>
  );
}

export default MapPicker;
