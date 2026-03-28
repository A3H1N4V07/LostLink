# 🔗 LostLink – AI-Powered Lost & Found Platform

> **Recover. Connect. Restore.**

LostLink is a full-stack web application that helps users find lost items using **AI-based matching + location intelligence**.
It connects users who lost items with those who found them and enables secure communication via real-time chat.

---

## 🚀 Features

### 🔐 Authentication

* User registration & login (JWT-based)
* Protected routes for secure access

### 📦 Item Upload

* Upload lost/found items with:

  * Title & description
  * Image (Cloudinary)
  * Location (Google Maps integration)

### 🤖 AI Matching System

* Uses **text embeddings (Gemini API)** to understand item descriptions
* Computes **cosine similarity** between items
* Prioritizes:

  1. 📍 Location proximity
  2. 🏷 Title similarity
  3. 📝 Description similarity

### 📍 Geo-based Filtering

* Matches only items within a defined radius (e.g., 5km)
* Uses MongoDB geospatial queries

### 🔗 Smart Matching

* Automatically pairs **lost ↔ found** items
* Displays:

  * Match confidence %
  * Distance between users

### 💬 Real-Time Chat

* Built with **Socket.io**
* Private chat between matched users
* WhatsApp-style UI

### 🎨 Modern UI/UX

* Built with React + Bootstrap
* Custom global toast notification system
* Clean and responsive design

---

## 🏗 Tech Stack

### Frontend

* React (Vite)
* Bootstrap
* Axios
* Socket.io-client

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* Socket.io

### APIs & Services

* Google Maps API (location picker)
* Cloudinary (image upload)
* Gemini API (text embeddings)

---

## 📂 Project Structure

```
frontend/
 ├── src/
 │   ├── components/
 │   ├── context/
 │   ├── pages/
 │   ├── services/
 │   └── App.jsx

backend/
 ├── models/
 ├── routes/
 ├── controllers/
 ├── services/
 └── server.js
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/lostlink.git
cd lostlink
```

---

### 2️⃣ Setup Backend

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file:

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GEMINI_API_KEY=your_api_key
```

---

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🎯 How It Works

1. User uploads a lost/found item
2. Backend:

   * Generates embedding using Gemini
   * Stores item + vector + location
3. Matching:

   * Filters nearby items (geo query)
   * Calculates cosine similarity
   * Ranks results
4. User sees best matches
5. On confirmation → chat is enabled

---


## 💡 Future Improvements

* 🔔 Push notifications
* 📱 Mobile app version
* 🟢 Online/offline indicators
* 📊 Analytics dashboard
* 🧠 Better ML ranking model

---

## 🤝 Contribution

Feel free to fork this repo and contribute!


