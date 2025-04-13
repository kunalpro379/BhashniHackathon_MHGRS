import pandas as pd
import torch
import json
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    Trainer, TrainingArguments, DistilBertPreTrainedModel, DistilBertModel
)
import torch.nn as nn
import torch.nn.functional as F
import os

os.environ["WANDB_DISABLED"] = "true"

# Improved data loading
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
            
            # Parse target
            for target_line in item["target"].split('\n'):
                if ':' in target_line:
                    key, val = target_line.split(':', 1)
                    key = key.strip()
                    val = val.strip()
                    if val == 'nan':
                        continue
                    if key in record:
                        if val.startswith('['):
                            record[key] = [x.strip(" '\"") for x in val.strip("[]").split(',')]
                        else:
                            record[key] = val
            records.append(record)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            continue
    return pd.DataFrame(records)

# Sample data - properly formatted with each JSON object on a single line
data = """{"text": "Complaint: No water supply for over two days, severe issues with daily cleaning and drinking water.", "target": "emotion: Disappointment\\neconomicImpact: Medium\\nenvironmentalImpact: Low\\nsubcategory: Water Distribution\\nurgencyLevel: High\\ndepartmentAssigned: UP Jal Nigam\\nrelatedPolicies: ['UP Jal Nigam Regulations', 'Water Supply Management Act']"}
{"text": "Complaint: Electricity bills too high, frequent power cuts during peak hours.", "target": "emotion: Frustration\\neconomicImpact: High\\nenvironmentalImpact: Medium\\nsubcategory: Power Distribution\\nurgencyLevel: High\\ndepartmentAssigned: UP Power Corporation Ltd.\\nrelatedPolicies: ['UP Electricity Regulatory Commission Guidelines']"}
{"text": "Complaint: Garbage collection irregular, heaps of waste rotting in public places.", "target": "emotion: Anger\\neconomicImpact: Medium\\nenvironmentalImpact: High\\nsubcategory: Waste Management\\nurgencyLevel: High\\ndepartmentAssigned: Municipal Corporation\\nrelatedPolicies: ['Municipal Solid Waste Management Rules']"}
{"text": "Complaint: Roads filled with potholes, dangerous to drive, increasing accidents.", "target": "emotion: Irritation\\neconomicImpact: Medium\\nenvironmentalImpact: Low\\nsubcategory: Road Maintenance\\nurgencyLevel: High\\ndepartmentAssigned: Public Works Department\\nrelatedPolicies: ['Road Safety Act']"}
{"text": "Complaint: Public buses unreliable and overcrowded, don't follow schedules.", "target": "emotion: Annoyance\\neconomicImpact: Medium\\nenvironmentalImpact: Low\\nsubcategory: Public Transport\\nurgencyLevel: Medium\\ndepartmentAssigned: State Transport Department\\nrelatedPolicies: ['Public Transport Regulations']"}
{"text": "Complaint: Government hospital lacks proper sanitation, long patient wait times.", "target": "emotion: Concern\\neconomicImpact: Medium\\nenvironmentalImpact: Low\\nsubcategory: Hospital Management\\nurgencyLevel: High\\ndepartmentAssigned: Health Department\\nrelatedPolicies: ['Hospital Management Guidelines']"}"""

# Load and validate data
print("Loading data...")
df = load_data(data)
if df.empty:
    raise ValueError("No valid data was loaded. Check your input format.")
else:
    print(f"Successfully loaded {len(df)} records.")
    print(df.head(2))

# Preprocessing
def preprocess_data(df):
    impact_map = {'Low': 0, 'Medium': 1, 'High': 2}
    urgency_map = {'Low': 0, 'Medium': 1, 'High': 2}
    
    df['economicImpact'] = df['economicImpact'].map(impact_map).fillna(1)
    df['environmentalImpact'] = df['environmentalImpact'].map(impact_map).fillna(1)
    df['urgencyLevel'] = df['urgencyLevel'].map(urgency_map).fillna(1)
    
    encoders = {}
    for col in ['emotion', 'subcategory', 'departmentAssigned']:
        encoder = LabelEncoder()
        df[col] = encoder.fit_transform(df[col].fillna('Unknown'))
        encoders[col] = encoder
        print(f"{col} classes: {encoder.classes_}")
    
    return df, encoders

