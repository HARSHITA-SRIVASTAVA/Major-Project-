import pandas as pd

# 🔹 Load emotion dataset (robust parsing)
def load_emotion_data(filepath):
    texts = []
    labels = []

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            # Split from right: [text, label, id]
            parts = line.strip().rsplit(" ", 2)

            # Skip malformed lines
            if len(parts) < 3:
                continue

            text = parts[0]
            label = parts[1]

            # Ensure label is numeric
            if not label.isdigit():
                continue

            texts.append(text)
            labels.append(int(label))

    df = pd.DataFrame({
        "text": texts,
        "label": labels
    })

    return df


# 🔹 Load emotion labels from file
def load_emotion_labels(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        labels = [line.strip() for line in f.readlines()]

    return labels


# 🔹 Map numeric labels → emotion names
def map_labels(df, label_list):
    df["emotion"] = df["label"].apply(
        lambda x: label_list[x] if x < len(label_list) else "unknown"
    )

    return df


# 🔹 (Optional) Clean dataset by removing unknown labels
def remove_unknown(df):
    return df[df["emotion"] != "unknown"]