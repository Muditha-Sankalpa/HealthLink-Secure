import pandas as pd
import numpy as np
import random

# We map Specialties directly to the ones you use in your Node.js backend
# The numbers represent the PROBABILITY (0.0 to 1.0) of a patient having that symptom
SPECIALTY_PROFILES = {
    "Cardiologist": {
        "Chest Pain": 0.85, "Shortness of Breath": 0.70, "Palpitations": 0.65, 
        "Dizziness": 0.40, "Fatigue": 0.50, "Excessive Sweating": 0.45, "Fainting": 0.20
    },
    "Dermatologist": {
        "Rash": 0.85, "Itching": 0.90, "Skin Redness": 0.75, 
        "Blisters": 0.50, "Hair Loss": 0.40, "Lumps": 0.30
    },
    "Neurologist": {
        "Headache": 0.80, "Dizziness": 0.60, "Blurred Vision": 0.50, 
        "Tingling": 0.65, "Weakness": 0.55, "Fainting": 0.40, "Memory Loss": 0.35
    },
    "Gastroenterologist": {
        "Abdominal Pain": 0.80, "Nausea": 0.70, "Vomiting": 0.60, "Diarrhea": 0.55, 
        "Constipation": 0.50, "Heartburn": 0.75, "Bloating": 0.65, "Loss of Appetite": 0.40
    },
    "ENT Specialist": {
        "Sore Throat": 0.85, "Earache": 0.80, "Hoarseness": 0.60, 
        "Nosebleed": 0.45, "Cough": 0.50, "Loss of Taste or Smell": 0.30
    },
    "Orthopedist": {
        "Joint Pain": 0.90, "Back Pain": 0.85, "Neck Pain": 0.65, 
        "Muscle Cramps": 0.50, "Muscle Pain": 0.70, "Swelling": 0.60
    },
    "Gynecologist": {
        "Menstrual Pain": 0.90, "Vaginal Discharge": 0.85, "Abdominal Pain": 0.50, 
        "Fatigue": 0.40, "Breast Pain": 0.70, "Mood Swings": 0.50
    },
    "Urologist": {
        "Urinary Incontinence": 0.70, "Abdominal Pain": 0.40, "Frequent Urination": 0.80, 
        "Testicular Pain": 0.80, "Prostate Issues": 0.80
    },
    "Pediatrician": {
        "Fever": 0.80, "Cough": 0.70, "Rash": 0.50, "Vomiting": 0.45, 
        "Growth Issues": 0.30, "Frequent Ear Infections": 0.60
    },
    "General Physician": {
        "Fever": 0.75, "Fatigue": 0.70, "Cough": 0.65, "Chills": 0.50, 
        "Weakness": 0.50, "Night Sweats": 0.30, "Headache": 0.60
    }
}

# Master list of all symptoms (for background noise)
ALL_SYMPTOMS = list(set([symp for profile in SPECIALTY_PROFILES.values() for symp in profile.keys()]))

np.random.seed(42)
num_samples = 1500 # Increased dataset size for better ML training
data =[]

for _ in range(num_samples):
    # 1. Randomly pick a GROUND TRUTH specialty (This is what the ML must learn to predict)
    specialty = np.random.choice(list(SPECIALTY_PROFILES.keys()))
    
    # 2. Set strict logical constraints for Age and Gender
    if specialty == "Gynecologist":
        gender = "F"
        age = np.random.randint(14, 65)
    elif specialty == "Pediatrician":
        gender = np.random.choice(["M", "F"])
        age = np.random.randint(0, 18)
    elif specialty == "Urologist":
        # Mostly male, mostly older
        gender = np.random.choice(["M", "F"], p=[0.8, 0.2])
        age = np.random.randint(18, 85)
    else:
        gender = np.random.choice(["M", "F"])
        age = np.random.randint(18, 85) if specialty != "Pediatrician" else np.random.randint(0, 18)

    # 3. PROBABILISTIC SYMPTOM GENERATION (The core of making ML think)
    patient_symptoms =[]
    
    # Check the probability of every symptom related to this specialty
    for symptom, probability in SPECIALTY_PROFILES[specialty].items():
        # E.g., If probability is 0.8, there's an 80% chance the patient has this symptom
        if np.random.random() < probability:
            # Check gender-specific logic just to be safe
            if symptom in ["Testicular Pain", "Prostate Issues"] and gender == "F":
                continue
            if symptom in ["Menstrual Pain", "Vaginal Discharge", "Breast Pain"] and gender == "M":
                continue
            patient_symptoms.append(symptom)
            
    # If the probabilistic coin flips resulted in 0 symptoms, force at least one main symptom
    if not patient_symptoms:
        main_symptoms = list(SPECIALTY_PROFILES[specialty].keys())
        patient_symptoms.append(np.random.choice(main_symptoms))

    # 4. Add "Background Noise" (Real patients often have random unrelated symptoms)
    # E.g., someone with a broken arm might also happen to have a mild headache.
    if np.random.random() < 0.3: # 30% chance to have a random extra symptom
        noise_symptom = np.random.choice(ALL_SYMPTOMS)
        if noise_symptom not in patient_symptoms:
            # Enforce gender rules on noise
            if not ((noise_symptom in ["Testicular Pain", "Prostate Issues"] and gender == "F") or 
                    (noise_symptom in["Menstrual Pain", "Vaginal Discharge", "Breast Pain"] and gender == "M")):
                patient_symptoms.append(noise_symptom)

    # 5. Assign Severity and Duration probabilistically
    severity = np.random.choice(["mild", "moderate", "severe"], p=[0.5, 0.35, 0.15])
    
    if severity == "mild":
        duration = np.random.randint(1, 7)
        min_exp = 1
    elif severity == "moderate":
        duration = np.random.randint(4, 21)
        min_exp = 5
    else:
        duration = np.random.randint(1, 14) # Severe things usually prompt quick visits
        min_exp = 10

    # Save the complex patient profile
    data.append({
        'symptoms': ','.join(patient_symptoms),
        'age': age,
        'gender': gender,
        'severity': severity,
        'duration_days': duration,
        'specialty': specialty,
        'min_experience_years': min_exp
    })

df = pd.DataFrame(data)
df.to_csv('enhanced_medical_dataset.csv', index=False)
print(f"✅ Probabilistic Dataset generated with {num_samples} samples.")
print(f"Specialty distribution:\n{df['specialty'].value_counts()}")