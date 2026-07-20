from services.data_preprocessing import (
    load_emotion_data,
    load_emotion_labels,
    map_labels
)

data_path = "data/bert/dev.tsv"
label_path = "data/bert/emotions.txt"

df = load_emotion_data(data_path)
labels = load_emotion_labels(label_path)

df = map_labels(df, labels)

print(df.head())
print("\nUnique emotions:", df["emotion"].unique())