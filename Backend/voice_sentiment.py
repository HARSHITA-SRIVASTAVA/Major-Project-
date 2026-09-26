"""
Standalone voice → sentiment prototype (no ffmpeg needed for .wav).
Run: python voice_sentiment.py
"""

import os
import sys
import tempfile

import numpy as np
import soundfile as sf
import whisper
from transformers import pipeline

# ── Load models once ──────────────────────────────────────────────
print("Loading Whisper (speech-to-text)...")
whisper_model = whisper.load_model("base")   # tiny/base/small/medium/large

print("Loading emotion classifier...")
emotion_pipeline = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None,   # return all scores (replaces deprecated return_all_scores)
)

print("Loading sentiment classifier...")
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
)

print("✅ All models loaded.\n")


def transcribe(audio_path: str) -> str:
    """
    Convert audio file to text using Whisper — WITHOUT ffmpeg.
    Uses soundfile to load the audio directly as a numpy array.
    """
    audio, sr = sf.read(audio_path)

    # Whisper expects float32 mono at 16 kHz
    if audio.dtype != np.float32:
        # int16 → float32 in [-1, 1]
        if audio.dtype == np.int16:
            audio = audio.astype(np.float32) / 32768.0
        else:
            audio = audio.astype(np.float32)

    # stereo → mono
    if audio.ndim > 1:
        audio = audio.mean(axis=1)

    # Resample to 16 kHz if needed (Whisper requirement)
    if sr != 16000:
        # Simple linear resample (good enough for speech)
        duration = len(audio) / sr
        target_len = int(duration * 16000)
        audio = np.interp(
            np.linspace(0, len(audio), target_len, endpoint=False),
            np.arange(len(audio)),
            audio,
        ).astype(np.float32)

    result = whisper_model.transcribe(audio, fp16=False)
    return result["text"].strip()


def analyse_text(text: str) -> dict:
    """Run emotion + sentiment analysis on text."""
    if not text:
        return {"error": "Empty transcription"}

    # Emotion (list of dicts when top_k=None)
    emotions = emotion_pipeline(text)[0]
    top_emotion = max(emotions, key=lambda x: x["score"])

    # Sentiment (positive/negative)
    sentiment = sentiment_pipeline(text)[0]

    return {
        "text": text,
        "emotion": {
            "label": top_emotion["label"],
            "score": round(top_emotion["score"], 3),
            "all": {e["label"]: round(e["score"], 3) for e in emotions},
        },
        "sentiment": {
            "label": sentiment["label"],
            "score": round(sentiment["score"], 3),
        },
    }


def analyse_voice_file(audio_path: str) -> dict:
    """Full pipeline: audio → text → analysis."""
    print(f"\n📁 Transcribing: {audio_path}")
    text = transcribe(audio_path)
    print(f"📝 Transcription: \"{text}\"")
    return analyse_text(text)


def record_and_analyse(duration: int = 8):
    """Record from mic, then analyse. Requires `sounddevice`."""
    try:
        import sounddevice as sd
        from scipy.io.wavfile import write
    except ImportError:
        print("❌ Install mic support: pip install sounddevice scipy")
        return

    print(f"\n🎙️  Recording for {duration} seconds... speak now!")
    fs = 16000
    recording = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype="int16")
    sd.wait()
    print("✅ Recording complete.")

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        write(f.name, fs, recording)
        return analyse_voice_file(f.name)


def pretty_print(result: dict):
    if not result or "error" in result:
        print(f"❌ Error: {result.get('error', 'Unknown error')}")
        return

    print("\n" + "═" * 60)
    print(f"📝 You said: \"{result['text']}\"")
    print("─" * 60)
    print(f"😊 Emotion:   {result['emotion']['label']} ({result['emotion']['score']:.0%})")
    print(f"💬 Sentiment: {result['sentiment']['label']} ({result['sentiment']['score']:.0%})")
    print("\n📊 All emotions:")
    for label, score in sorted(result["emotion"]["all"].items(), key=lambda x: -x[1]):
        bar = "█" * int(score * 30)
        print(f"   {label:<15} {bar} {score:.0%}")
    print("═" * 60)


# ── CLI ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) > 1:
        # File mode: python voice_sentiment.py path/to/audio.wav
        audio_file = sys.argv[1]
        if not os.path.exists(audio_file):
            print(f"❌ File not found: {audio_file}")
            sys.exit(1)
        pretty_print(analyse_voice_file(audio_file))
    else:
        # Mic mode: python voice_sentiment.py
        pretty_print(record_and_analyse(duration=8))