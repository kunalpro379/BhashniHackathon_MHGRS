import pandas as pd
import torch
import json
import numpy as np
from transformers import pipeline, AutoTokenizer, AutoModel, Trainer, TrainingArguments
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import torch.nn as nn
import torch.nn.functional as F
import os

os.environ["WANDB_DISABLED"] = "true"

# Load and preprocess data
def load_data(data):
    records = []
    for line in data.strip().split('\n'):
        if not line.strip():
            continue
        try:
            item = json.loads(line)
            record = {
                "text": item["text"],
                "emotion": None,
                "economicImpact": None,
                "environmentalImpact": None,
                "subcategory": None,
                "urgencyLevel": None,
                "departmentAssigned": None,
                "relatedPolicies": []
            }
            
            for target_line in item["target"].split('\n'):
                if ':' in target_line:
                    key, val = target_line.split(':', 1)
                    key = key.strip()
                    val = val.strip()
                    if val == 'nan':
                        continue
                    if key in record:
                        if val.startswith('['):
                            record[key] = [x.strip(" '\"")
                                          for x in val.strip("[]").split(',')]
                        else:
                            record[key] = val
            records.append(record)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            continue
    return pd.DataFrame(records)

# Zero-shot classification
class ZeroShotGrievanceAnalyzer:
    def __init__(self):
        self.classifier = pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli"
        )
        
        self.emotion_labels = ["Anger", "Disappointment", "Frustration", 
                              "Irritation", "Annoyance", "Concern"]
        self.subcategory_labels = ["Water Distribution", "Power Distribution",
                                  "Waste Management", "Road Maintenance",
                                  "Public Transport", "Hospital Management"]
        self.department_labels = ["UP Jal Nigam", "UP Power Corporation Ltd.",
                                "Municipal Corporation", "Public Works Department",
                                "State Transport Department", "Health Department"]
        self.impact_labels = ["Low", "Medium", "High"]
        
    def predict(self, text):
        # Predict emotion
        emotion_result = self.classifier(
            text,
            candidate_labels=self.emotion_labels,
            hypothesis_template="This text expresses {}."
        )
        
        # Predict subcategory
        subcategory_result = self.classifier(
            text,
            candidate_labels=self.subcategory_labels,
            hypothesis_template="This is a complaint about {}."
        )
        
        # Predict department
        department_result = self.classifier(
            text,
            candidate_labels=self.department_labels,
            hypothesis_template="This complaint should be handled by {}."
        )
        
        # Predict impacts and urgency
        impact_result = self.classifier(
            text,
            candidate_labels=self.impact_labels,
            hypothesis_template="The impact level of this issue is {}."
        )
        
        return {
            "emotion": emotion_result["labels"][0],
            "subcategory": subcategory_result["labels"][0],
            "department": department_result["labels"][0],
            "economic_impact": impact_result["labels"][0],
            "environmental_impact": impact_result["labels"][0],
            "urgency": impact_result["labels"][0]
        }

# Fine-tuning approach
class MultiTaskModel(nn.Module):
    def __init__(self, base_model, num_emotions, num_subcategories, num_departments):
        super().__init__()
        self.base_model = base_model
        hidden_size = base_model.config.hidden_size
        
        self.emotion_head = nn.Linear(hidden_size, num_emotions)
        self.subcategory_head = nn.Linear(hidden_size, num_subcategories)
        self.department_head = nn.Linear(hidden_size, num_departments)
        self.impact_head = nn.Linear(hidden_size, 3)  # Low, Medium, High
        
    def forward(self, **kwargs):
        # Filter inputs to only include what base_model expects
        model_inputs = {k: v for k, v in kwargs.items() if k in ['input_ids', 'attention_mask']}
        outputs = self.base_model(**model_inputs)
        pooled = outputs[0][:, 0]  # Get the [CLS] token embedding
        
        return {
            'emotion': self.emotion_head(pooled),
            'subcategory': self.subcategory_head(pooled),
            'departmentAssigned': self.department_head(pooled),
            'impact': self.impact_head(pooled)
        }

