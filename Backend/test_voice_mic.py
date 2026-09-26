"""
Record from mic → send to Flask /api/voice-predict → print result.
Run while Flask is running in another terminal.
"""

import requests
import json
import tempfile
import sounddevice as sd
from scipy.io.wavfile import write

# ── Config ────────────────────────────────────────────────────────
API_URL = "http://127.0.0.1:5000/api/voice-predict"
DURATION = 8            # seconds
FS = 16000              # Whisper sample rate

# ── 1. Record ─────────────────────────────────────────────────────
print(f"\n🎙️  Recording for {DURATION} seconds... speak now!")
recording = sd.rec(int(DURATION * FS), samplerate=FS, channels=1, dtype="int16")
sd.wait()
print("✅ Recording complete.")

# ── 2. Save to temp .wav ──────────────────────────────────────────
with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
    write(f.name, FS, recording)
    audio_path = f.name

# ── 3. Send to backend ────────────────────────────────────────────
print("📤 Sending to /api/voice-predict...")

with open(audio_path, "rb") as f:
    files = {"audio": ("recording.wav", f, "audio/wav")}
    data = {
        "questionnaire": json.dumps({
            "anxiety_level": 3,
            "self_esteem": 3,
            "sleep_quality": 3,
            "academic_pressure": 3,
            "social_support": 3,
        })
    }
    r = requests.post(API_URL, files=files, data=data)

# ── 4. Pretty-print the result ────────────────────────────────────
print(f"\nStatus: {r.status_code}")
print("=" * 60)

if r.status_code == 200:
    result = r.json()
    print(f"📝 Transcription: \"{result['input']['transcript']}\"")
    print("-" * 60)

    emo = result["analysis"]["emotion"]
    print(f"😊 Emotion:   {emo['label']} ({emo['score']:.0%})")

    print(f"💬 Risk Score: {result['analysis']['risk_score']} / 2")
    print(f"🚦 Final Risk: {result['analysis']['final_risk']}")
    print("-" * 60)
    print(f"💡 Recommendation:")
    print(f"   {result['analysis']['recommendation']}")
else:
    print(f"❌ Error: {r.text}")

print("=" * 60)