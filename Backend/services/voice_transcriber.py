"""
Whisper-based speech-to-text service for MindBloom.

Loads the Whisper model once at import time and reuses it
across all requests. No ffmpeg required (uses soundfile for .wav).

Exposes:
    transcribe_audio(audio_path: str) -> str
"""

import numpy as np
import soundfile as sf
import whisper


# ── Load model once at module import (not per-request) ────────────
print("Loading Whisper (speech-to-text) for voice endpoint...")
_model = whisper.load_model("base")
print("Whisper ready.")


def transcribe_audio(audio_path: str) -> str:
    """
    Convert an audio file (.wav) to text using Whisper.

    Handles:
    - int16 → float32 conversion
    - stereo → mono
    - resampling to 16 kHz (Whisper requirement)

    Returns the transcribed text, or empty string on failure.
    """
    try:
        audio, sr = sf.read(audio_path)

        # Convert to float32 in [-1, 1]
        if audio.dtype != np.float32:
            if audio.dtype == np.int16:
                audio = audio.astype(np.float32) / 32768.0
            else:
                audio = audio.astype(np.float32)

        # Stereo → mono
        if audio.ndim > 1:
            audio = audio.mean(axis=1)

        # Resample to 16 kHz if needed
        if sr != 16000:
            duration = len(audio) / sr
            target_len = int(duration * 16000)
            audio = np.interp(
                np.linspace(0, len(audio), target_len, endpoint=False),
                np.arange(len(audio)),
                audio,
            ).astype(np.float32)

        result = _model.transcribe(audio, fp16=False)
        return result.get("text", "").strip()

    except Exception as e:
        print(f"[Whisper] Transcription error: {e}")
        return ""