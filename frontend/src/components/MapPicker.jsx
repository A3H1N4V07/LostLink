import { GoogleMap, LoadScript, Marker, Autocomplete } from "@react-google-maps/api";
import { useState, useRef } from "react";

const containerStyle = {
  width: "100%",
  height: "300px",
};

const center = {
  lat: 12.9629, 
  lng: 77.5775,
};

function MapPicker({ setForm }) {
  const [marker, setMarker] = useState(center);
  const autocompleteRef = useRef(null);

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setMarker({ lat, lng });

    setForm((prev) => ({
      ...prev,
      lat,
      lng,
    }));
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();

    if (!place.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setMarker({ lat, lng });

    setForm((prev) => ({
      ...prev,
      lat,
      lng,
    }));
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div className="mb-3">
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Search location..."
            className="form-control mb-2"
          />
        </Autocomplete>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={marker}
          zoom={13}
          onClick={handleMapClick}
        >
          <Marker position={marker} />
        </GoogleMap>
      </div>
    </LoadScript>
  );
}

export default MapPicker;