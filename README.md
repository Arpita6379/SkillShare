# Skill Share Platform

A fullstack web application for skill swapping, featuring user and admin panels, announcements, swap moderation, feedback and rating system, and more.

## Features
- User registration, login, and profile management
- Skill listing and searching
- Swap requests and management
- Admin panel for user management, swap moderation, and announcements
- Announcements system (admin posts, all users view)
- Review and rating system for completed swaps
- Real-time statistics and reports for admins

## Project Structure
```
skill_share/
  client/      # React frontend
  server/      # Express/MongoDB backend
```

## Setup Instructions

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone <repo-url>
cd skill_share
```

### 2. Install dependencies
```bash
cd client
npm install
cd ../server
npm install
```

### 3. Configure environment variables
- Copy `server/env.example` to `server/.env` and fill in your MongoDB URI and other secrets.

### 4. Run the development servers
- In one terminal:
  ```bash
  cd server
  npm start
  ```
- In another terminal:
  ```bash
  cd client
  npm start
  ```

### 5. Access the app
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)

## Admin Access
- The super admin account is `p@p.com`. Only this user can access the admin panel and features.

## License
MIT 