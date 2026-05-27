## 👨‍💻 Team Members

| Name | Role |
|------|------|
| Deepak Singh Jadon | Backend Development |
| Deepak Gurjar | Frontend Development |
| Chirag Mandloi | Data Collection & Gathering |

# 🏨 WanderLust — Airbnb Clone

A full-stack web application inspired by Airbnb, where users can create, explore, and book property listings from around the world.

---

## 🛠️ Technology Stack and Tools Used

### Backend
- **Node.js** — Runtime environment
- **Express.js** — Web framework
- **MongoDB** — NoSQL Database
- **Mongoose** — MongoDB ODM

### Frontend
- **EJS** — Templating engine
- **Bootstrap 5** — CSS Framework
- **Font Awesome** — Icons

### Authentication & Security
- **Passport.js** — Authentication middleware
- **passport-local-mongoose** — Username/password strategy
- **express-session** — Session management
- **connect-mongo** — MongoDB session store

### File Upload
- **Cloudinary** — Cloud image storage
- **Multer** — File upload middleware

### Validation
- **Joi** — Schema validation

---

## ✨ Features and Functionalities Implemented

- 🔐 **User Authentication** — Signup, Login, Logout using Passport.js
- 🏠 **Listing Management** — Create, Read, Update, Delete (CRUD) property listings
- 📸 **Image Upload** — Upload listing images to Cloudinary
- ⭐ **Reviews & Ratings** — Add and delete reviews with star ratings
- 📅 **Booking System** — Book listings with check-in/check-out dates and total price calculation
- 🗓️ **My Bookings** — View and cancel your bookings
- 🔍 **Search** — Search listings by location
- 🗂️ **Category Filter** — Filter listings by category (Trending, Mountain, Castles, etc.)
- 🛡️ **Authorization** — Only listing owners can edit/delete their listings
- ⚡ **Flash Messages** — Success and error notifications
- 📱 **Responsive Design** — Mobile-friendly UI using Bootstrap

---

## ⚙️ Installation / Execution Steps to Run the Project

### Prerequisites
- Node.js (v18+)
- MongoDB
- Cloudinary Account

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/DeepakJadon168/HotelHub.git
cd HotelHub
```

**2. Install dependencies**
```bash
npm install
```

**3. Create `.env` file in root directory**
