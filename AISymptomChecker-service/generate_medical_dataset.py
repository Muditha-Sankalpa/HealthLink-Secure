import pandas as pd
import numpy as np

# List of symptoms (expanded)
symptoms_list = [
    "Abdominal Pain", "Back Pain", "Bleeding", "Blisters", "Bloating",
    "Blurred Vision", "Breathlessness", "Chest Pain", "Chills", "Cough",
    "Constipation", "Diarrhea", "Dizziness", "Dry Mouth", "Earache",
    "Excessive Sweating", "Fainting", "Fatigue", "Fever", "Hair Loss",
    "Headache", "Heartburn", "Hoarseness", "Indigestion", "Itching",
    "Joint Pain", "Loss of Appetite", "Loss of Taste or Smell", "Lumps",
    "Muscle Cramps", "Muscle Pain", "Nausea", "Neck Pain", "Night Sweats",
    "Nosebleed", "Palpitations", "Rash", "Shortness of Breath", "Skin Redness",
    "Sore Throat", "Sweating (excessive)", "Swelling", "Tingling", "Toothache",
    "Vomiting", "Weakness", "Menstrual Pain", "Vaginal Discharge"
]

# Add gender and age-specific symptoms
female_specific = ["Menstrual Pain", "Vaginal Discharge", "Breast Pain"]
male_specific = ["Testicular Pain", "Prostate Issues", "Erectile Dysfunction"]
child_specific = ["Growth Issues", "Developmental Delay", "Frequent Ear Infections"]
elderly_specific = ["Memory Loss", "Frequent Falls", "Urinary Incontinence"]

# All symptoms combined
all_symptoms = symptoms_list + female_specific + male_specific + child_specific + elderly_specific
all_symptoms = list(set(all_symptoms))  # Remove duplicates

def enhanced_assign_specialty(symptoms, age, gender, severity, duration):
    """
    Assign specialty based on symptoms, age, gender, severity, and duration.
    
    Parameters:
        symptoms: comma-separated string of symptoms
        age: patient age (int)
        gender: 'M' or 'F'
        severity: 'mild', 'moderate', or 'severe'
        duration: duration of symptoms in days (int)
        
    Returns:
        specialty: recommended medical specialty
        min_experience: minimum years of experience recommended for the doctor
    """
    symptoms = [s.strip() for s in symptoms.split(',')]
    
    # Set minimum experience based on severity
    if severity == "mild":
        min_experience = 1
    elif severity == "moderate":
        min_experience = 5
    else:  # severe
        min_experience = 10
    
    # Age-based specialization
    if age < 18:
        # Pediatrics for all children, with specialized pediatrics for certain conditions
        if any(s in ["Ear Infection", "Earache", "Sore Throat"] for s in symptoms):
            return "Pediatric ENT", min_experience
        if any(s in ["Rash", "Skin Redness", "Blisters"] for s in symptoms):
            return "Pediatric Dermatology", min_experience
        return "Pediatrics", min_experience
    
    # Geriatrics for elderly with specific conditions
    if age > 65 and any(s in ["Memory Loss", "Frequent Falls", "Joint Pain"] for s in symptoms):
        return "Geriatrics", min_experience
    
    # Gender-specific specialties
    if gender == "F" and any(s in female_specific for s in symptoms):
        return "Obstetrics & Gynecology", min_experience
    
    if gender == "M" and any(s in male_specific for s in symptoms):
        return "Urology", min_experience
    
    # Check for emergency conditions
    if severity == "severe" and any(s in ["Chest Pain", "Shortness of Breath", "Severe Headache"] for s in symptoms):
        return "Emergency Medicine", min_experience
    
    # Consider duration for chronic conditions
    is_chronic = duration > 30  # More than a month
    
    # Specialty assignments based on symptoms
    # ENT
    if any(s in ["Sore Throat", "Earache", "Hoarseness", "Nosebleed"] for s in symptoms):
        return "ENT", min_experience
    
    # Dermatology
    if any(s in ["Rash", "Itching", "Blisters", "Skin Redness", "Hair Loss"] for s in symptoms):
        return "Dermatology", min_experience
    
    # Cardiology
    if any(s in ["Chest Pain", "Palpitations", "Shortness of Breath"] for s in symptoms):
        return "Cardiology", min_experience
    
    # Gastroenterology
    if any(s in ["Abdominal Pain", "Nausea", "Vomiting", "Diarrhea", "Constipation", "Heartburn", "Bloating"] for s in symptoms):
        if is_chronic:
            return "Gastroenterology", min_experience
        return "Internal Medicine", min_experience
    
    # Neurology
    if any(s in ["Dizziness", "Headache", "Tingling", "Fainting", "Weakness", "Blurred Vision"] for s in symptoms):
        return "Neurology", min_experience
    
    # Orthopedics
    if any(s in ["Joint Pain", "Back Pain", "Neck Pain", "Swelling"] for s in symptoms):
        return "Orthopedics", min_experience
    
    # Default to General Practice
    return "General Practice", min_experience

