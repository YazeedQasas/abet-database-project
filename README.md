# ABET Assessment Management System

A comprehensive web application for managing ABET (Accreditation Board for Engineering and Technology) assessment processes, built with Django REST Framework backend and React frontend.

## 🎥 Demo Video

[![ABET Assessment Demo](https://img.shields.io/badge/Watch-Demo%20Video-red?style=for-the-badge&logo=youtube)](https://youtu.be/vVUlcCkmDNM?si=FCXPTOjkwCQQb-Lj)

*Click the badge above to watch a full demonstration of the system's features and capabilities.*

## 📋 Table of Contents

- (#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Development_setup](#Development_setup)
- [Contributing](#contributing)

## ✨ Features [Features]

- **Dashboard Analytics**: Comprehensive ABET compliance tracking and metrics
- **User Management**: Role-based access control (Admin, Faculty, Evaluator, Reviewer)
- **Assessment Management**: Create, track, and evaluate student learning outcomes
- **Program Management**: Manage departments, programs, courses, and faculty
- **Reporting System**: Generate PDF reports and compliance documentation
- **Faculty Training**: Track and manage faculty training requirements
- **Audit Logging**: Complete activity tracking and audit trails
- **Real-time Updates**: Live dashboard updates and notifications

## 🖥️ System Requirements [#system-requirements]

### Backend Requirements
- Python 3.8 or higher
- MySQL Workbench
- Redis (optional, for caching)

### Frontend Requirements
- Node.js 16.0 or higher
- npm 8.0 or higher

### Operating System
- Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+ recommended)

## 🚀 Installation [#installation]

### 1. Clone the Repository

git clone https://github.com/yourusername/abet-assessment-system.git
cd abet-database-project


### 2. Backend Setup

# Create virtual environment
python -m venv venv
source venv/bin/activate 

# Install dependencies [#dependencies]
pip install -r requirements.txt

# For development
pip install -r requirements-dev.txt

On Windows
venv\Scripts\activate

On macOS/Linux
source venv/bin/activate

#### Install Python Dependencies
pip install -r requirements.txt


#### Database Setup
Run migrations
python manage.py makemigrations
python manage.py migrate

Create superuser
python manage.py createsuperuser


### 3. Frontend Setup

cd ../frontend
npm install


## ⚙️ Configuration [#configuration]

### 1. Environment Variables

Create a `.env` file in the backend directory:

Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'db_name',
        'USER' : 'your_user',
        'PASSWORD' : 'your_password', 
        'HOST' : '127.0.0.1',
    }
}


CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000



### 2. Frontend Configuration 

Create a `.env` file in the frontend directory:

REACT_APP_API_URL=http://localhost:8001/api
REACT_APP_BASE_URL=http://localhost:8001

text

## 🏃‍♂️ Running the Application [#running-the-application]

### 1. Start the Backend Server

cd abet_assessment
python manage.py runserver 8001

cd AIS-page\flask_backend
python app.py


The Django server will start at `http://localhost:8001`

### 2. Start the Frontend Development Server

cd abet_frontend/
npm start

cd AIS-page\AIS\rushdi-course-navigator-main
npm run dev


The React application will start at `http://localhost:3000`

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api
- **Django Admin**: http://localhost:8001/admin
- **Archive Frontend**: http://localhost:8080/
- **Archive Backend API**: http://localhost:8000/api/
## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/logout/` - User logout

### Core Endpoints
- `GET /api/dashboard-stats/` - Dashboard statistics
- `GET /api/programs/` - List programs
- `GET /api/courses/` - List courses
- `GET /api/assessments/` - List assessments
- `GET /api/abet-outcomes/` - ABET outcomes data
- `GET /api/faculty-training/` - Faculty training records

### User Management
- `GET /api/users/` - List users
- `POST /api/users/` - Create user
- `PUT /api/users/{id}/` - Update user

## 📁 Project Structure [#project-structure]

abet-assessment-system/
├── backend/
│ ├── abet_assessment/
│ │ ├── settings.py
│ │ ├── urls.py
│ │ └── wsgi.py
│ ├── apps/
│ │ ├── assessment/
│ │ ├── programs/
│ │ ├── users/
│ │ ├── reports/
│ │ └── core/
│ ├── requirements.txt
│ └── manage.py
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ ├── context/
│ │ └── assets/
│ ├── package.json
│ └── public/
└── README.md


## 🔧 Development Setup [#Development_setup]

### Database Seeding (Optional)

Load sample data
python manage.py loaddata fixtures/sample_data.json

Or create custom fixtures
python manage.py dumpdata --indent 2 > fixtures/backup.json


## 🤝 Contributing [#contributing]

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/YazeedQasas/abet-database-project/blob/main/LICENSE) file for details.


## 🙏 Acknowledgments

- ABET for accreditation standards and guidelines
- Django and React communities for excellent documentation
- Contributors and testers who helped improve this system
