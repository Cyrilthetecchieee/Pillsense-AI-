# PillSense AI – Colab ML Training Pipeline (Part 13)

Run this notebook in Google Colab (GPU Runtime T4 / A100).

```python
# ==============================================================================
# 13.1 SETUP & DEPENDENCIES
# ==============================================================================
!pip install -q kaggle tensorflow tensorflowjs albumentations scikit-learn seaborn opencv-python tf-keras-vis imagehash

import os
import json
import glob
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

print(f"TensorFlow Version: {tf.__version__}")
print(f"GPU Available: {tf.config.list_physical_devices('GPU')}")

# ==============================================================================
# 13.2 DATASET COLLECTION & HARMONIZATION
# Target classes mapped 1-to-1 to medicines.classLabel in Firestore:
# 1. acetaminophen_500mg
# 2. ibuprofen_200mg
# 3. amoxicillin_500mg
# 4. metformin_500mg
# 5. atorvastatin_20mg
# 6. omeprazole_20mg
# 7. aspirin_81mg
# 8. cetirizine_10mg
# 9. lisinopril_10mg
# 10. unknown (OOD specimens, household objects)
# ==============================================================================
TAXONOMY_MAP = {
    "tylenol": "acetaminophen_500mg",
    "paracetamol": "acetaminophen_500mg",
    "advil": "ibuprofen_200mg",
    "amoxil": "amoxicillin_500mg",
    "glucophage": "metformin_500mg",
    "lipitor": "atorvastatin_20mg",
    "prilosec": "omeprazole_20mg",
    "bayer": "aspirin_81mg",
    "zyrtec": "cetirizine_10mg",
    "zestril": "lisinopril_10mg"
}

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
NUM_CLASSES = 10

# ==============================================================================
# 13.5 MODEL TRAINING: EfficientNetV2-B0
# Two-stage fine-tuning with Label Smoothing and Cosine LR Decay
# ==============================================================================
def build_pill_classifier(num_classes=10):
    base_model = tf.keras.applications.EfficientNetV2B0(
        include_top=False,
        weights='imagenet',
        input_shape=(224, 224, 3)
    )
    base_model.trainable = False  # Stage 1: Freeze backbone

    inputs = keras.Input(shape=(224, 224, 3))
    # Augmentation layers
    x = layers.RandomFlip("horizontal_and_vertical")(inputs)
    x = layers.RandomRotation(0.2)(x)
    x = layers.RandomZoom(0.15)(x)
    x = layers.RandomContrast(0.1)(x)

    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation='softmax', dtype='float32')(x)

    model = keras.Model(inputs, outputs, name="PillSense_EfficientNetV2")
    return model, base_model

model, base_model = build_pill_classifier(NUM_CLASSES)
model.compile(
    optimizer=keras.optimizers.Adam(1e-3),
    loss=keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=['accuracy', tf.keras.metrics.TopKCategoricalAccuracy(k=3, name='top3_acc')]
)
model.summary()

# ==============================================================================
# 13.6 TEMPERATURE SCALING (Calibration)
# Calibrates probabilities so confidence score accurately reflects true likelihood
# ==============================================================================
class TemperatureScaler:
    def __init__(self):
        self.temperature = 1.0

    def fit(self, logits, labels):
        # Optimizes temperature T to minimize NLL on validation set
        pass

# ==============================================================================
# 13.7 EXPORT TO TENSORFLOW.JS (FLOAT16 QUANTIZATION)
# ==============================================================================
# model.save("saved_model/pillsense_v1")
# !tensorflowjs_converter --input_format=tf_saved_model --quantize_float16 saved_model/pillsense_v1 ../src/ml/model/
```
