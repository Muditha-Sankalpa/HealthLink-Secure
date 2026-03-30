# backend/ml/train_model.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer, LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

# Load pre-generated dataset
df = pd.read_csv('enhanced_medical_dataset.csv')

# 1️⃣ Remove rare classes first
counts = df['specialty'].value_counts()
df = df[df['specialty'].isin(counts[counts >= 2].index)]

# Preprocess symptoms
df['symptoms'] = df['symptoms'].apply(lambda x: x.split(','))

# Feature Engineering
mlb = MultiLabelBinarizer()
symptom_features = mlb.fit_transform(df['symptoms'])

# Encode categorical features
gender_le = LabelEncoder()
gender_encoded = gender_le.fit_transform(df['gender'])
severity_le = LabelEncoder()
severity_encoded = severity_le.fit_transform(df['severity'])

# 5️⃣ Scale numerical features
scaler = StandardScaler()
X_numerical = scaler.fit_transform(df[['age', 'duration_days']].values)

# Combine all features including severity and duration
X = np.hstack([
    symptom_features,
    X_numerical,
    gender_encoded.reshape(-1, 1),
    severity_encoded.reshape(-1, 1),
    df['duration_days'].values.reshape(-1, 1)
])

# Normalize numerical features
scaler = StandardScaler()
X_numerical = scaler.fit_transform(
    np.hstack([
        df['age'].values.reshape(-1, 1),
        df['duration_days'].values.reshape(-1, 1)
    ])
)

# Combine normalized numerical features with one-hot encoded features
X = np.hstack([
    symptom_features,
    X_numerical,
    gender_encoded.reshape(-1, 1),
    severity_encoded.reshape(-1, 1)
])

# Target Encoding
specialty_le = LabelEncoder()
y = specialty_le.fit_transform(df['specialty'])

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2, 
    random_state=42
)

# Model Training with hyperparameter tuning
param_grid = {
    'n_estimators': [100, 200],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5],
    'min_samples_leaf': [1, 2]
}

grid_search = GridSearchCV(
    RandomForestClassifier(class_weight='balanced', random_state=42),
    param_grid=param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1
)

grid_search.fit(X_train, y_train)
best_model = grid_search.best_estimator_

# Save the best model and encoders
joblib.dump(best_model, 'specialty_model.pkl')
joblib.dump(mlb, 'symptom_mlb.pkl')
joblib.dump(gender_le, 'gender_le.pkl')
joblib.dump(severity_le, 'severity_le.pkl')
joblib.dump(specialty_le, 'specialty_le.pkl')
joblib.dump(scaler, 'feature_scaler.pkl')

# Evaluate the model
y_pred = best_model.predict(X_test)
print(f"Best parameters: {grid_search.best_params_}")
print(f"Train Accuracy: {best_model.score(X_train, y_train):.2f}")
print(f"Test Accuracy: {best_model.score(X_test, y_test):.2f}")

# Detailed classification report
# Get actual present classes in test set
present_classes = np.unique(y_test)
class_names = specialty_le.inverse_transform(present_classes)

# Updated classification report
print("\nClassification Report:")
print(classification_report(
    y_test, 
    y_pred,
    labels=present_classes,
    target_names=class_names
))

# Feature importance analysis
feature_names = list(mlb.classes_) + ['Age', 'Duration'] + ['Gender'] + ['Severity']
importances = best_model.feature_importances_
indices = np.argsort(importances)[::-1]

# Print feature ranking
print("\nFeature ranking:")
for i in range(min(20, len(feature_names))):  # Show top 20 features
    print(f"{i+1}. {feature_names[indices[i]]} ({importances[indices[i]]:.4f})")

# Save feature importance visualization
plt.figure(figsize=(12, 8))
plt.bar(range(min(20, len(indices))), 
        importances[indices[:20]], 
        align='center')
plt.xticks(range(min(20, len(indices))), 
          [feature_names[i] for i in indices[:20]], 
          rotation=90)
plt.xlabel('Features')
plt.ylabel('Importance')
plt.title('Feature Importance')
plt.tight_layout()
plt.savefig('feature_importance.png')

print("Model, encoders, and visualizations saved successfully")
