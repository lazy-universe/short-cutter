# app/__init__.py

from flask import Flask, send_from_directory, current_app
import os
from app.routes.youtube_routes import youtube_bp
from app.routes.sse_stream import sse_bp

def create_app():
    app = Flask(__name__, static_folder='../../frontend/dist', static_url_path='')

    app.register_blueprint(sse_bp, url_prefix="/api")
    app.register_blueprint(youtube_bp, url_prefix="/api")

    # Serve index.html
    @app.route('/')
    def serve_frontend():
        return current_app.send_static_file('index.html')

    # Serve any static asset (CSS/JS/images)
    @app.route('/<path:path>')
    def serve_static(path):
        file_path = os.path.join(app.static_folder, path)
        if os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)
        else:
            return current_app.send_static_file('index.html')

    return app