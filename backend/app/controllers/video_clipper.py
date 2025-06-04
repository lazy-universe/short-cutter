# app/controllers/video_clipper.py
import os
import json
import subprocess
from flask import g
from app.utils.video_tools import delayed_message
from app.utils.video_tools import seconds_to_hms
from app.utils.video_tools import send_event_with_delay
from app.routes.sse_stream import send_event

def clip_video(youtube_url, json_path, locally_cached, quality):
    output_dir = os.path.join(g.base_dir, "clips")
    os.makedirs(output_dir, exist_ok=True)

    if locally_cached and os.listdir(output_dir):
        send_event("[DONE] Found the locally cached clips.")
        return output_dir

    with open(json_path, 'r', encoding='utf-8') as f:
        clips = json.load(f)
    
    # Build download_sections as a list of strings
    download_sections = []
    for clip in clips:
        start, end = clip.get("timestamps", [0, 0])
        if end <= start:
            send_event(f"[WARN] Skipping invalid clip: {clip.get('title')} (start: {start}, end: {end})")
            continue
        hms_range = f"{seconds_to_hms(start)}-{seconds_to_hms(end)}"
        download_sections.append(f"*{hms_range}")
        
    yt_output_template = os.path.join(output_dir, "%(id)s_clip_%(autonumber)03d.%(ext)s")
    send_event("[INFO] Everything cleared, hopping to download process")
    
    command = [
        "yt-dlp",
        "--quiet",
        *[f"--download-sections={section}" for section in download_sections],
        "-f", f'bestvideo[height<={quality+50}]+bestaudio/best',
        "--merge-output-format", "mp4",
        "-o", yt_output_template,
        youtube_url
    ]

    send_event("[INFO] Downloading your videos...")
    send_event_with_delay("[PROGRESS] Fetching the Video to be downlaoded from the server", 40)
    send_event_with_delay("[PROGRESS] Selecting the best quality for the clips", 80)
    send_event_with_delay("[PROGRESS] Clipping the videos according to the timestamps", 120)    
    send_event_with_delay("[PROGRESS] Video clips are added in queue to download", 160)
    send_event_with_delay("[PROGRESS] Be patient, your videos are downloading", 200)
    send_event_with_delay("[PROGRESS] Pretty big request huh, taking time to process", 300)
    send_event_with_delay("[PROGRESS] This is taking more than expected, may be the internet issue! Just wait a more min if you can", 400)    
    send_event_with_delay("[ERROR] Taking more than expected, you can reload the page and try again", 500)
    
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True
        )

        if result.stdout:
            send_event("[WARN] " + result.stdout)

        if result.stderr:
            send_event("[ERROR] " + result.stderr)

    except subprocess.CalledProcessError as e:
        send_event(f"[ERROR] Subprocess failed: {e}")

    return output_dir