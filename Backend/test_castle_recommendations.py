"""
CASTLE-aligned recommendation test cases.

Run from Backend/:
    python test_castle_recommendations.py
"""

from app import get_castle_aligned_recommendation


def check(name, text, *, final_risk="Medium", emotion="sadness",
          days_until_deadline=None, is_weekend=False, must_include):
    rec = get_castle_aligned_recommendation(
        final_risk=final_risk,
        emotion_label=emotion,
        text=text,
        days_until_deadline=days_until_deadline,
        is_weekend=is_weekend,
    )
    ok = all(phrase.lower() in rec.lower() for phrase in must_include)
    status = "PASS" if ok else "FAIL"
    print(f"[{status}] {name}")
    if not ok:
        print(f"  Expected phrases: {must_include}")
        print(f"  Got: {rec}")
    return ok


def main():
    results = []

    # Test Case 1 — Academic Misconduct (AM / LP)
    # Naive failure would be deadline pep-talk; we must NOT suggest "get back to work".
    results.append(check(
        "TC1 Academic Misconduct (cheat / copy from GitHub)",
        "I am so exhausted. I have that major OS project due tomorrow. "
        "I'm just going to copy the code from GitHub and change the variables "
        "so the professor doesn't notice.",
        final_risk="High",
        emotion="fear",
        days_until_deadline=1,  # would naively trigger deadline advice
        must_include=["shortcut", "unoriginal", "extension"],
    ))

    # Test Case 2 — Career & Identity Despair (CD)
    results.append(check(
        "TC2 Career Choice Dilemma",
        "I hate coding so much. I only took engineering because my family forced me. "
        "I just want to design posters and manage events, but I feel trapped in this degree.",
        final_risk="High",
        emotion="sadness",
        must_include=["misaligned", "career counselor", "passions"],
    ))

    # Test Case 3 — Virtual Isolation (VE)
    results.append(check(
        "TC3 Virtual Emotional Dependence / Isolation",
        "I haven't left my room or spoken to anyone in days. "
        "This app is the only thing that actually listens to me anymore.",
        final_risk="Medium",
        emotion="sadness",
        must_include=["just an AI", "Human connection", "reach out"],
    ))

    # Test Case 4 — Fixed Mindset Spiral (CB)
    results.append(check(
        "TC4 Fixed Mindset / Self-Worth Crash",
        "The review panel tore my project apart today. I messed up the presentation. "
        "I am genuinely just too stupid for this field.",
        final_risk="High",
        emotion="sadness",
        must_include=["does not define", "learning process", "growth"],
    ))

    # Guard: exhausted + deadline alone should still get deadline advice (not misconduct)
    results.append(check(
        "Guard: stressed deadline without cheating intent",
        "I am so exhausted. I have that major OS project due tomorrow and I feel stressed.",
        final_risk="Medium",
        emotion="nervousness",
        days_until_deadline=1,
        must_include=["day(s)", "resting"],
    ))

    passed = sum(results)
    total = len(results)
    print(f"\n{passed}/{total} passed")
    raise SystemExit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
