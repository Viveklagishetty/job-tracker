# Job Application Tracker

A full-stack Job Application Tracker built with React, Flask, and MySQL. Allows authenticated users to manage job applications, track status, view dashboard statistics, and update or delete applications.

## Features

- **Authentication**: User registration, login, logout with secure password hashing (Flask-Bcrypt) and session-based auth
- **Job Application Management**: Add, view, edit, delete applications with filters by status
- **Dashboard**: Total applications count, status breakdown, latest 5 applications
- **Security**: Each user can only access their own applications; passwords hashed before storage

## Technology Stack

- **Frontend**: React, Vite, React Router DOM, Axios
- **Backend**: Python, Flask, Flask-Bcrypt, Flask-CORS, MySQL Connector/Python
- **Database**: MySQL

## Database Setup

```sql
CREATE DATABASE job_tracker;
USE job_tracker;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    status ENUM('Applied', 'Shortlisted', 'Interview Scheduled', 'Offer Received', 'Rejected') DEFAULT 'Applied',
    applied_on DATE NOT NULL,
    location VARCHAR(100),
    job_url VARCHAR(255),
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment (Windows):
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   Or if requirements.txt doesn't exist:
   ```bash
   pip install flask flask-bcrypt flask-cors mysql-connector-python python-dotenv
   pip freeze > requirements.txt
   ```

4. Create `backend/.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=YOUR_MYSQL_PASSWORD
   DB_NAME=job_tracker
   SECRET_KEY=YOUR_SECRET_KEY
   ```

5. Start Flask server:
   ```bash
   python app.py
   ```
   Backend runs at: `http://127.0.0.1:5000`

## Frontend Setup

1. Open new terminal and navigate to frontend:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start React development server:
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login and create session |
| GET | `/api/logout` | Logout and clear session |
| GET | `/api/me` | Get current logged-in user |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | Get user's applications |
| POST | `/api/applications` | Add new application |
| PUT | `/api/applications/<id>` | Update application |
| DELETE | `/api/applications/<id>` | Delete application |
| GET | `/api/applications/stats` | Get dashboard statistics |

## Application Statuses

- Applied
- Shortlisted
- Interview Scheduled
- Offer Received
- Rejected

## Running the Project

1. Start backend:
   ```bash
   cd backend
   .\venv\Scripts\Activate.ps1
   python app.py
   ```

2. Start frontend (new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open browser: `http://localhost:5173`


**Important**: Ensure `backend/.env` and `backend/venv/` are in `.gitignore` before pushing.

