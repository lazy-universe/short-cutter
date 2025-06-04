# app.services.groq.py
import os
from groq import Groq

def get_groq_client():
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise Exception("Missing GROQ_API_KEY in environment.")
    return Groq(api_key=groq_api_key)