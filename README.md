# 📅 QalamFlow — Weekly Study Planner

Welcome to **QalamFlow** — a smart weekly study planner for students.
This project features **JWT & Google OAuth authentication**, **PDF export**, **dark mode**, **student feedback**, and a **project suggestion system** with Telegram and email notifications.

---


## 🔗 Demo

Check out the project live: [QalamFlow](https://qalamflow.com/)

---

## 🚀 Features

- 🔐 **Authentication** — register/login with email+password or Google OAuth
- 🌙 **Dark / Light mode** — theme toggle with localStorage persistence
- 📅 **Weekly planner** — build a personalized study schedule with subjects and time slots
- 📄 **PDF export** — print or download your weekly plan as a PDF
- 💬 **Feedback page** — leave reviews with emoji reactions (Bad / Decent / Love it!)
- 🗳️ **Suggest a project** — submit project ideas with Telegram + email notifications
- 👤 **Custom avatar** — upload a profile picture from the workspace
- 🖥️ **Optimistic UI** — feedback posts instantly without waiting for the server
- 📱 **Fully responsive** — works on desktop and mobile

---

## 📦 Tech Stack

### Frontend

- **React 19** + **TypeScript** — UI library
- **Vite** — build tool
- **React Router v7** — client-side routing
- **CSS Modules** — component-level styling
- **emoji-picker-react** — Apple-style emoji rendering
- **jsPDF** — PDF generation
- **Lucide React** — icon library
- **@react-oauth/google** — Google Sign-In

### Backend

- **Express.js 5** — REST API
- **MongoDB + Mongoose** — database
- **JWT (jsonwebtoken)** — token-based authentication
- **bcryptjs** — password hashing
- **nodemailer** — email notifications
- **Telegram Bot API** — instant notifications on new suggestions

---

## 📂 Project Structure

```
📂 frontend/src/
  📂 api/
    client.ts               # Typed fetch wrapper
    types.ts                # Shared TypeScript interfaces
  📂 components/
    Navigation.tsx          # Top nav with auth state & theme toggle
    Footer.tsx              # Site footer
    UserAvatar.tsx          # Avatar with edit overlay
    TagIcon.tsx             # Apple-style emoji renderer
    CTAButton.tsx           # Reusable CTA button
    Logo.tsx                # Brand logo
    ProtectedRoute.tsx      # Auth guard for private routes
  📂 context/
    AuthContext.tsx         # User session & login/logout
    AvatarContext.tsx       # Custom avatar upload via canvas
    ThemeContext.tsx        # Dark/light mode
  📂 hooks/
    useAvatar.ts            # Re-export of AvatarContext hook
    useCopy.ts              # Clipboard copy helper
  📂 pages/
    Home/                   # Landing page with features & how-it-works
    Workspace/              # Weekly planner + PDF export
    Feedback.tsx            # Student reviews with emoji reactions
    SuggestProject.tsx      # Project idea submission form
    Login.tsx               # Email & Google login
    Register.tsx            # Registration form
    NotFound.tsx            # 404 page

📂 backend/
  server.js                 # Express app entry point
  📂 config/
    mongodb.js              # MongoDB connection
  📂 controllers/
    authController.js       # register, login, googleLogin, getMe
    feedbackController.js   # CRUD for feedback entries
    suggestionController.js # Submit project suggestions + notify
  📂 middleware/
    auth.js                 # JWT auth middleware
    optionalAuth.js         # Auth middleware (non-blocking)
  📂 models/
    User.js                 # User schema (name, email, password, avatar)
    Feedback.js             # Feedback schema (rating, message, userId)
    Suggestion.js           # Suggestion schema (title, details, type)
  📂 routes/
    auth.js                 # /api/auth/*
    feedback.js             # /api/feedback/*
    suggestions.js          # /api/suggestions/*
  📂 services/
    notify.js               # sendTelegram() & sendEmail()
```

---

## 🗂️ Pages

| Route              | Description                       |
| ------------------ | --------------------------------- |
| `/`                | Home — landing page with features |
| `/workspace`       | Weekly planner (protected)        |
| `/feedback`        | Student reviews                   |
| `/suggest-project` | Submit a project idea             |
| `/login`           | Login (email or Google)           |
| `/register`        | Create an account                 |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

---

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>

# ── Backend ──
cd backend
npm install
npm run dev        # runs on http://localhost:3000

# ── Frontend ──
cd frontend
npm install
npm run dev        # runs on http://localhost:3001
```

---

## 🧠 How It Works

1. **Sign up or log in** — create an account or use Google
2. **Build your plan** — add subjects, time slots, and days in the Workspace
3. **Export to PDF** — print or save your weekly schedule
4. **Leave feedback** — rate the app and share your experience
5. **Suggest a project** — submit an idea and get notified via Telegram/email

---

## ⚡ Lighthouse Scores (incognito, production)

![Lighthouse scores](./frontend/public/Lightroom.png)

| Metric         | Score |
| -------------- | ----- |
| Performance    | 98    |
| Accessibility  | 95    |
| Best Practices | 96    |
| SEO            | 100   |

---

## 🌐 Browser Compatibility

Tested and working on:

| Browser | Version | Status          |
| ------- | ------- | --------------- |
| Chrome  | 120+    | ✅ Full support |
| Firefox | 121+    | ✅ Full support |
| Safari  | 17+     | ✅ Full support |
| Edge    | 120+    | ✅ Full support |

Responsive design covers **320px – 1600px** screen widths.
