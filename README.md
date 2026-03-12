# 🚀 Mini AI LinkedIn

A full-stack professional networking platform with AI features, built with Node.js, Express, MongoDB, Firebase Auth, Cloudinary, and Groq AI.

![Mini LinkedIn](https://img.shields.io/badge/Mini-LinkedIn-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

---

## ✨ Features

- 🔐 **Firebase Authentication** — Secure email/password signup & login
- 👤 **Professional Profiles** — Name, headline, bio, skills, experience, education
- 📝 **Post System** — Create posts with images, like, and comment
- 🎯 **Skill Match Notifications** — AI detects skills in posts and matches users
- 🤝 **Professional Networking** — Connect with people, grow your network
- 💼 **Job Portal** — Post and discover jobs with tailored requirements
- 🏢 **Company Pages** — Explore, follow, and manage companies
- 🔍 **Global Search** — Quickly find people, jobs, and companies
- 🤖 **AI Bio Enhancer** — Polish your bio with Groq AI (LLaMA 3.3)
- ✍️ **AI Caption Enhancer** — Make your posts more professional
- 🖼️ **Image Swapping** — Cloudinary-powered image storage with local fallback
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile

---

## 📋 Prerequisites

Before running the app, make sure you have:

1. **Node.js** (v16 or higher) — [Download](https://nodejs.org/)
2. **MongoDB** — Running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
3. **Firebase Project** — [Create one](https://console.firebase.google.com/)
4. **Cloudinary Account** — [Sign up free](https://cloudinary.com/)
5. **Groq API Key** — [Get one free](https://console.groq.com/)

---

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd "Mini LinkedIN"
npm install
```

### 2. Configure Firebase

#### a) Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → **Email/Password** sign-in method

#### b) Get Firebase Admin SDK Key
1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate new private key**
3. Save the JSON file as `config/serviceAccountKey.json`

#### c) Get Firebase Web Config
1. Go to **Project Settings** → **General** → scroll to **Your apps**
2. Click **Add app** → **Web**
3. Copy the config object
4. Update `frontend/js/firebase-config.js` with your values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Configure Cloudinary

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy your Cloud Name, API Key, and API Secret

### 4. Get Groq API Key

1. Go to [Groq Console](https://console.groq.com/)
2. Create a new API key

### 5. Set Environment Variables

Edit the `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/mini-ai-linkedin
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
PORT=5000
```

### 6. Start the Application

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The app will be available at: **http://localhost:5000**

---

## 📁 Project Structure

```
mini-ai-linkedin/
│
├── frontend/                  # Frontend (HTML + Tailwind + JS)
│   ├── index.html            # Landing page
│   ├── login.html            # Login page
│   ├── signup.html           # Signup page
│   ├── feed.html             # Main feed
│   ├── profile.html          # Profile view
│   ├── edit-profile.html     # Edit profile
│   ├── notifications.html    # Notifications
│   ├── css/
│   │   └── styles.css        # Custom CSS (design system)
│   └── js/
│       ├── firebase-config.js # Firebase client config
│       ├── api.js             # API communication layer
│       └── utils.js           # Shared utilities
│
├── backend/                   # Backend (Node.js + Express)
│   ├── server.js             # Express server entry point
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Post.js           # Post schema
│   │   └── Notification.js   # Notification schema
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── aiController.js
│   │   └── notificationController.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── postRoutes.js
│   │   ├── aiRoutes.js
│   │   └── notificationRoutes.js
│   └── middleware/
│       └── auth.js           # Firebase token verification
│
├── config/
│   ├── firebase.js           # Firebase Admin SDK config
│   ├── cloudinary.js         # Cloudinary config
│   └── serviceAccountKey.json # (You add this - Firebase Admin key)
│
├── .env                      # Environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create user profile |
| GET | `/api/users/me` | Get current user |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user profile |
| GET | `/api/users/:id/suggestions` | Get skill-match suggestions |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts` | Create a post |
| GET | `/api/posts` | Get feed (paginated) |
| POST | `/api/posts/:id/like` | Like/unlike a post |
| POST | `/api/posts/:id/comment` | Comment on a post |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs` | Post a new job |
| GET | `/api/jobs` | Get all jobs |
| GET | `/api/jobs/:id` | Get job details |

### Companies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List all companies |
| POST | `/api/companies` | Register a new company |
| POST | `/api/companies/:id/follow` | Follow/unfollow company |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/enhance-bio` | AI bio enhancement |
| POST | `/api/ai/enhance-caption` | AI caption enhancement |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get all notifications |
| PUT | `/api/notifications/read` | Mark all as read |

---

## 🧪 Sample Test Data

After creating an account, you can test with these sample profiles:

### Sample User 1
- **Name:** Alex Developer
- **Headline:** Full Stack JavaScript Developer
- **Bio:** Passionate full stack developer with 3+ years of experience building web applications using React, Node.js, and MongoDB. Love open source!
- **Skills:** JavaScript, React, Node.js, MongoDB, TypeScript
- **Location:** San Francisco, CA

### Sample User 2
- **Name:** Sarah Data
- **Headline:** Data Scientist | Machine Learning Engineer
- **Bio:** Data scientist specializing in NLP and computer vision. Building AI models that make a difference.
- **Skills:** Python, Machine Learning, TensorFlow, Data Science, SQL
- **Location:** New York, NY

### Sample Post Captions
```
"Just finished building a REST API with Node.js and Express! 🚀 
The power of JavaScript on the backend is incredible. 
#webdevelopment #nodejs"

"Excited to share that I completed the Machine Learning 
specialization on Coursera! Python and TensorFlow are 
amazing tools for AI development. 🤖"

"Started learning React today and built my first component! 
The virtual DOM concept is brilliant. 
Any tips for a React beginner?"
```

---

## 🤖 AI Features

### Bio Enhancement
1. Go to **Edit Profile**
2. Write your bio (even a rough draft)
3. Click **"Improve with AI"**
4. The AI will rewrite it professionally

### Caption Enhancement
1. Open **Create Post** modal
2. Write your caption
3. Click **"Enhance with AI"**
4. AI makes it more engaging and professional

---

## 📱 Pages Overview

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | Welcome page with features |
| Login | `/login` | Firebase email/password login |
| Signup | `/signup` | Account creation |
| Feed | `/feed` | Main feed with 3-column layout |
| Profile | `/profile` | View profile (own or others) |
| Edit Profile | `/edit-profile` | Edit your profile |
| Notifications | `/notifications` | Skill match & activity alerts |

---

## 🎨 Design System

The app uses a custom design system built on top of Tailwind CSS:

- **Colors:** LinkedIn-inspired blue palette with green accents
- **Typography:** Inter font family
- **Animations:** Fade-in, slide, scale, and pulse effects
- **Components:** Cards, buttons, skill tags, toasts, modals
- **Loading States:** Skeleton loaders and spinners

---

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

Built with ❤️ using Node.js, Express, MongoDB, Firebase, Cloudinary, and Groq AI
