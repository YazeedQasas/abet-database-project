# ABET Assessment Management System

A comprehensive web application for managing ABET (Accreditation Board for Engineering and Technology) assessment processes, built with Django REST Framework and Flask backend with React frontend.

![Screenshot 2025-06-17 234812](https://github.com/user-attachments/assets/014868f4-08c3-4b17-ba90-2634a663cb17)

![Screenshot 2025-06-17 234858](https://github.com/user-attachments/assets/58f49443-b10e-4622-9813-da046422d100)

![Screenshot 2025-06-17 235322](https://github.com/user-attachments/assets/27c7048c-3370-4c18-8f93-428cff0bdb4b)

![Screenshot 2025-06-18 000524](https://github.com/user-attachments/assets/24a91107-059e-4f2c-a616-8e24b3c13815)


## 🎥 Demo Video

[![ABET Assessment Demo](https://img.shields.io/badge/Watch-Demo%20Video-red?style=for-the-badge&logo=youtube)](https://youtu.be/vVUlcCkmDNM?si=FCXPTOjkwCQQb-Lj)

*Click the badge above to watch a full demonstration of the system's features and capabilities.*

## 📋 Table of Contents

- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Contributing](#contributing)

<a id="features"></a>
## ✨ Features

- **Dashboard Analytics**: Comprehensive ABET compliance tracking and metrics[1][6][7]
- **User Management**: Role-based access control (Admin, Faculty, Evaluator, Reviewer)[4]
- **Assessment Management**: Create, track, and evaluate student learning outcomes[8]
- **Program Management**: Manage departments, programs, courses, and faculty[3][5]
- **Reporting System**: Generate PDF reports and compliance documentation[1][2]
- **Faculty Training**: Track and manage faculty training requirements[8]
- **Audit Logging**: Complete activity tracking and audit trails[8]
- **Real-time Updates**: Live dashboard updates and notifications[7]
- **ABET Outcomes Tracking**: Monitor student outcomes compliance[8]
- **Assessment Questions**: Manage assessment questions and rubrics[8]

<a id="system-requirements"></a>
## 🖥️ System Requirements

### Backend Requirements
- Python 3.8 or higher
- MySQL 8.0 or higher
- Redis (optional, for caching)

### Frontend Requirements
- Node.js 16.0 or higher
- npm 8.0 or higher

### Operating System
- Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+ recommended)

<a id="installation"></a>
## 🚀 Installation

### 1. Clone the Repository

git clone https://github.com/yourusername/abet-assessment-system.git
cd abet-database-project



### 2. Backend Setup

#### Create Virtual Environment
Create virtual environment
python -m venv venv

On Windows
venv\Scripts\activate

On macOS/Linux
source venv/bin/activate



#### Install Python Dependencies
pip install -r requirements.txt

For development
pip install -r requirements-dev.txt



#### Database Setup
Run migrations
python manage.py makemigrations
python manage.py migrate

Create superuser
python manage.py createsuperuser



### 3. Frontend Setup

cd abet_frontend/
npm install



<a id="dependencies"></a>
## 📦 Dependencies

### Backend Dependencies (requirements.txt)

Django Core
Django==5.0.7
django-extensions==3.2.3

Django REST Framework
djangorestframework==3.14.0
django-filter==23.3
django-cors-headers==4.3.1

Database
mysqlclient==2.2.0

Authentication & Security
djangorestframework-simplejwt==5.3.0

Development & Debugging
python-decouple==3.8

PDF Generation & Reports
reportlab==4.0.4
openpyxl==3.1.2
pandas==2.1.3
numpy==1.25.2

Image Processing
Pillow==10.0.1

Async Task Processing (Optional)
celery==5.3.4
redis==5.0.1

Testing
pytest==7.4.3
pytest-django==4.7.0

Production Server
gunicorn==21.2.0

Environment Variables
python-dotenv==1.0.0

Timezone Support
pytz==2023.3

Additional Utilities
requests==2.31.0



### Frontend Dependencies (package.json)

{
"name": "abet-assessment-frontend",
"version": "1.0.0",
"private": true,
"dependencies": {
"react": "^18.2.0",
"react-dom": "^18.2.0",
"react-router-dom": "^6.8.0",
"axios": "^1.6.0",
"react-icons": "^4.12.0",
"chart.js": "^4.4.0",
"react-chartjs-2": "^5.2.0",
"jspdf": "^2.5.1",
"html2canvas": "^1.4.1",
"react-toastify": "^9.1.3",
"moment": "^2.29.4",
"lodash": "^4.17.21",
"react-select": "^5.8.0",
"react-datepicker": "^4.21.0"
},
"devDependencies": {
"@vitejs/plugin-react": "^4.0.3",
"vite": "^4.4.5",
"eslint": "^8.45.0",
"eslint-plugin-react": "^7.32.2",
"eslint-plugin-react-hooks": "^4.6.0"
},
"scripts": {
"dev": "vite",
"build": "vite build",
"lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
"preview": "vite preview",
"start": "vite"
}
}


<a id="configuration"></a>
## ⚙️ Configuration

### 1. Database Configuration

Create your MySQL database:

CREATE DATABASE abet_assessment;
CREATE USER 'abet_user'@'localhost' IDENTIFIED BY '123';
GRANT ALL PRIVILEGES ON abet_assessment.* TO 'abet_user'@'localhost';
FLUSH PRIVILEGES;


Update your Django settings:

DATABASES = {
'default': {
'ENGINE': 'django.db.backends.mysql',
'NAME': 'abet_assessment',
'USER': 'abet_user',
'PASSWORD': '123',
'HOST': '127.0.0.1',
}
}



### 2. CORS Settings

CORS_ALLOWED_ORIGINS = [
"http://localhost:3000",
]
CORS_ALLOW_CREDENTIALS = True



### 3. Frontend Configuration

Create a `.env` file in the frontend directory:

REACT_APP_API_URL=http://localhost:8001/api
REACT_APP_BASE_URL=http://localhost:8001



<a id="running-the-application"></a>
## 🏃‍♂️ Running the Application

### 1. Start the Backend Server

cd abet_assessment
python manage.py runserver 8001



The Django server will start at `http://localhost:8001`

### 2. Start the Frontend Development Server

cd abet_frontend/
npm start


The React application will start at `http://localhost:3000`

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api
- **Django Admin**: http://localhost:8001/admin

<a id="api-documentation"></a>
## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/logout/` - User logout

### Core Endpoints
- `GET /api/dashboard-stats/` - Dashboard statistics[8]
- `GET /api/programs/` - List programs[3]
- `GET /api/courses/` - List courses[3]
- `GET /api/assessments/` - List assessments[8]
- `GET /api/abet-outcomes/` - ABET outcomes data[8]
- `GET /api/faculty-training/` - Faculty training records[8]

### Assessment Management[8]
- `GET /api/assessments/` - List all assessments
- `POST /api/assessments/` - Create new assessment
- `GET /api/assessments/{id}/calculate-score/` - Calculate assessment score
- `GET /api/assessments/average-score/` - Get average assessment score
- `GET /api/assessments/program-averages/` - Get program averages

### User Management[4]
- `GET /api/users/` - List users
- `POST /api/users/` - Create user
- `PUT /api/users/{id}/` - Update user

### Reports & Comments[1][2]
- `GET /api/reports/` - List reports
- `POST /api/reports/` - Create report
- `GET /api/comments/` - List comments
- `POST /api/reports/{id}/comments/` - Add comment to report

### Faculty Training[8]
- `GET /api/faculty-training/` - List faculty training records
- `POST /api/faculty-training/` - Create training record
- `GET /api/faculty-training-stats/` - Get training statistics

### Audit & Compliance[8]
- `GET /api/audit-logs/` - List audit logs
- `GET /api/recent-activities/` - Get recent activities
- `GET /api/compliance-dashboard/` - Get compliance metrics
- `GET /api/abet-accreditation-status/` - Get ABET accreditation status

<a id="project-structure"></a>
## 📁 Project Structure

abet-assessment-system/
├── backend/
│ ├── abet_assessment/
│ │ ├── settings.py
│ │ ├── urls.py
│ │ └── wsgi.py
│ ├── apps/
│ │ ├── assessment/ # Assessment management
│ │ │ ├── models.py
│ │ │ ├── views.py
│ │ │ ├── serializers.py
│ │ │ └── services.py
│ │ ├── programs/ # Program management
│ │ │ ├── models.py
│ │ │ ├── views.py
│ │ │ └── serializers.py
│ │ ├── users/ # User management
│ │ │ ├── models.py
│ │ │ ├── views.py
│ │ │ └── serializers.py
│ │ ├── reports/ # Reports system
│ │ │ ├── models.py
│ │ │ ├── views.py
│ │ │ └── serializers.py
│ │ └── core/ # Core functionality
│ ├── requirements.txt
│ └── manage.py
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ │ └── Dashboard.js # Main dashboard
│ │ ├── services/
│ │ ├── context/
│ │ └── assets/
│ ├── package.json
│ └── public/
└── README.md


<a id="development-setup"></a>
## 🔧 Development Setup

### Database Seeding (Optional)

Load sample data
python manage.py loaddata fixtures/sample_data.json

Or create custom fixtures
python manage.py dumpdata --indent 2 > fixtures/backup.json


### Running Tests

Backend tests
cd backend
python manage.py test

Frontend tests
cd frontend
npm test


### Development Dependencies (requirements-dev.txt)

Development Tools
black==23.9.1
flake8==6.1.0
isort==5.12.0

Testing
coverage==7.3.2
factory-boy==3.3.0
faker==19.12.0

Documentation
sphinx==7.2.6
sphinx-rtd-theme==1.3.0

Database Migrations
django-migration-testcase==1.0.0

Performance Monitoring
django-debug-toolbar==4.2.0

API Documentation
drf-spectacular==0.26.5

## 🐳 Docker Setup (Optional)

### Dockerfile for Backend
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]



### docker-compose.yml
version: '3.8'
services:
backend:
build: ./backend
ports:
- "8001:8001"
environment:
- DATABASE_URL=mysql://abet_user:123@db:3306/abet_assessment
depends_on:
- db

frontend:
build: ./frontend
ports:
- "3000:3000"
depends_on:
- backend

db:
image: mysql:8.0
environment:
MYSQL_DATABASE: abet_assessment
MYSQL_USER: abet_user
MYSQL_PASSWORD: 123
MYSQL_ROOT_PASSWORD: rootpassword
volumes:
- mysql_data:/var/lib/mysql

volumes:
mysql_data:



<a id="contributing"></a>
## 🤝 Contributing

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

---

**Note**: This system is designed to assist with ABET accreditation processes but does not guarantee compliance. Users should consult official ABET documentation and accreditation experts for complete compliance requirements.
