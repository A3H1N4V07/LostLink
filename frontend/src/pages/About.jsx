import { Link } from "react-router-dom";

const CONTACT_EMAIL = "sci.fi.th08@gmail.com";

function About() {
  return (
    <div className="container py-5" style={{ maxWidth: "820px" }}>
      <h2 className="fw-bold mb-1">About LostLink</h2>
      <p className="text-muted">Recover. Connect. Restore.</p>

      <p>
        Losing something is stressful, and the person who found it often has no easy way to reach
        you. LostLink connects the two. You post what you lost or found, and LostLink suggests
        possible matches nearby, so the item can find its way back to its owner.
      </p>

      <h5 className="fw-bold mt-4">How it works</h5>
      <ol>
        <li>
          <strong>Post an item.</strong> Add a title, a short description, a photo and a spot on
          the map, and say whether it is lost or found.
        </li>
        <li>
          <strong>Get matches.</strong> LostLink looks for items of the opposite type within
          about 5 km. It compares the distance, the words in the titles, and the meaning of the
          descriptions using AI text embeddings, then ranks the best ones.
        </li>
        <li>
          <strong>Confirm and chat.</strong> Until a match is confirmed you only see a preview.
          After you confirm, the full details are shown and you can chat to arrange the handover.
        </li>
      </ol>

      <h5 className="fw-bold mt-4">Built with</h5>
      <p>
        React and Bootstrap on the front end; Node.js, Express and Socket.io on the back end;
        MongoDB for data and location search; OpenAI for text embeddings; Cloudinary for photos;
        and OpenStreetMap with Leaflet for the map.
      </p>

      <h5 className="fw-bold mt-4">Get in touch</h5>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <p className="mt-4">
        <Link to="/upload?type=lost" className="btn btn-danger me-2">
          Report a lost item
        </Link>
        <Link to="/upload?type=found" className="btn btn-success">
          Report a found item
        </Link>
      </p>
    </div>
  );
}

export default About;