print("Preprocessing data...")
df_processed, encoders = preprocess_data(df)
print("Data preprocessing complete.")

# Split data
train_df, test_df = train_test_split(df_processed, test_size=0.2, random_state=42)
print(f"Training set: {len(train_df)} samples, Test set: {len(test_df)} samples")

# Install and import datasets if needed
try:
    from datasets import Dataset
except ImportError:
    print("Installing datasets library...")
    import subprocess
    subprocess.check_call(["pip", "install", "datasets"])
    from datasets import Dataset

# Tokenizer
print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)

print("Creating datasets...")
train_dataset = Dataset.from_pandas(train_df).map(tokenize_function, batched=True)
test_dataset = Dataset.from_pandas(test_df).map(tokenize_function, batched=True)
print("Datasets created successfully.")

# Model
class MultiTaskDistilBert(DistilBertPreTrainedModel):
    def __init__(self, config):
        super().__init__(config)
        self.distilbert = DistilBertModel(config)
        
        # Task heads
        self.emotion_head = nn.Linear(config.dim, len(encoders['emotion'].classes_))
        self.subcategory_head = nn.Linear(config.dim, len(encoders['subcategory'].classes_))
        self.department_head = nn.Linear(config.dim, len(encoders['departmentAssigned'].classes_))
        self.economic_head = nn.Linear(config.dim, 1)
        self.environmental_head = nn.Linear(config.dim, 1)
        self.urgency_head = nn.Linear(config.dim, 3)
        
        self.init_weights()

    def forward(self, **inputs):
        outputs = self.distilbert(**inputs)
        pooled = outputs.last_hidden_state[:, 0]
        
        return {
            'emotion': self.emotion_head(pooled),
            'subcategory': self.subcategory_head(pooled),
            'department': self.department_head(pooled),
            'economic': self.economic_head(pooled),
            'environmental': self.environmental_head(pooled),
            'urgency': self.urgency_head(pooled)
        }

# Trainer
# Trainer
class MultiTaskTrainer(Trainer):
    def compute_loss(self, model, inputs, return_outputs=False):
        # Extract labels and prepare model inputs
        labels = {}
        model_inputs = {}
        
        # Separate inputs and labels
        for key, value in inputs.items():
            if key in ['input_ids', 'attention_mask']:
                model_inputs[key] = value
        
        # Map dataset columns to labels
        column_mapping = {
            'emotion': 'emotion',
            'subcategory': 'subcategory',
            'departmentAssigned': 'department',
            'economicImpact': 'economic',
            'environmentalImpact': 'environmental',
            'urgencyLevel': 'urgency'
        }
        
        for dataset_col, model_col in column_mapping.items():
            if dataset_col in inputs:
                value = inputs[dataset_col]
                if dataset_col in ['economicImpact', 'environmentalImpact']:
                    value = value.float().unsqueeze(1)
                labels[model_col] = value
        
        outputs = model(**model_inputs)
        
        # Calculate losses
        losses = []
        loss_fns = {
            'emotion': F.cross_entropy,
            'subcategory': F.cross_entropy,
            'department': F.cross_entropy,
            'economic': F.mse_loss,
            'environmental': F.mse_loss,
            'urgency': F.cross_entropy
        }
        
        for label_name, loss_fn in loss_fns.items():
            if label_name in labels:
                losses.append(loss_fn(outputs[label_name], labels[label_name]))
        
        loss = sum(losses) if losses else torch.tensor(0.0).to(model.device)
        return (loss, outputs) if return_outputs else loss

