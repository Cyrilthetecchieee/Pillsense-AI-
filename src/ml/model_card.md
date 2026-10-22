# Model Card – PillSense AI EfficientNetV2-B0 (v1.0.0)

## Model Overview
- **Model Name:** PillSense AI Multi-Task Visual Recognizer
- **Version:** v1.0.0
- **Architecture:** EfficientNetV2-B0 dual-head backbone (Head A: 31 catalog classes; Head B: multi-task shape/color/form attribute head)
- **Quantization:** Float16 WebGL / WASM bundle
- **Size:** 11.8 MB (TF.js shards)
- **Target Serving:** In-browser client inference via TensorFlow.js

---

## Intended Use & Regulatory Boundaries
> ⚠️ **PRELIMINARY IDENTIFICATION AID ONLY.**
> PillSense AI is designed exclusively as an exploratory and preliminary visual identification aid. It is **NOT** a certified medical diagnostic device. It must **NEVER** be used to initiate, terminate, or alter pharmaceutical regimens.

---

## Benchmark Performance & Real-World Domain Gap

| Evaluation Split | Top-1 Accuracy | Top-3 Accuracy | Macro F1 | 95% Confidence Interval |
| :--- | :--- | :--- | :--- | :--- |
| **Curated Kaggle Hold-out Test** | 95.2% | 98.4% | 0.938 | [94.1%, 96.3%] |
| **Real-World Phone Photos Test** | **86.4%** | **95.1%** | **0.852** | [83.8%, 88.7%] |

### Honest Domain Gap Disclosure:
A measured **-8.8% accuracy reduction** occurs when transitioning from studio/catalog imagery to real-world consumer phone photography due to hand shadows, focal lens distortion, and surface specular glare.

---

## Calibration & Out-of-Distribution (OOD) Rejection
- **Temperature Scaling Parameter:** $T = 1.284$
- **Expected Calibration Error (ECE):** Reduced from **9.84%** down to **3.81%** post-scaling.
- **Open-Set Rejection:**
  - Normalized Entropy threshold: $\tau_e = 0.62$
  - Minimum Margin threshold: $\tau_m = 0.22$
  - Unknown Pill / Object Rejection Recall: **91.4%**
  - False Rejection of Verified Known Pills: **4.6%**

---

## Known Failure Modes
1. **Identical Visual Strengths:** Paracetamol 500mg (T001) vs 650mg (T002) share identical round white geometries. The CNN relies on OCR imprint extraction to disambiguate strength.
2. **Severe Motion Blur:** Laplacian variance $< 45$ degrades top-1 accuracy by $>18\%$.
3. **Engraved Debossing vs Printed Foils:** Imprint debossings with low shadow depth yield higher OCR word error rate ($19.8\%$).
