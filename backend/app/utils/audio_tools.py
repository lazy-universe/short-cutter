# app/utils/audio_tools.py
import os
import time
import json
from flask import g
from yt_dlp import YoutubeDL
from app.routes.sse_stream import send_event

def download_audio(youtube_url):
    start_time = time.time()    

    DOWNLOAD_DIR = g.base_dir
    audio_path = os.path.join(DOWNLOAD_DIR, f'audio.opus')
    
    if os.path.exists(audio_path):
        send_event(f"[DONE] File found in the local cache")
                
        # check if metadata also exists
        send_event(f"[INFO] Checking if metadata also exists")
        meta_data_path = os.path.join(DOWNLOAD_DIR, "metadata.json")
        
        if os.path.exists(meta_data_path):
            send_event(f"[DONE] Metadata found in the local memory")
            
            with open(meta_data_path, "r", encoding='utf-8') as f:
                metadata_data = json.load(f)
                
            return metadata_data            
        
        send_event(f"[INFO] Metadata not found in cache proceeding to fetch from url")
        
        # Get metadata without downloading again
        ydl_opts = {
            'quiet': True,            
            'skip_download': True,
        }

        send_event(f"[INFO] Extracting metadata from the URL")        
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)

        # Return metadata + cached file path and size
        send_event(f"[DONE] Successfully extracted metadata from the URL")
        end_time = time.time()
        return {
            "title": info.get("title"),
            "duration": info.get("duration"),
            "file_path": audio_path,
            "file_size": os.path.getsize(audio_path),
            "downloaded_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "time_taken": round(end_time - start_time, 2),
        }

    # If file doesn't exist, download the audio file
    ydl_opts = {
        'format': 'bestaudio[acodec=opus][abr<=55]/bestaudio[acodec=opus][abr<=75]/bestaudio',
        'outtmpl': f'{DOWNLOAD_DIR}/audio.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'opus',
        }],
        'postprocessor_args': [
            '-c:a', 'libopus',
            '-b:a', '32k',
            '-ac', '1',
            '-ar', '16000',
        ],
        'prefer_ffmpeg': True,
        'quiet': True
    }

    send_event("[INFO] Downloading with the best format, will incurr some time")
    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=True)
        file_path = os.path.splitext(ydl.prepare_filename(info))[0] + ".opus"
        
        send_event("[DONE] Audio downloaded successfully.")
        send_event("[INFO] Preparing to save meta_data locally")
        
        end_time = time.time()
        metadata = {
            "title": info.get("title"),
            "duration": info.get("duration"),
            "file_path": file_path,
            "file_size": os.path.getsize(file_path),
            "downloaded_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "time_taken": round(end_time - start_time, 2)
        }

        # Save metadata to JSON file
        metadata_file = os.path.join(DOWNLOAD_DIR, "metadata.json")
        with open(metadata_file, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

        return metadata