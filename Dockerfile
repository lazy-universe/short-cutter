# Use official lightweight Python image
FROM python:3.10-slim

# Install ffmpeg (needed for your backend)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Copy only requirements first for Docker cache efficiency
COPY backend/requirements.txt ./backend/

# Upgrade pip and install dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend and prebuilt frontend (dist folder only)
COPY backend/ ./backend/
COPY frontend/dist/ ./frontend/dist/

# Expose backend port
EXPOSE 5000

# Set environment variable placeholder (can be overridden at runtime)
ENV GROQ_API_KEY=""

# Run the backend server (main.py should serve frontend statically)
CMD ["python", "./backend/main.py"]