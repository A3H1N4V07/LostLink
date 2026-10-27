import { Link } from "react-router-dom";

const CONTACT_EMAIL = "sci.fi.th08@gmail.com";

function Terms() {
  return (
    <div className="container py-5" style={{ maxWidth: "820px" }}>
      <h2 className="fw-bold mb-1">Terms &amp; Conditions</h2>
      <p className="text-muted">Last updated: 27 October 2026</p>

      <p>
        LostLink is a student project built to help people recover lost items. By creating an
        account or posting on LostLink, you agree to the points below. They are written in plain
        language on purpose.
      </p>

      <h5 className="fw-bold mt-4">1. What LostLink does</h5>
      <p>
        You can post an item you lost or found, with a title, a description, a location and an
        optional photo. LostLink suggests possible matches between lost and found items that are
        close to each other. A suggestion is only a suggestion: it does not prove that an item
        belongs to anyone.
      </p>

      <h5 className="fw-bold mt-4">2. No guarantee</h5>
      <p>
        LostLink cannot promise that you will recover your item, that a match is correct, or that
        the service will always be available. It is provided "as is", without warranties of any
        kind.
      </p>

      <h5 className="fw-bold mt-4">3. Your account</h5>
      <ul>
        <li>Give accurate information and keep your password to yourself.</li>
        <li>You are responsible for what happens under your account.</li>
      </ul>

      <h5 className="fw-bold mt-4">4. What you post</h5>
      <ul>
        <li>Only post items and details that are true, and that you are allowed to share.</li>
        <li>
          Do not post identity documents, card numbers, passwords or other sensitive personal
          information in a title, description or photo.
        </li>
        <li>
          Do not post anything illegal, abusive or misleading, and do not use LostLink to harass
          or scam other people.
        </li>
      </ul>

      <h5 className="fw-bold mt-4">5. Meeting other people safely</h5>
      <p>
        Once a match is confirmed, you can chat with the other person. Meet in a public place,
        bring a friend if you can, and never send money or sensitive details to get an item back.
        LostLink is not responsible for what happens between users.
      </p>

      <h5 className="fw-bold mt-4">6. Removing content and accounts</h5>
      <p>
        We may remove posts or accounts that break these terms or put other users at risk.
      </p>

      <h5 className="fw-bold mt-4">7. Changes</h5>
      <p>
        These terms may change as the project grows. The date at the top shows when they were last
        updated.
      </p>

      <h5 className="fw-bold mt-4">8. Contact</h5>
      <p>
        Questions? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also our{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>
    </div>
  );
}

export default Terms;
