# Dataset Registry & Provenance (DATASETS.md)

| Dataset Name | Kaggle Slug / Source | Stated License | Images Curated | Target Classes Overlap | Known Issues / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NIH National Library of Medicine (C3PI / RxImage)** | `national-library-of-medicine/c3pi-rximage` | CC0 Public Domain | 6,420 | T001, T003, T005, T007, T016, T018, T022 | Studio lighting, pristine macro background |
| **Pharmaceutical Drugs and Vitamins** | `vbooks/pharmaceutical-drugs-and-vitamins` | CC BY 4.0 | 4,280 | T001, T002, T011, T012, T014, T029, T030 | Mix of blister strips and loose capsules |
| **Pill Identification & Quality Inspection** | `plameneduardo/pill-dataset-preprocessed` | MIT License | 3,190 | T003, T006, T016, T020, T024 | Single-sided tablets, requires augmentations |
| **Indian Medicine Strips and Tablets** | `anujpathak/indian-medicine-dataset` | CC BY-SA 4.0 | 5,110 | T001, T002, T004, T008, T010, T013, T017, T021 | Realistic pharmacy phone images, some packaging glare |
| **Tablet and Capsule Defect Recognition** | `spMohanty/capsule-tablet-classification` | CC BY-NC 4.0 | 2,850 | T015, T019, T023, T025, T026, T028 | Includes chipped/broken tablets mapped to T999 |
| **PillSense Own Phone Photo Benchmark** | `internal/pillsense-phone-heldout-v1` | Proprietary Academic Open | 1,480 | All 30 Catalog Classes + T999 | 3 lighting conditions, 3 angles, front & back sides |

*Note: Datasets with non-commercial (NC) licenses are restricted to academic/benchmarking evaluation splits and excluded from commercially deployed weights.*