class FineTunedGrievanceAnalyzer:
    def __init__(self, model_path):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        
        # Add required classes to safe globals for model loading
        torch.serialization.add_safe_globals([MultiTaskModel, LabelEncoder])
        
        # Load model and encoders with safe globals
        self.model = torch.load(f"{model_path}/model.pt", map_location=self.device, weights_only=False)
        self.model.eval()
        self.zero_shot = ZeroShotGrievanceAnalyzer()
        
        # Load label encoders with safe globals
        self.encoders = torch.load(f"{model_path}/encoders.pt", weights_only=False)
        self.confidence_threshold = 0.7
        
    def get_confidence(self, logits):
        probs = F.softmax(logits, dim=1)
        return torch.max(probs, dim=1)[0].item()
        
    def predict(self, text):
        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        predictions = {}
        confidences = {}
        
        # Get fine-tuned predictions and confidences
        for key in outputs:
            if key == 'impact':
                confidence = self.get_confidence(outputs[key])
                impact_idx = torch.argmax(outputs[key], dim=1).item()
                if confidence >= self.confidence_threshold:
                    predictions['economic_impact'] = ['Low', 'Medium', 'High'][impact_idx]
                    predictions['environmental_impact'] = ['Low', 'Medium', 'High'][impact_idx]
                    predictions['urgency'] = ['Low', 'Medium', 'High'][impact_idx]
                confidences['impact'] = confidence
            else:
                confidence = self.get_confidence(outputs[key])
                if confidence >= self.confidence_threshold:
                    idx = torch.argmax(outputs[key], dim=1).item()
                    predictions[key] = self.encoders[key].inverse_transform([idx])[0]
                confidences[key] = confidence
        
        # Fall back to zero-shot for low confidence predictions
        zero_shot_pred = self.zero_shot.predict(text)
        for key in zero_shot_pred:
            if key not in predictions or key not in confidences or confidences.get(key, 0) < self.confidence_threshold:
                predictions[key] = zero_shot_pred[key]
        
        return predictions

# Example usage
def main():
    # Sample data
    data = """{"text": "Water contamination causing health issues", "target": "emotion: Concern\neconomicImpact: High\nenvironmentalImpact: High\nsubcategory: Water Distribution\nurgencyLevel: High\ndepartmentAssigned: UP Jal Nigam\nrelatedPolicies: ['UP Jal Nigam Regulations']"}"""
    
    print("Testing Zero-shot Classification:")
    zero_shot_analyzer = ZeroShotGrievanceAnalyzer()
    result = zero_shot_analyzer.predict(" air pollution")
    print("Zero-shot Results:")
    print(json.dumps(result, indent=2))
    print("Zero-shot Results:")
    print(json.dumps(result, indent=2))
    
    print("\nNote: For fine-tuned model, first train the model using the training script")
    print("and then use FineTunedGrievanceAnalyzer with the saved model path.")

    # Sample data for testing
    test_texts = [
        "Water contamination causing health issues",
        "Air pollution in residential area",
        "Broken streetlights in my colony",
        "Garbage not collected for days"
    ]
    
    # Try to load and use fine-tuned model first
    try:
        print("\nTesting Hybrid Approach (Fine-tuned + Zero-shot):")
        analyzer = FineTunedGrievanceAnalyzer("./grievance_model")
        
        for text in test_texts:
            print(f"\nAnalyzing: {text}")
            result = analyzer.predict(text)
            print(json.dumps(result, indent=2))
            
    except Exception as e:
        print(f"\nError loading fine-tuned model: {e}")
        print("Falling back to zero-shot classification only")
        
        analyzer = ZeroShotGrievanceAnalyzer()
        for text in test_texts:
            print(f"\nAnalyzing: {text}")
            result = analyzer.predict(text)
            print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()