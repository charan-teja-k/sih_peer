"""
Machine Learning Prediction Service for Mental Health Risk Assessment
"""
import joblib
import pandas as pd
import numpy as np
import os
from typing import Dict, List, Tuple, Any

class MentalHealthMLPredictor:
    def __init__(self, model_artifacts_path: str = None):
        """
        Initialize the ML predictor with model artifacts
        
        Args:
            model_artifacts_path: Path to the directory containing model artifacts
        """
        if model_artifacts_path is None:
            # Get the absolute path to the model artifacts directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            self.model_artifacts_path = os.path.join(os.path.dirname(current_dir), "hackathon_model_artifacts_cv")
        else:
            self.model_artifacts_path = model_artifacts_path
        self.model = None
        self.preprocessor = None
        self.feature_schema = None
        self.classes = None
        self.feature_importances = None
        
        # Load all model artifacts
        self._load_artifacts()
    
    def _load_artifacts(self):
        """Load all model artifacts from disk"""
        try:
            # Load the trained Random Forest model
            model_path = os.path.join(self.model_artifacts_path, "random_forest_final.joblib")
            self.model = joblib.load(model_path)
            print(f"✅ Loaded model from {model_path}")
            
            # Load preprocessing configuration
            preprocess_path = os.path.join(self.model_artifacts_path, "preprocess_config.joblib")
            self.preprocessor = joblib.load(preprocess_path)
            print(f"✅ Loaded preprocessor from {preprocess_path}")
            
            # Load feature schema
            schema_path = os.path.join(self.model_artifacts_path, "schema_features.csv")
            self.feature_schema = pd.read_csv(schema_path)['feature'].tolist()
            print(f"✅ Loaded feature schema: {len(self.feature_schema)} features")
            
            # Load classes
            classes_path = os.path.join(self.model_artifacts_path, "classes.csv")
            self.classes = pd.read_csv(classes_path)['class'].tolist()
            print(f"✅ Loaded classes: {self.classes}")
            
            # Load feature importances
            importance_path = os.path.join(self.model_artifacts_path, "feature_importances_final.csv")
            self.feature_importances = pd.read_csv(importance_path)
            print(f"✅ Loaded feature importances for {len(self.feature_importances)} features")
            
        except Exception as e:
            print(f"❌ Error loading model artifacts: {str(e)}")
            raise e
    
    def _prepare_features(self, user_data: Dict[str, Any], answers: Dict[str, str]) -> pd.DataFrame:
        """
        Prepare features for ML prediction based on user data and questionnaire answers
        
        Args:
            user_data: User demographic information
            answers: Questionnaire responses (Q1-Q15)
            
        Returns:
            DataFrame with properly formatted features
        """
        # Initialize feature dictionary
        features = {}
        
        # Map questionnaire answers to numeric values
        answer_mapping = {
            "Not at all": 0,
            "Sometimes": 1, 
            "Often": 2,
            "Almost every day": 3
        }
        
        # Add questionnaire features (Q1-Q15)
        for i in range(1, 16):
            q_key = f"Q{i}"
            if q_key in answers:
                features[q_key] = answer_mapping.get(answers[q_key], 0)
            else:
                features[q_key] = 0
        
        # Add demographic features
        features['age'] = user_data.get('age', 20)  # Default age if not provided
        
        # One-hot encode year (based on schema)
        year = user_data.get('year', '').lower()
        features['year_2nd year'] = 1 if '2nd' in year else 0
        features['year_3rd year'] = 1 if '3rd' in year else 0
        features['year_4th year'] = 1 if '4th' in year else 0
        features['year_Other'] = 1 if year and year not in ['2nd year', '3rd year', '4th year'] else 0
        
        # One-hot encode course (based on schema)
        course = user_data.get('course', '').lower()
        features['course_Degree (BA/BSc/BCom)'] = 1 if 'degree' in course or 'ba' in course or 'bsc' in course or 'bcom' in course else 0
        features['course_Diploma'] = 1 if 'diploma' in course else 0
        features['course_Other'] = 1 if 'other' in course else 0
        features['course_Postgraduate (M.Tech/MBA/MSc etc.)'] = 1 if any(x in course for x in ['mtech', 'mba', 'msc', 'postgraduate']) else 0
        features['course_other'] = 1 if course and not any(features[key] for key in ['course_Degree (BA/BSc/BCom)', 'course_Diploma', 'course_Other', 'course_Postgraduate (M.Tech/MBA/MSc etc.)']) else 0
        
        # Create DataFrame with proper feature order
        feature_df = pd.DataFrame([features])
        
        # Ensure all required features are present and in correct order
        for feature in self.feature_schema:
            if feature not in feature_df.columns:
                feature_df[feature] = 0
        
        # Reorder columns to match training schema
        feature_df = feature_df[self.feature_schema]
        
        return feature_df
    
    def predict_risk(self, user_data: Dict[str, Any], answers: Dict[str, str]) -> Dict[str, Any]:
        """
        Predict mental health risk level for a user
        
        Args:
            user_data: User demographic information (age, course, year)
            answers: Questionnaire responses (Q1-Q15)
            
        Returns:
            Dictionary containing prediction results and feature importance
        """
        if self.model is None:
            raise ValueError("Model not loaded. Please initialize the predictor first.")
        
        try:
            # Prepare features
            features_df = self._prepare_features(user_data, answers)
            
            # Make prediction
            prediction = self.model.predict(features_df)[0]
            prediction_proba = self.model.predict_proba(features_df)[0]
            
            # Get probabilities for each class
            class_probabilities = {}
            for i, class_name in enumerate(self.classes):
                class_probabilities[class_name] = float(prediction_proba[i])
            
            # Get top important features for this prediction
            feature_values = features_df.iloc[0].to_dict()
            top_features = self._get_top_contributing_features(feature_values, top_k=5)
            
            # Map prediction to consistent format
            risk_level_mapping = {
                'Low': 'low',
                'Medium': 'medium', 
                'High': 'high'
            }
            
            result = {
                'risk_level': risk_level_mapping.get(prediction, 'medium'),
                'predicted_class': prediction,
                'confidence': float(max(prediction_proba)),
                'class_probabilities': class_probabilities,
                'top_contributing_features': top_features,
                'feature_values': feature_values
            }
            
            print(f"✅ ML Prediction: {prediction} ({result['confidence']:.3f} confidence)")
            return result
            
        except Exception as e:
            print(f"❌ Error making prediction: {str(e)}")
            # Fallback to simple scoring if ML fails
            return self._fallback_scoring(answers)
    
    def _get_top_contributing_features(self, feature_values: Dict[str, float], top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Get top contributing features for the prediction
        
        Args:
            feature_values: Dictionary of feature names and their values
            top_k: Number of top features to return
            
        Returns:
            List of dictionaries with feature information
        """
        try:
            # Calculate contribution scores (importance * value)
            contributions = []
            
            for _, row in self.feature_importances.iterrows():
                feature_name = row['feature']
                importance = row['importance']
                value = feature_values.get(feature_name, 0)
                
                # Only include features with non-zero values
                if value > 0:
                    contribution_score = importance * value
                    contributions.append({
                        'feature': feature_name,
                        'importance': float(importance),
                        'value': float(value),
                        'contribution': float(contribution_score),
                        'question_text': self._get_question_text(feature_name)
                    })
            
            # Sort by contribution score and return top k
            contributions.sort(key=lambda x: x['contribution'], reverse=True)
            return contributions[:top_k]
            
        except Exception as e:
            print(f"❌ Error calculating feature contributions: {str(e)}")
            return []
    
    def _get_question_text(self, feature_name: str) -> str:
        """
        Map feature names to human-readable question text
        """
        question_mapping = {
            'Q1': 'Feeling nervous, anxious, or on edge',
            'Q2': 'Not being able to stop or control worrying', 
            'Q3': 'Having trouble relaxing',
            'Q4': 'Being afraid that something awful might happen',
            'Q5': 'Little interest or pleasure in doing things',
            'Q6': 'Feeling down, depressed, or hopeless',
            'Q7': 'Trouble falling or staying asleep',
            'Q8': 'Feeling tired or having little energy',
            'Q9': 'Poor appetite or overeating',
            'Q10': 'Feeling bad about yourself or that you are a failure',
            'Q11': 'Trouble concentrating on things',
            'Q12': 'Moving or speaking slowly or being fidgety/restless',
            'Q13': 'Thoughts that you would be better off dead',
            'Q14': 'Difficulty with work, home, or relationships',
            'Q15': 'Overall stress level',
            'age': 'Age',
            'year_2nd year': '2nd Year Student',
            'year_3rd year': '3rd Year Student', 
            'year_4th year': '4th Year Student',
            'course_Degree (BA/BSc/BCom)': 'Degree Program',
            'course_Diploma': 'Diploma Program',
            'course_Postgraduate (M.Tech/MBA/MSc etc.)': 'Postgraduate Program'
        }
        
        return question_mapping.get(feature_name, feature_name)
    
    def _fallback_scoring(self, answers: Dict[str, str]) -> Dict[str, Any]:
        """
        Fallback to simple scoring if ML prediction fails
        """
        answer_mapping = {
            "Not at all": 0,
            "Sometimes": 1,
            "Often": 2, 
            "Almost every day": 3
        }
        
        total_score = sum(answer_mapping.get(answer, 0) for answer in answers.values())
        max_score = len(answers) * 3
        percentage = (total_score / max_score) * 100 if max_score > 0 else 0
        
        if percentage >= 60:
            risk_level = 'high'
        elif percentage >= 30:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'risk_level': risk_level,
            'predicted_class': risk_level.capitalize(),
            'confidence': 0.5,  # Default confidence for fallback
            'class_probabilities': {risk_level.capitalize(): 1.0},
            'top_contributing_features': [],
            'feature_values': {},
            'fallback_used': True
        }

# Global predictor instance
predictor = None

def get_predictor():
    """Get or create the global predictor instance"""
    global predictor
    if predictor is None:
        try:
            predictor = MentalHealthMLPredictor()
        except Exception as e:
            print(f"❌ Failed to initialize ML predictor: {str(e)}")
            predictor = None
    return predictor

def predict_mental_health_risk(user_data: Dict[str, Any], answers: Dict[str, str]) -> Dict[str, Any]:
    """
    Main function to predict mental health risk using ML model
    
    Args:
        user_data: User demographic information
        answers: Questionnaire responses
        
    Returns:
        Prediction results
    """
    ml_predictor = get_predictor()
    
    if ml_predictor is None:
        print("⚠️ ML predictor not available, using fallback scoring")
        # Use fallback scoring
        return MentalHealthMLPredictor()._fallback_scoring(answers)
    
    return ml_predictor.predict_risk(user_data, answers)