# 🎉 Event Organizer Web App

A full-stack event management platform that allows users to create, manage, and register for events with real-time seat tracking and user-specific dashboards.

---

## 🚀 Features

- 🔐 User Authentication (Login / Signup)
- 🎉 Create Events with:
  - Title, Description, Date & Time
  - Location & Category
  - Pricing (Free / Paid / Invite Only)
  - Capacity Management
- 📅 Browse All Events
- 🧑‍💼 “My Events” Dashboard (events created by user)
- 📝 Event Registration System
- 📊 Real-time Seat Tracking:
  - Registered count
  - Available seats
  - Percentage filled
- 🚫 Prevent Duplicate Registration
- 🗑 Delete Events

---

## 🛠 Tech Stack

### Frontend
- HTML
- CSS (Custom + Tailwind utility classes)
- Vanilla JavaScript (Fetch API)

### Backend
- Node.js
- Express.js

### Database
- Turso (SQLite-based cloud database)

---

## 📂 Project Structure

```

event-organizer/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── eventRoutes.js
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── create-event.html
│   ├── events.html
│   ├── my_events.html
│   ├── event-details.html
│   └── css/
│
├── README.md
└── package.json

````

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Souvagya06/event-organizer.git
cd event-organizer
````

---

### 2️⃣ Install dependencies

```bash
cd backend
npm install
```

---

### 3️⃣ Setup Environment Variables

Create a `.env` file inside `backend/`:

```
TURSO_DATABASE_URL=your_database_url
TURSO_AUTH_TOKEN=your_auth_token
```

---

### 4️⃣ Run the server

```bash
node server.js
```

Server will run at:

```
http://localhost:3000
```

---

## 🧠 Core Functionality

### 🔹 Event Registration Flow

1. User logs in
2. User clicks **Register**
3. Backend checks for duplicate registration
4. Registration is stored in database
5. UI updates instantly with new seat count

---

### 🔹 Seat Tracking Logic

Seat availability is dynamically calculated using:

```sql
COUNT(r.event_id) AS total_registered
```

---

### 🔹 Frontend Calculation

```js
const filled = ev.total_registered || 0;
const capacity = ev.capacity || 0;

const percent = capacity > 0
  ? Math.round((filled / capacity) * 100)
  : 0;

const seatsLeft = capacity - filled;
```

---

## 🗄 Database Schema

### 📌 events

* id (Primary Key)
* title
* description
* date
* time
* location
* category
* user_email
* price
* access_type
* capacity
* created_at

---

### 📌 registrations

* id (Primary Key)
* event_id (Foreign Key)
* user_email
* created_at

---

### 📌 users

* id (Primary Key)
* name
* email
* password
* created_at

---

## 📸 Screenshots

*Add screenshots here (recommended for better presentation):*

* Events Page
* Create Event Page
* My Events Dashboard

---

## 🚀 Future Improvements

* 🚫 Prevent overbooking (capacity limit enforcement)
* 🔄 Live updates (WebSockets)
* 📱 Improved mobile responsiveness
* 🎟 QR-based ticket system
* 📧 Email notifications
* 👥 Attendee list view

---

## 🧑‍💻 Author

**Souvagya Karmakar**
GitHub: [https://github.com/Souvagya06](https://github.com/Souvagya06)

---

## 📄 License

This project is open-source and available under the MIT License.

```