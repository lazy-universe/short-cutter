# app/routes/sse_stream.py
import queue
import threading
from flask import Blueprint, Response, stream_with_context

sse_bp = Blueprint("sse", __name__)
message_queues = []
message_backlog = []  # stores recent messages (e.g., last 20)
lock = threading.Lock()

MAX_BACKLOG = 50  # keep last 50 messages for new connections

@sse_bp.route("/events")
def stream():
    q = queue.Queue()

    with lock:
        message_queues.append(q)
        # Replay backlog to newly connected client
        backlog_copy = list(message_backlog)  # make a copy while locked

    def event_stream():
        # First, send the backlog
        for msg in backlog_copy:
            yield f"data: {msg}\n\n"

        try:
            while True:
                msg = q.get()
                yield f"data: {msg}\n\n"
        except GeneratorExit:
            # Client disconnected
            with lock:
                if q in message_queues:
                    message_queues.remove(q)

    return Response(stream_with_context(event_stream()), mimetype="text/event-stream")


def send_event(message: str):
    with lock:
        # Add to backlog
        message_backlog.append(message)
        if len(message_backlog) > MAX_BACKLOG:
            message_backlog.pop(0)

        # Send to all connected clients
        for q in message_queues:
            q.put(message)