# Training
print("Initializing model...")
model = MultiTaskDistilBert.from_pretrained("distilbert-base-uncased")
print("Model initialized.")

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=2,
    per_device_eval_batch_size=2,
    evaluation_strategy="steps",
    eval_steps=5,
    save_strategy="steps",
    save_steps=5,
    learning_rate=2e-5,
    weight_decay=0.01,
    load_best_model_at_end=True,
    logging_dir="./logs",
    logging_steps=1,
    remove_unused_columns=False,  # Changed to False to keep all columns
    dataloader_num_workers=0
)

class MultiTaskDataCollator:
    def __init__(self, tokenizer):
        self.tokenizer = tokenizer

    def __call__(self, features):
        batch = {}
        # Handle tokenizer outputs
        for k in ['input_ids', 'attention_mask']:
            batch[k] = torch.tensor([f[k] for f in features])

        # Handle labels
        if 'emotion' in features[0]:
            batch['emotion'] = torch.tensor([f['emotion'] for f in features])
        if 'subcategory' in features[0]:
            batch['subcategory'] = torch.tensor([f['subcategory'] for f in features])
        if 'departmentAssigned' in features[0]:
            batch['departmentAssigned'] = torch.tensor([f['departmentAssigned'] for f in features])
        if 'economicImpact' in features[0]:
            batch['economicImpact'] = torch.tensor([f['economicImpact'] for f in features], dtype=torch.float)
        if 'environmentalImpact' in features[0]:
            batch['environmentalImpact'] = torch.tensor([f['environmentalImpact'] for f in features], dtype=torch.float)
        if 'urgencyLevel' in features[0]:
            batch['urgencyLevel'] = torch.tensor([f['urgencyLevel'] for f in features])

        return batch

# Update trainer initialization
print("Setting up trainer...")
trainer = MultiTaskTrainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    data_collator=MultiTaskDataCollator(tokenizer)
)

print("Starting training...")
trainer.train()
print("Training complete!")

# Save model
print("Saving model...")
model.save_pretrained("./complaint_model")
tokenizer.save_pretrained("./complaint_model")
print("Model saved successfully.")

# Prediction
class ComplaintAnalyzer:
    def __init__(self, model_path, tokenizer_path, encoders):
        self.model = MultiTaskDistilBert.from_pretrained(model_path)
        self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)
        self.encoders = encoders
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self.device}")
        self.model.to(self.device)
        self.model.eval()  # Set model to evaluation mode
        
    def predict(self, text):
        inputs = self.tokenizer(text, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        emotion = self.encoders['emotion'].inverse_transform(
            [torch.argmax(outputs['emotion']).item()])[0]
        
        subcategory = self.encoders['subcategory'].inverse_transform(
            [torch.argmax(outputs['subcategory']).item()])[0]
        
        department = self.encoders['departmentAssigned'].inverse_transform(
            [torch.argmax(outputs['department']).item()])[0]
        
        economic = torch.clamp(outputs['economic'], 0, 2).item()
        environmental = torch.clamp(outputs['environmental'], 0, 2).item()
        urgency = ['Low', 'Medium', 'High'][torch.argmax(outputs['urgency']).item()]
        
        return {
            "emotion": emotion,
            "subcategory": subcategory,
            "department": department,
            "economic_impact": ['Low', 'Medium', 'High'][round(economic)],
            "environmental_impact": ['Low', 'Medium', 'High'][round(environmental)],
            "urgency": urgency
        }

# Usage
print("Initializing complaint analyzer...")
analyzer = ComplaintAnalyzer("./complaint_model", "./complaint_model", encoders)
print("Complaint analyzer initialized.")

test_complaints = [
    "Water contamination causing health issues",
    "Frequent power outages damaging electronics",
    "Dangerous potholes on main road",
    "Overcrowded buses not following COVID protocols"
]

print("\nTesting model on sample complaints:")
for complaint in test_complaints:
    print(f"\nComplaint: {complaint}")
    result = analyzer.predict(complaint)
    print(result)

print("\nComplaint analysis complete!")