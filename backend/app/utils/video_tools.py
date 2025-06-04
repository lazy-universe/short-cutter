# app.utils.video_tools.py
import time
import threading
from app.routes.sse_stream import send_event
from flask import g

def delayed_message(message="", delay=60):
    time.sleep(delay)
    send_event(message)
    
def send_event_with_delay(message="", delay=60):
    threading.Thread(target=delayed_message, kwargs={
        'message': message,
        'delay': delay
    }).start()

def seconds_to_hms(seconds):
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hrs:02}:{mins:02}:{secs:02}.{millis:03}"