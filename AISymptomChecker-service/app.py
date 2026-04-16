from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load artifacts once at startup
try:
    clf = joblib.load('specialty_model.pkl')
    mlb = joblib.load('symptom_mlb.pkl') 
    gender_le = joblib.load('gender_le.pkl')
    severity_le = joblib.load('severity_le.pkl')
    specialty_le = joblib.load('specialty_le.pkl')
    scaler = joblib.load('feature_scaler.pkl')
    logger.info("Model artifacts loaded successfully")
except Exception as e:
    logger.error(f"Failed to load model artifacts: {str(e)}")
    raise

app = Flask(__name__)
CORS(app)

@app.route('/api/symptom-checker/predict', methods=['POST'])
def predict():
    """Predict medical specialty based on symptoms, age, gender, severity, and duration"""
    try:
        # Validate and parse input
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400
            
        symptoms = data.get('symptoms', [])
        age = data.get('age')
        gender = data.get('gender', '').strip().upper()
        severity = data.get('severity', 'moderate').lower()
        duration_days = data.get('duration_days', 7) 

        # Input validation
        if not symptoms:
            return jsonify({"error": "At least one symptom required"}), 400
            
        if not isinstance(symptoms, list):
            symptoms = [s.strip() for s in str(symptoms).split(',')]

        if not (0 <= age <= 120):
            return jsonify({"error": "Age must be between 0 and 120"}), 400

        if gender not in gender_le.classes_:
            return jsonify({
                "error": f"Invalid gender. Valid options: {list(gender_le.classes_)}"
            }), 400
            
        if severity not in severity_le.classes_:
            return jsonify({
                "error": f"Invalid severity. Valid options: {list(severity_le.classes_)}"
            }), 400
            
        if not (0 < duration_days < 365):
            return jsonify({"error": "Duration must be between 1 and 365 days"}), 400

        # Feature engineering
        symptoms_encoded = mlb.transform([symptoms])
        gender_encoded = gender_le.transform([gender])
        severity_encoded = severity_le.transform([severity])
        
        # Scale numerical features
        numerical_features = np.array([[age, duration_days]])
        scaled_numerical = scaler.transform(numerical_features)
        
        # Combine features
        X_input = np.hstack([
            symptoms_encoded,
            scaled_numerical,
            gender_encoded.reshape(-1, 1),
            severity_encoded.reshape(-1, 1)
        ])

        # Make prediction
        pred = clf.predict(X_input)
        proba = clf.predict_proba(X_input)[0]
        
        # Determine recommended experience based on severity
        if severity == "mild":
            min_experience = 1
            suggestion = "Your symptoms appear mild. Ensure you get plenty of rest and stay hydrated. Consider booking a regular checkup if symptoms persist."
        elif severity == "moderate":
            min_experience = 5
            suggestion = "Your symptoms are moderate. We strongly recommend scheduling an appointment with a specialist soon to get a proper diagnosis."
        else:  # severe
            min_experience = 10
            suggestion = "URGENT: Your symptoms indicate a potentially severe condition. Please seek immediate medical attention or visit an emergency room."
        
        return jsonify({
            "predicted_specialty": specialty_le.inverse_transform(pred)[0],
            "confidence": float(proba.max()),
            "probabilities": {
                spec: float(prob) 
                for spec, prob in zip(specialty_le.classes_, proba)
            },
            "recommended_min_experience": min_experience,
            "health_suggestion": suggestion,
            "input": {
                "symptoms": symptoms,
                "age": age,
                "gender": gender,
                "severity": severity,
                "duration_days": duration_days
            }
        })

    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Prediction failed",
            "message": str(e)
        }), 500

def create_app():
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5007, threaded=True)
