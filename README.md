# 🔗 LostLink – AI-Powered Lost & Found Platform

> **Recover. Connect. Restore.**

LostLink helps people get lost items back. Someone who lost an item and someone who found one
are paired automatically using **text embeddings + location + time**, and after both sides are
happy with the match they can talk in a **private real-time chat**.

* Frontend: https://lost-link-xi.vercel.app
* Backend API: https://lostlink-wbtc.onrender.com

> Both run on free tiers. After a period of inactivity the backend sleeps and the first request
> can take 20–50 seconds while it wakes up.

---

## 🚀 Features

* **Accounts** – register / login with JWT (tokens expire after 7 days).
* **Upload lost or found items** – title, description, photo (Cloudinary) and a location picked on
  an OpenStreetMap map (Leaflet, with address search via Nominatim).
* **AI matching** – every upload is embedded and compared with nearby items of the opposite type.
* **Privacy before confirmation** – a pending match shows only the other item's title and type.
  The photo, description and owner are sent by the server only after the match is confirmed.
* **Private real-time chat** – available only to the two people in a confirmed match
  (Socket.io, authenticated with the same JWT).
* **Static pages** – About, Terms and Privacy.

---

## 🤖 How matching works

1. An upload is turned into a vector with an embedding model and saved with its location.
2. The server finds items of the opposite type within **5 km** (MongoDB `2dsphere` index) and
   scores each pair (`backend/services/scoring.js`):

   | Signal | Weight |
   |---|---|
   | Semantic similarity (embedding cosine, or word overlap when no embedding) | 45% |
   | Title word overlap | 25% |
   | Distance (closer is better, 5 km → 0) | 15% |
   | Time between the two posts (7-day half-life) | 15% |

3. A pair becomes a match when it clears a **per-model threshold** and has at least some
   text-based evidence. Location and time alone can never create a match.
4. Vectors from different models are never compared; those pairs use the word-overlap fallback.

**Embedding providers** (`EMBEDDING_PROVIDER`):

| Value | Cost | Notes |
|---|---|---|
| `gemini` | free tier | `gemini-embedding-001`, needs `GEMINI_API_KEY`. Used in production. |
| `local` (default) | free | MiniLM running inside the server, no key; needs ~200 MB RAM |
| `openai` | paid | `text-embedding-3-small`, needs `OPENAI_API_KEY` |

If the provider fails (missing key, quota, network) the upload still succeeds and that item is
matched with the word-overlap fallback. Each match records which `mode` produced it
(`ai` or `fallback`).

### Evaluating the matcher

`backend/eval/pairs.json` holds 36 hand-written lost/found pairs (16 same item, 20 different,
including hard look-alikes). From `backend/`:

```bash
npm run eval:matching            # old vs new scoring, plus the threshold sweep
npm run eval:matching -- --verbose   # also lists every wrong pair
```

Measured results on that set (fictional, small, and thresholds were tuned on it, so read it as
"much better than the original", not as real-world accuracy):

| Scoring | Precision | Recall |
|---|---|---|
| Original (title gate + word overlap) | 53% | 63% |
| New, word overlap only | 71% | 75% |
| New + local MiniLM | 88% | 94% |
| New + Gemini | 100% | 94% |

Adding a new embedding model? Run the evaluation and add a calibration profile for it in
`scoring.js` – every model spreads its similarity scores differently.

---

## 🔒 Security notes

* Every match / chat endpoint checks that the caller is one of the two participants; a stranger
  gets the same "not found" as for a match that does not exist.
* Chat is allowed only on **confirmed** matches. Sockets must present a valid JWT and can only
  join rooms of their own confirmed matches. Messages are saved by the REST endpoint and then
  pushed by the server – clients cannot publish into a room directly.
* Rate limiting (global, stricter on auth and uploads), `helmet`, 100 kB body limit, input
  validation, uniform login errors, and a JSON error handler (no stack traces).
* Embedding vectors are never returned to the browser.

Known limitations: JWT is kept in `localStorage`; confirming a match is one-sided (one person's
confirmation opens the chat for both); there is no password reset or email verification yet.

---

## 🏗 Tech stack

* **Frontend:** React 19 (Vite), React Router, Bootstrap, Axios, Socket.io-client,
  Leaflet / react-leaflet
* **Backend:** Node.js, Express 5, MongoDB (Mongoose), Socket.io, JWT, bcryptjs
* **Services:** MongoDB Atlas, Cloudinary (photos), Google Gemini API (embeddings),
  OpenStreetMap + Nominatim (map and address search)
* **Hosting:** Vercel (frontend), Render (backend)

---

## 📂 Project structure

```
frontend/
 └── src/
     ├── components/   Navbar, MapPicker, ...
     ├── context/      auth + alert providers
     ├── pages/        Home, Upload, Match, Chat, Dashboard, Login, Register, About, Terms, Privacy
     └── App.jsx

backend/
 ├── config/        database connection (retries before giving up)
 ├── controllers/   auth, items, matches, messages, users
 ├── middleware/    JWT check
 ├── models/        User, Item, Match, Message
 ├── routes/
 ├── services/      aiService (embedding providers), scoring, matchService, matchAccess
 ├── socket/        authenticated Socket.io rooms
 ├── eval/          labelled pairs + evaluation runner
 ├── scripts/       reembed.js
 └── server.js
```

---

## ⚙️ Running locally

Needs Node 20+ (production uses 22) and a MongoDB database.

```bash
git clone https://github.com/A3H1N4V07/LostLink.git
cd LostLink
```

**Backend**

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
FRONTEND_URL=http://localhost:5173

# embeddings: gemini | local | openai   (default: local)
EMBEDDING_PROVIDER=gemini
GEMINI_API_KEY=your_google_ai_studio_key
# OPENAI_API_KEY=only_if_EMBEDDING_PROVIDER=openai
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Optional `frontend/.env`: `VITE_API_URL=http://localhost:5000` (defaults to this in development
and to the Render URL in production builds). The Cloudinary cloud name and upload preset are set
in `frontend/src/pages/Upload.jsx`.

Never commit `.env` files (they are git-ignored).

### Re-embedding old items

Items created before you switched embedding models keep their old vectors and are matched with
the word-overlap fallback. To re-embed them:

```bash
cd backend
node scripts/reembed.js            # dry run: lists what would change, writes nothing
node scripts/reembed.js --apply    # embeds and saves
```

It uses the `MONGO_URI` in `backend/.env`, so check which database that points at first.

---

## 🧪 CI

`.github/workflows/main.yml` runs on every push and pull request to `main`: installs both apps,
loads the backend modules, runs the offline scoring evaluation, and builds the frontend.
There is no automated test suite yet.

---

## 💡 Future improvements

* Require both people to confirm a match
* Notifications (email / push) for new matches
* Re-run matching for older items after an embedding switch
* Image-based matching (photo captions or image embeddings)
* An LLM re-ranking step for the top few candidates
* Password reset, email verification, and httpOnly-cookie sessions
* A proper automated test suite

---

## 🤝 Contribution

Feel free to fork this repo and contribute.
