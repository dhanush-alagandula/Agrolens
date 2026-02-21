# Agrolens

Agrolens is a comprehensive plant disease identification and care application. It features a Node.js web backend, a Python-based Machine Learning service for disease prediction, and a dynamic frontend.

## 📁 Project Structure

```text
.
├── backend/
│   ├── web/                # Node.js Express server (Main Backend)
│   │   ├── config/         # Passport and other configurations
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   └── index.js        # Web server entry point
│   └── ml/                 # Python Flask server (ML Service)
│       ├── app.py          # Flask server entry point
│       ├── requirements.txt # Python dependencies
│       └── disease_details.json # Disease information
├── frontend/               # Frontend assets and views
│   ├── public/             # Static files (CSS, JS, Images)
│   └── views/              # EJS templates
├── .env                    # Environment variables (Project Root)
├── credentials.json        # Google Cloud Service Account Key (Project Root)
└── README.md
```

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Python](https://www.python.org/) (3.8 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
- [Git](https://git-scm.com/)

## 🚀 Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the **root directory** with the following variables:

```env
MONGO_URI=mongodb://localhost:27017/agrolens
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_VISION_KEY_PATH=../../credentials.json

# Email Configuration (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

> [!IMPORTANT]
> Ensure `credentials.json` (Google Cloud Service Account Key) is placed in the project root.

### 2. Web Backend Setup (Node.js)

1. Open a terminal and navigate to the web backend:
   ```bash
   cd backend/web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### 3. ML Backend Setup (Python)

1. Open a new terminal and navigate to the ML backend:
   ```bash
   cd backend/ml
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## 🏃 Running the Project

You need to run **both** backend services simultaneously.

### Start the Web Server

In the `backend/web` directory:

```bash
node index.js
```

The server will start on `http://localhost:1000`.

### Start the ML Service

In the `backend/ml` directory (with venv activated):

```bash
python app.py
```

The ML service will start on `http://localhost:5000`.

## 🌐 Usage

Once both servers are running, open your browser and go to `http://localhost:1000`. You can now sign up, log in, and upload plant images for disease identification.
