# app/routes/youtube_routes.py
import os
import json
import time
from flask import Blueprint, request, jsonify, url_for

from flask import g
from app.routes.sse_stream import send_event
from app.controllers.youtube_downloader import handle_youtube_url
from app.controllers.transcriber import transcribe_audio
from app.controllers.timestamps_extractor import generate_clip_timestamps
from app.controllers.video_clipper import clip_video
from app.utils.parse_link import extract_url_id

youtube_bp = Blueprint('youtube', __name__)

# ---------------------- Main Route to Process YouTube URL ----------------------
@youtube_bp.route('/process', methods=['POST'])
def process_youtube_video():
    start_time = time.time()
    send_event("[INFO] Process Started, Fetching Input")
    
    # ---------------------- Getting Data ----------------------
    data = request.json
    quality = data.get("quality")
    keywords = data.get("keywords")
    youtube_url = data.get("youtube_url")
    locally_cached = data.get("local_cache", True)
    clip_count = min(data.get("clipCount", 4), 10)
    clip_duration = min(data.get("maxDuration", 60), 100)

    # ---------------------- Validating Input ----------------------
    send_event("[INFO] Validating Input")    
    if not youtube_url:
        return jsonify({"error": "user id or youtube link is missin"}), 400
    
    # ---------------------- Extracting Video ID ----------------------
    send_event("[INFO] Extracting video ID from URL...")
    video_id = extract_url_id(youtube_url)
    if not video_id:
        send_event("[ERROR] Invalid YouTube URL.")
        return jsonify({
            "status": "Failed",
            "error": "Invalid YouTube URL",
            "message": "The link you have provided does not contain verified youtube paths."            
        }), 400    

    # ---------------------- Initialising Globals ----------------------
    send_event("[INFO] Initialising globals")
    g.base_dir = os.path.join("app", "downloads", video_id)
    os.makedirs(g.base_dir, exist_ok=True)
    
    g.video_id = video_id    
    send_event("[INFO] Process Started")
    
    # ---------------------- Fetch and Download Audio ----------------------
    send_event("[INFO] Fetching URL Data")
    download_res = handle_youtube_url(youtube_url, video_id) 
    
    title = download_res.get("title")
    duration = download_res.get("duration")
    time_required = download_res.get("total_time")          
    audio_path = download_res.get("audio_path")

    # ---------------------- Transcription ----------------------
    send_event("[INFO] Transcribing Audio")        
    transcription_result = transcribe_audio(audio_path, video_id)
    
    if transcription_result.get("error"):
        send_event("[ERROR] Transcription failed.")
        return jsonify({
            "status": "failed",
            "message": transcription_result.get("error"), 
            "content": transcription_result.get("message")
        }), 502
        
    transcription_path = transcription_result.get("path")            
    send_event("[DONE] Transcription process Completed.")    

    # ---------------------- Generate Timestamps ----------------------
    send_event("[INFO] Generating Timestamps")
    timestamps_result = generate_clip_timestamps(transcription_path, video_id, clip_count, clip_duration, locally_cached, keywords)

    # Fallback if JSON couldn't be parsed
    if not timestamps_result["path"] or timestamps_result["path"].endswith(".txt"):
        send_event("[FALLBACK] Using TXT Fallback")
        return jsonify({
            "status": "fallback",
            "message": timestamps_result.get("message", "Returned fallback TXT because JSON parsing failed."),
            "content": timestamps_result.get("raw_response", None),
            "error": timestamps_result.get("error", None),
            "path": timestamps_result.get("path", None)
        }), 200

    send_event("[DONE] Response saved as JSON.")

    # ---------------------- Clip Video ----------------------
    send_event("[INFO] Generating Video Clips")
    clips_folder = clip_video(youtube_url, timestamps_result["path"], locally_cached, quality)
    
    with open(timestamps_result["path"], "r", encoding="utf-8") as f:
        timestamp_data = json.load(f)
        
    if not clips_folder or not os.listdir(clips_folder):
        return jsonify({
            "status": "fallback",
            "message": "Failed generating the clips",
            "content": f"Sorry for the inconvenience, here's the content: {timestamp_data}"
        }), 200

    send_event("[DONE] Thanks for the patience, Videos downloaded successfully.")
    send_event("[DONE] Video Clips Generated.")

    # ---------------------- Serve Clip URLs ----------------------
    send_event("[INFO] Serving Clips")
    filenames = [f for f in os.listdir(clips_folder)
                 if os.path.isfile(os.path.join(clips_folder, f)) and f.lower().endswith(('.mp4', '.mov', '.webm'))]

    video_urls = [
        url_for('static', filename=f'{user_id}/{video_id}/clips/{name}', _external=True)
        for name in filenames
    ]

    send_event("[DONE] Process Completed")
    end_time = time.time()
    
    return jsonify({
        "message": "YouTube processing completed successfully",
        "videos": video_urls,
        "timestamp": timestamp_data,
        "time_taken": round(end_time - start_time, 2)
    }), 200