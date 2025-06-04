# Short-Cutter

A lightweight, open-source YouTube clip extractor and logger with real-time feedback — built using **React (Vite)** frontend and **Flask** backend.  

Supports real-time message streaming using **Server-Sent Events (SSE)** and can be deployed via **Docker** effortlessly.

---

## 🚀 Features

- 🎥 Extract interesting clips from YouTube videos.
- ⚡ Realtime server logs using SSE.
- 💬 Live logging displayed in browser.
- 📦 Dockerized for easy setup.
- 🌐 Backend serves static frontend.
- 🔐 Minimal setup with environment support.

---

## 🧰 Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Python + Flask + SSE
- **Build Tool:** Docker
- **Extra:** ffmpeg (for media processing), yt-dlp (for extracting)

---

## 📂 Project Structure

   ```plaintext
   short-cutter/
   │
   ├── backend/ # Flask backend
   │ ├── app/
   │ │ ├── routes/ # API and SSE routes
   │ │ ├── services/ # Groq, YouTube, etc.
   │ │ └── init.py # App factory
   │ └── main.py # Entry point
   │
   ├── frontend/ # React (Vite) frontend
   │ ├── src/
   │ └── dist/ # Production build (copied into container)
   │
   ├── .env # Contains GROQ_API_KEY 
   ├── Dockerfile # Docker setup for both frontend & backend
   ├── .dockerignore
   └── README.md
   ```
   
---

## ⚙️ Setup Instructions

### 🔧 Local Setup (Without Docker)

1. Clone the repo:

   ```bash
   git clone https://github.com/lazy-universe/short-cutter.git
   cd short-cutter
   ```

2. Create `.env` file in root:

   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. Install backend dependencies:

   ```bash
   cd backend
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On Unix/macOS
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. Build frontend:

   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

5. Run backend server:

   ```bash
   cd ../backend
   python main.py
   ```

6. Open your browser at [http://localhost:5000](http://localhost:5000)

---

### 🐳 One-Click Docker Setup (Recommended)

This will install dependencies, build frontend, and start the app via Docker.

1. Make sure you have built the frontend once locally:

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Create `.env` file in root:

   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```   

3. Then from the project root folder, build and run the Docker image:

   ```bash
   docker build -t short-cutter .
   docker run -p 5000:5000 --env-file .env short-cutter
   ```

4. Access the app at [http://localhost:5000](http://localhost:5000)

---

### 🌐 Tunneling via ngrok (Optional)

If you want to expose your local server externally:

1. Install [ngrok](https://ngrok.com/)

2. Run:

   ```bash
   ngrok http 5000
   ```

3. Use the generated HTTPS URL to share access.

---

## ✨ Contributions & Customization

- Want to add new features or improve the app?  
- Want to integrate new models or add timeline editing?  

Feel free to **star ⭐**, fork, and submit pull requests!

---

## 🔐 Security Note

**Never commit your `.env` file** or API keys publicly.  
This repo has `.env` in `.gitignore` by default.

---

## 📄 License

This project is licensed under the **MIT License**.  
You may use, modify, and share responsibly with attribution.

---

## 🙌 Author

Made with ❤️ by Krish — feel free to reach out or submit PRs!

---