# Generate realistic dataset
np.random.seed(42)
num_samples = 1000

# Create common symptom patterns that often appear together
symptom_patterns = {
    "Cold/Flu": ["Fever", "Cough", "Sore Throat", "Headache", "Fatigue"],
    "Gastroenteritis": ["Nausea", "Vomiting", "Diarrhea", "Abdominal Pain"],
    "Migraine": ["Headache", "Nausea", "Blurred Vision", "Sensitivity to Light"],
    "Allergic Reaction": ["Rash", "Itching", "Swelling"],
    "UTI": ["Urinary Problems", "Abdominal Pain", "Fever"],
    "Anxiety": ["Palpitations", "Excessive Sweating", "Dizziness"]
}

data = []
for _ in range(num_samples):
    # Age distribution (more realistic)
    if np.random.random() < 0.2:  # 20% children
        age = np.random.randint(1, 18)
    elif np.random.random() < 0.3:  # 30% elderly
        age = np.random.randint(65, 95)
    else:  # 50% adults
        age = np.random.randint(18, 65)
    
    gender = np.random.choice(["M", "F"])
    severity = np.random.choice(["mild", "moderate", "severe"], p=[0.6, 0.3, 0.1])
    
    # Duration based on severity
    if severity == "mild":
        duration = np.random.randint(1, 14)  # 1-14 days
    elif severity == "moderate":
        duration = np.random.randint(7, 30)  # 1-4 weeks
    else:
        duration = np.random.randint(1, 90)  # Can be acute or chronic
    
    # Select symptoms (either from patterns or random)
    if np.random.random() < 0.7:  # 70% use a pattern
        pattern_name = np.random.choice(list(symptom_patterns.keys()))
        pattern = symptom_patterns[pattern_name]
        num_pattern_symptoms = min(np.random.randint(1, len(pattern) + 1), 3)
        symptoms = list(np.random.choice(pattern, num_pattern_symptoms, replace=False))
        
        # Add gender/age specific symptoms
        if gender == "F" and np.random.random() < 0.15:
            symptoms.append(np.random.choice(female_specific))
        elif gender == "M" and np.random.random() < 0.15:
            symptoms.append(np.random.choice(male_specific))
        
        if age < 18 and np.random.random() < 0.2:
            symptoms.append(np.random.choice(child_specific))
        elif age > 65 and np.random.random() < 0.3:
            symptoms.append(np.random.choice(elderly_specific))
    else:
        # Random symptoms
        num_symptoms = np.random.randint(1, 4)
        symptoms = list(np.random.choice(all_symptoms, num_symptoms, replace=False))
    
    # Get specialty and required experience
    specialty, required_experience = enhanced_assign_specialty(
        ','.join(symptoms), age, gender, severity, duration
    )
    
    data.append({
        'symptoms': ','.join(symptoms),
        'age': age,
        'gender': gender,
        'severity': severity,
        'duration_days': duration,
        'specialty': specialty,
        'min_experience_years': required_experience
    })

df = pd.DataFrame(data)
df.to_csv('enhanced_medical_dataset.csv', index=False)
print(f"Enhanced medical_dataset.csv generated with {num_samples} samples.")
print(f"Specialty distribution:\n{df['specialty'].value_counts()}")
