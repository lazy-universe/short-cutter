# app/utils/parse_link.py
from app.routes.sse_stream import send_event
from urllib.parse import urlparse, parse_qs
from flask import g

def extract_url_id(youtube_url: str) -> str | None:
    try:
        parsed_url = urlparse(youtube_url)
        host = parsed_url.hostname or ""

        if "youtube" in host:
            query = parse_qs(parsed_url.query)
            if "v" in query:
                return query["v"][0]
            elif parsed_url.path.startswith("/embed/"):
                return parsed_url.path.split("/embed/")[1]
            elif parsed_url.path.startswith("/shorts/"):
                return parsed_url.path.split("/shorts/")[1]

        elif "youtu.be" in host:
            return parsed_url.path.lstrip("/")

    except Exception as e:
        send_event(f"[ERROR] Extracting video id: {e}")
    
    return None