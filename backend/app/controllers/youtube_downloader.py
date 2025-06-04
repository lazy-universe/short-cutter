# app/controllers/youtube_downloader.py
import os
import time
import json
from flask import g
from app.utils.audio_tools import download_audio
from app.routes.sse_stream import send_event

def handle_youtube_url(youtube_url, video_id):
    start_time = time.time()
    
    result = {
        "cache" : None,
        "error" : None,
        "message" : None,
    }
    
    # Downloading audio
    send_event("[INFO] Downloading audio file")
    
    download_result = download_audio(youtube_url)
    if not download_result:
        send_event("[ERROR] Failed to fetch audio.")
        result.update({
            "error": "Failed to fetch audio",
            "message": "Unable to download audio from the provided YouTube URL."
        })
        return result

    end_time = time.time()

    return {
        "cached": False,
        "message": "Audio downloaded successfully",
        "title": download_result.get("title"),
        "duration": download_result.get("duration"),
        "audio_size": download_result.get("file_size"),
        "audio_path": download_result.get("file_path"),
        "downloaded_at": download_result.get("downloaded_at"),
        "audio_time": download_result.get("time_taken"),
        "total_time": round(end_time - start_time, 2)
    }