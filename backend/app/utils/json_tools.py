# app/utils/json_tools.py
def compact_transcription_format(transcription_json):
    parts = []
    for segment in transcription_json:
        start = segment["start"]
        end = segment["end"]
        text = segment["text"].strip().replace("\n", " ")
        parts.append(f"{start}-{end}: {text},")
    return " ".join(parts)