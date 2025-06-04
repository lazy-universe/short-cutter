import os
import json
from flask import g
from app.services.groq import get_groq_client
from app.routes.sse_stream import send_event

def transcribe_audio(audio_path, video_id):
    result = {
        "path" : None,
        "error" : None,
        "message" : None,
    }
    
    raw_path = os.path.join(g.base_dir, 'transcription.json')
    send_event(f"[INFO] Checking if the file exists in local Cached memory.")
        
    if os.path.exists(raw_path):
        result["path"] = raw_path
        return result       
    else:
        send_event(f"[DONE] File not found in local Cached memory.")
    
    send_event(f"[INFO] Audio sending for Transcription.")
    client = get_groq_client()
    
    try:
        with open(audio_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=file,
                model="whisper-large-v3-turbo",
                response_format="verbose_json",
            )
            
    except Exception as e:
        # Catch anything else (API errors, decoding issues, etc.)
        send_event(f"[ERROR] Failed the transcription of audio file")
        
        result.update({
            "error": f"Error transcribing the audio: {e}",
            "message": "There was an issue transcribing the audio please try again after some time"
        })
        return result
    
    send_event(f"[DONE] Transcription complete.")
        
    transcription_dict = transcription.model_dump()    
    filtered_segments = [
        {
            "start": segment["start"],
            "end": segment["end"],
            "text": segment["text"]
        }
        for segment in transcription_dict.get("segments", [])
    ]

    send_event(f"[INFO] Saving transcription locally")
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump(filtered_segments, f, indent=2, ensure_ascii=False)
    
    send_event("[DONE] Transcription saved successfully.")
    result["path"] = raw_path
    return result