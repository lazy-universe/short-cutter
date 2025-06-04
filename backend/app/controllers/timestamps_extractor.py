# app.controllers.timestamps_extractor.py
import os
# import re
import json
from flask import g
from app.services.groq import get_groq_client
from app.routes.sse_stream import send_event
from app.utils.json_tools import compact_transcription_format

def generate_clip_timestamps(transcription_path, video_id, clips=4, duration=60, locally_cached=True, keywords=""):
    result = {
        "cached": False,
        "path": None,
        "raw_response": None,
        "error": None,
        "message": None
    }

    output_path = os.path.join(g.base_dir, "timestamp.json")
    output_path_fallback = os.path.join(g.base_dir, "timestamp.txt")

    if locally_cached and os.path.exists(output_path):
        send_event("[INFO] Using locally cached metadata file")
        with open(output_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        num_segments = len(data) if isinstance(data, list) else 0
        
        if num_segments == clips:
            result.update({
                "path": output_path,
                "cached": True,
                "message": f"Used cached transcription timestamps."                
            })
            return result     
        else:
            send_event("[WARN] Failed using locally cached file as parameter might have changed")   

    if not os.path.exists(transcription_path):
        send_event("[ERROR] Missing transcription File path")
        result["error"] = "Transcription file not found."
        return result

    send_event("[INFO] Loading Transcription")
    with open(transcription_path, "r", encoding="utf-8") as f:
        transcription = json.load(f)

    transcription_input = compact_transcription_format(transcription)

    prompt = (
        f"Transcription:\n{transcription_input}\n\n"
        f"You are given a transcription composed of multiple segments with their start-end times."
        f"Extract exactly {clips} clip ideas that are likely to go viral on social media with {keywords or 'interesting'} genre. Each clip must be strictly between {duration - 20} and {duration + 20} seconds."
        f"Each clip can span multiple segments. Use the starting timestamp of the first included segment and the ending timestamp of the last included segment.\n\n"

        f"Return only a JSON array of clip objects with the following fields:\n"
        f"- title: short catchy title\n"
        f"- description: brief summary (1-2 lines)\n"
        f"- tags: 4-6 related hashtags\n"
        f"- timestamps: [start, end] in seconds (float with 2 decimal places, no ms)\n"
        f"- hook: strong hook for first 3 seconds\n"
        f"- mood: e.g., funny, emotional, educational, patriotic, edgy humor\n\n"

        f"❗ Strictly return a valid JSON array. No comments or explanations. Format timestamps to 2 decimal places.\n\n"
    )

    send_event("[INFO] Sending request to model")
    client = get_groq_client()
    
    try:
        completion_response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": (
                    "You are a highly skilled content strategist and short-form video editor with deep expertise in virality psychology. "
                    "You specialize in identifying high-impact, emotionally resonant, and shareable moments from any genre of video — "
                    "comedy, brain rot, educational, emotional, patriotic, or edgy humor. You return structured JSON containing only the most "
                    "viral potential clips based on title, timestamps, hook, tags, and mood. Your output is concise, creative, and trimmed to "
                    "make perfect YouTube Shorts or TikToks."
                )},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile"
        )
    except Exception as e:
        send_event("[ERROR] Failed fetching the viral timestamps")
        result.update({
            "error": f"Failed fetching the viral timestamps: {e}",
            "message": "There may be an issue with third-party services or APIs."    
        })
        return result

    send_event("[DONE] Got response from the model")

    response = completion_response.choices[0].message.content.strip()
    result["raw_response"] = response

    try:
        send_event("[INFO] Trying to save the JSON response.")
        parsed_json = json.loads(response)
    except json.JSONDecodeError:
        send_event("[WARN] Failed! Filtering the JSON response.")
        fixed_response = response.strip()
        fixed_response = fixed_response.replace("“", "\"").replace("”", "\"").replace("‘", "'").replace("’", "'")
        fixed_response = re.sub(r",(\s*[\]}])", r"\1", fixed_response)

        try:
            send_event("[INFO] Trying to load the filtered JSON response.")
            parsed_json = json.loads(fixed_response)
        except json.JSONDecodeError:
            send_event("[FALLBACK] Fallback to the txt response.")
            
            with open(output_path_fallback, "w", encoding="utf-8") as fallback_file:
                fallback_file.write(response)
                
            result.update({
                "path": output_path_fallback,
                "message": "Raw response saved as fallback text file."                
            })
            return result

    with open(output_path, "w", encoding="utf-8") as out_file:
        json.dump(parsed_json, out_file, ensure_ascii=False, indent=2)

    result["path"] = output_path
    return result