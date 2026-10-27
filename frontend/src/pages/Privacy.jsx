import { Link } from "react-router-dom";

const CONTACT_EMAIL = "sci.fi.th08@gmail.com";

function Privacy() {
  return (
    <div className="container py-5" style={{ maxWidth: "820px" }}>
      <h2 className="fw-bold mb-1">Privacy Policy</h2>
      <p className="text-muted">Last updated: 27 October 2026</p>

      <p>
        LostLink is a student project. This page explains, in plain words, what information the
        app collects, why, and who else handles it. We do not sell your data and we do not show
        ads.
      </p>

      <h5 className="fw-bold mt-4">1. What we collect</h5>
      <ul>
        <li>
          <strong>Your account:</strong> your name, your email address, and your password. The
          password is stored only as a one-way hash, so nobody (including us) can read it.
        </li>
        <li>
          <strong>Items you post:</strong> the title, description, whether it is lost or found,
          the location you pick on the map, and an optional photo.
        </li>
        <li>
          <strong>Matches and chat:</strong> the matches we suggest for your items, and the
          messages you send in a chat after a match is confirmed.
        </li>
        <li>
          <strong>On your device:</strong> after you log in, your browser keeps a login token and
          your basic profile (name, email, id) in its local storage so you stay signed in.
        </li>
      </ul>

      <h5 className="fw-bold mt-4">2. Why we use it</h5>
      <p>
        To suggest matches between lost and found items that are near each other (within about 5
        km), to let matched people talk to each other, and to run the service.
      </p>

      <h5 className="fw-bold mt-4">3. What other people can see</h5>
      <p>
        Before a match is confirmed, the other person sees only the item's title, type and photo.
        After a match is confirmed, they can see the full item details, including where it was
        posted, and the chat opens. Please do not put anything private in a title, description or
        photo.
      </p>

      <h5 className="fw-bold mt-4">4. Who else handles your data</h5>
      <p>LostLink relies on a few services to work:</p>
      <ul>
        <li>
          <strong>OpenAI:</strong> the title and description of an item are sent to create a
          numeric "meaning" of the text, which is used to find similar items.
        </li>
        <li>
          <strong>Cloudinary:</strong> stores and serves the photos you upload.
        </li>
        <li>
          <strong>MongoDB Atlas:</strong> the database that stores accounts, items, matches and
          messages.
        </li>
        <li>
          <strong>Render and Vercel:</strong> host the server and the website.
        </li>
        <li>
          <strong>OpenStreetMap and Nominatim:</strong> provide the map tiles and the place
          search. Your browser contacts them when the map loads, and the text you type in the
          location search is sent to them.
        </li>
      </ul>

      <h5 className="fw-bold mt-4">5. Security</h5>
      <p>
        Traffic between your browser and LostLink uses HTTPS and passwords are hashed. No online
        service is perfectly secure, so please share only what you are comfortable sharing.
      </p>

      <h5 className="fw-bold mt-4">6. Your choices</h5>
      <p>
        You can ask us to delete your account and your posts, or to correct your details, by
        emailing{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. There is no self-service delete
        button yet. You can also sign out at any time, which removes the login token from your
        browser.
      </p>

      <h5 className="fw-bold mt-4">7. Changes and contact</h5>
      <p>
        We may update this page as the project grows; the date above shows the latest version.
        Questions? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also our{" "}
        <Link to="/terms">Terms &amp; Conditions</Link>.
      </p>
    </div>
  );
}

export default Privacy;
