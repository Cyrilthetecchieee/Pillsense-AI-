import { MedicineRecord } from '../types';

export const SEED_MEDICINES: MedicineRecord[] = [
  {
    id: "med-paracetamol-500",
    medicineName: "Acetaminophen 500 mg Tablet",
    genericName: "Acetaminophen / Paracetamol",
    brandName: "Tylenol Extra Strength",
    imprint: "TYLENOL 500",
    strength: "500 mg",
    dosageForm: "Tablet / Caplet",
    manufacturer: "Johnson & Johnson Consumer Inc.",
    description: "White capsule-shaped tablet with red imprint. Analgesic and antipyretic agent.",
    commonUses: [
      "Temporary relief of minor aches and pains",
      "Headache and muscular aches",
      "Minor arthritis pain",
      "Fever reduction"
    ],
    warnings: [
      "Liver warning: Severe liver damage may occur if you take more than 4,000 mg in 24 hours.",
      "Do not use with other drugs containing acetaminophen.",
      "Ask a doctor before use if you have liver disease."
    ],
    packageKeywords: ["Tylenol", "Extra Strength", "500mg", "Acetaminophen", "Paracetamol"],
    classLabel: "acetaminophen_500mg",
    source: "openFDA / DailyMed (NDC 50580-496)",
    sourceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=2c2eb6fa-e621-4f68-98e6-be5c7ff2010d",
    verificationStatus: "verified",
    updatedAt: "2026-10-22T00:00:00Z"
  },
  {
    id: "med-ibuprofen-200",
    medicineName: "Ibuprofen 200 mg Tablet",
    genericName: "Ibuprofen",
    brandName: "Advil",
    imprint: "ADVIL",
    strength: "200 mg",
    dosageForm: "Coated Tablet",
    manufacturer: "Haleon US Holdings LLC",
    description: "Brown round coated tablet with black imprint ADVIL. Nonsteroidal anti-inflammatory drug (NSAID).",
    commonUses: [
      "Pain reliever and fever reducer",
      "Headaches, toothaches, backaches",
      "Menstrual cramps and common cold symptoms"
    ],
    warnings: [
      "Stomach bleeding warning: NSAIDs may cause severe stomach bleeding.",
      "Heart attack and stroke risk increase with longer use.",
      "Take with food or milk if stomach upset occurs."
    ],
    packageKeywords: ["Advil", "Ibuprofen", "200mg", "Pain Reliever", "NSAID"],
    classLabel: "ibuprofen_200mg",
    source: "openFDA / DailyMed (NDC 0573-0150)",
    sourceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1f66ad05-728d-4e9e-a89e-3d0d3c639fd5",
    verificationStatus: "verified",
    updatedAt: "2026-10-22T00:00:00Z"
  },
  {
    id: "med-amoxicillin-500",
    medicineName: "Amoxicillin 500 mg Capsule",
    genericName: "Amoxicillin Trihydrate",
    brandName: "Amoxil",
    imprint: "AMOX 500",
    strength: "500 mg",
    dosageForm: "Capsule",
    manufacturer: "Teva Pharmaceuticals USA, Inc.",
    description: "Yellow / blue hard gelatin capsule containing amoxicillin powder. Broad-spectrum penicillin antibiotic.",
    commonUses: [
      "Treatment of susceptible bacterial infections",
      "Ear, nose, throat, skin, and lower respiratory tract infections",
      "Urinary tract infections"
    ],
    warnings: [
      "Prescription only: Complete full course even if symptoms resolve.",
      "Hypersensitivity warning: Serious and occasionally fatal anaphylaxis in penicillin-allergic patients.",
      "Ineffective for viral infections like colds or influenza."
    ],
    packageKeywords: ["Amoxicillin", "500mg", "Antibiotic", "Teva", "Rx Only"],
    classLabel: "amoxicillin_500mg",
    source: "openFDA / DailyMed (NDC 0093-3109)",
    sourceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e74e4c34-ebce-4c1d-91d1-6784d0b134aa",
    verificationStatus: "verified",
    updatedAt: "2026-10-22T00:00:00Z"
  },
  {
    id: "med-metformin-500",
    medicineName: "Metformin Hydrochloride 500 mg Tablet",
    genericName: "Metformin HCl",
    brandName: "Glucophage",
    imprint: "M 500",
    strength: "500 mg",
    dosageForm: "Tablet",
    manufacturer: "Mylan Pharmaceuticals Inc.",
    description: "White round biconvex film-coated tablet, debossed with M on one side and 500 on the other.",
    commonUses: [
      "Adjunct to diet and exercise to improve glycemic control in type 2 diabetes mellitus"
    ],
    warnings: [
      "Black box warning: Lactic acidosis can occur, particularly in renal impairment.",
      "Avoid excessive alcohol intake while taking metformin.",
      "Discontinue prior to iodinated contrast radiological procedures."
    ],
    packageKeywords: ["Metformin", "500mg", "Glucophage", "Diabetes", "Mylan"],
    classLabel: "metformin_500mg",
    source: "openFDA / DailyMed (NDC 0378-0112)",
    sourceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=2df8e9d3-d222-4217-bfef-bfbdf20a2e37",
    verificationStatus: "verified",
    updatedAt: "2026-10-22T00:00:00Z"
  },
  {
    id: "med-atorvastatin-20",
    medicineName: "Atorvastatin Calcium 20 mg Tablet",
    genericName: "Atorvastatin Calcium",
    brandName: "Lipitor",
    imprint: "PD 156 20",
    strength: "20 mg",
    dosageForm: "Film-coated Tablet",
    manufacturer: "Pfizer Laboratories Div Pfizer Inc",
    description: "White, elliptical, biconvex film-coated tablet debossed with 20 on one side and PD 156 on the other.",
    commonUses: [
      "Lowering LDL cholesterol and total cholesterol in hypercholesterolemia",
      "Reducing risk of cardiovascular events in patients with coronary heart disease"
    ],
    warnings: [
      "Skeletal muscle effects: Promptly report unexplained muscle pain, tenderness, or weakness.",
      "Liver enzyme abnormalities may occur.",
      "Contraindicated in active liver disease and pregnancy."
    ],
    packageKeywords: ["Atorvastatin", "Lipitor", "20mg", "Cholesterol", "Pfizer"],
    classLabel: "atorvastatin_20mg",
    source: "openFDA / DailyMed (NDC 0071-0156)",
    sourceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=13b355a2-9477-43cf-a0e2-671c6bc3be3b",
    verificationStatus: "verified",
    updatedAt: "2026-10-22T00:00:00Z"
  },
  {
    id: "med-omeprazole-20",
    medicineName: "Omeprazole Delayed-Release 20 mg Capsule",
    genericName: "Omeprazole",
    brandName: "Prilosec OTC",
    imprint: "PRILOSEC 20",
    strength: "20 mg",
    dosageForm: "Delayed-Release Capsule",
    manufacturer: "Procter & Gamble",
    description: "Purple / pink capsule containing enteric-coated pellets. Proton pump inhibitor.",
    commonUses: [
      "Frequent heartburn occurring 2 or more days a week",
      "Gastroesophageal reflux disease (GERD)"
    ],
    warnings: [
      "Not intended for immediate relief of heartburn; may take 1 to 4 days for full effect.",
      "Do not take for more than 14 days without consulting a doctor.",
      "Long term PPI use associated with hypomagnesemia and bone fracture risk."
    ],
    packageKeywords: ["Omeprazole", "Prilosec", "20mg", "Acid Reducer", "Heartburn"],
    classLabel: "omeprazole_20mg",
    source: "openFDA / DailyMed (NDC 37000-474)",
    sourceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=29388df6-efbd-4db1-9596-f698dffdc46c",
    verificationStatus: "reviewed",
    updatedAt: "2026-10-22T00:00:00Z"
  },
  {
    id: "med-aspirin-81",
    medicineName: "Aspirin Low Dose 81 mg Tablet",
    genericName: "Aspirin / Acetylsalicylic Acid",
    brandName: "Bayer Low Dose",
    imprint: "BAYER",
    strength: "81 mg",
    dosageForm: "Enteric Coated Tablet",
    manufacturer: "Bayer HealthCare LLC",
    description: "Yellow round enteric-coated tablet debossed with BAYER cross.",
    commonUses: [
      "Cardioprotective secondary prevention under physician supervision",
      "Temporary relief of minor aches and pains"
    ],
    warnings: [
      "Reye's syndrome: Children and teenagers should not use this medicine for chickenpox or flu symptoms.",
      "Stomach bleeding risk: Increased risk with alcohol or antiplatelet agents.",
      "Ask a doctor before taking for heart preventative therapy."
    ],
    packageKeywords: ["Aspirin", "Bayer", "81mg", "Low Dose", "Heart Health"],
    classLabel: "aspirin_81mg",
    source: "openFDA / DailyMed (NDC 0280-2100)",
    sourceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=2a1975e5-3d84-48f8-b397-ff99c4eb3a15",
    verificationStatus: "verified",
    updatedAt: "2026-10-22T00:00:00Z"
  },
  {
    id: "med-cetirizine-10",
    medicineName: "Cetirizine Hydrochloride 10 mg Tablet",
    genericName: "Cetirizine HCl",
    brandName: "Zyrtec",
    imprint: "ZYRTEC",
    strength: "10 mg",
    dosageForm: "Tablet",
    manufacturer: "Johnson & Johnson Consumer Inc.",
    description: "White, rectangular film-coated tablet debossed with ZYRTEC. Second-generation antihistamine.",
    commonUses: [
      "Temporary relief of runny nose, sneezing, itchy watery eyes, and itchy nose or throat due to hay fever or upper respiratory allergies"
    ],
    warnings: [
      "Drowsiness may occur. Use caution when driving or operating machinery.",
      "Avoid alcoholic drinks while taking.",
      "Do not take more than directed 10 mg tablet in 24 hours."
    ],
    packageKeywords: ["Cetirizine", "Zyrtec", "10mg", "Allergy", "Antihistamine"],
    classLabel: "cetirizine_10mg",
    source: "openFDA / DailyMed (NDC 50580-726)",
    sourceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8f1c8411-cf92-4f38-8fa0-6ea51e4ca5b5",
    verificationStatus: "reviewed",
    updatedAt: "2026-10-22T00:00:00Z"
  },
  {
    id: "med-lisinopril-10",
    medicineName: "Lisinopril 10 mg Tablet",
    genericName: "Lisinopril",
    brandName: "Prinivil / Zestril",
    imprint: "L 10",
    strength: "10 mg",
    dosageForm: "Tablet",
    manufacturer: "Lupin Pharmaceuticals, Inc.",
    description: "Pink, round, biconvex uncoated tablets debossed with L and 10. Angiotensin-converting enzyme (ACE) inhibitor.",
    commonUses: [
      "Treatment of hypertension in adults and children 6 years of age and older",
      "Adjunctive therapy in heart failure",
      "Improvement of survival in hemodynamically stable patients within 24 hours of myocardial infarction"
    ],
    warnings: [
      "Boxed warning: Discontinue as soon as possible when pregnancy is detected; can cause injury and death to developing fetus.",
      "Angioedema risk: Swelling of face, lips, tongue, or larynx requires immediate emergency medical attention.",
      "Hyperkalemia: Periodic monitoring of serum potassium is recommended."
    ],
    packageKeywords: ["Lisinopril", "Prinivil", "Zestril", "10mg", "Blood Pressure"],
    classLabel: "lisinopril_10mg",
    source: "openFDA / DailyMed (NDC 68180-514)",
    sourceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=80a32490-6725-455b-b5d1-12ec58596043",
    verificationStatus: "verified",
    updatedAt: "2026-10-22T00:00:00Z"
  },
  {
    id: "med-unknown",
    medicineName: "Unknown / Unclassified Formulation",
    genericName: "Unidentified Pill",
    brandName: "N/A",
    imprint: "NONE",
    strength: "N/A",
    dosageForm: "Pill / Capsule",
    manufacturer: "Unverified",
    description: "Out-of-distribution or unidentified specimen not matching verified clinical reference entries.",
    commonUses: ["N/A"],
    warnings: [
      "Unable to identify reliably. Do not consume unverified medications.",
      "Consult a registered pharmacist or healthcare provider."
    ],
    packageKeywords: [],
    classLabel: "unknown",
    source: "PillSense OOD Registry",
    sourceUrl: "https://pillsense.local/ood",
    verificationStatus: "sample",
    updatedAt: "2026-10-22T00:00:00Z"
  }
];
