import pandas as pd
import json
from datasets import Dataset
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

# Disable wandb
import os
os.environ["WANDB_DISABLED"] = "true"

# First, let's fix the JSON data format
dataset_json_fixed = """
[
    {
        "text": "Complaint: There has been no water supply for over two days. We are facing severe issues with daily cleaning and drinking water. The authorities are not responding to our complaints.",
        "category": "Infrastructure",
        "emotion": "Disappointment",
        "economicImpact": "Medium",
        "environmentalImpact": "Low",
        "subcategory": "Water Distribution",
        "urgencyLevel": "High",
        "departmentAssigned": "UP Jal Nigam",
        "relatedPolicies": ["UP Jal Nigam Regulations", "Water Supply Management Act"]
    },
    {
        "text": "Complaint: The electricity bills are too high, and the power cuts are frequent. Even during peak hours, the power supply is cut off without any prior notice.",
        "category": "Utilities",
        "emotion": "Frustration",
        "economicImpact": "High",
        "environmentalImpact": "Medium",
        "subcategory": "Power Distribution",
        "urgencyLevel": "High",
        "departmentAssigned": "UP Power Corporation Ltd.",
        "relatedPolicies": ["UP Electricity Regulatory Commission Guidelines", "Power Distribution Policy"]
    },
    {
        "text": "Complaint: The garbage collection is irregular, and the heaps of waste are rotting in public places. This is affecting the cleanliness and health of the locality.",
        "category": "Sanitation",
        "emotion": "Anger",
        "economicImpact": "Medium",
        "environmentalImpact": "High",
        "subcategory": "Waste Management",
        "urgencyLevel": "High",
        "departmentAssigned": "Municipal Corporation",
        "relatedPolicies": ["Municipal Solid Waste Management Rules", "Public Health Act"]
    },
    {
        "text": "Complaint: The roads are filled with potholes, and it's becoming dangerous to drive. Accidents are increasing due to the poor condition of the streets, and there is no repair work being done.",
        "category": "Infrastructure",
        "emotion": "Irritation",
        "economicImpact": "Medium",
        "environmentalImpact": "Low",
        "subcategory": "Road Maintenance",
        "urgencyLevel": "High",
        "departmentAssigned": "Public Works Department",
        "relatedPolicies": ["Public Works Department Guidelines", "Road Safety Act"]
    },
    {
        "text": "Complaint: The public buses are unreliable and overcrowded. They often don't follow schedules, leaving people stranded for long hours, especially during rush hour.",
        "category": "Transport",
        "emotion": "Annoyance",
        "economicImpact": "Medium",
        "environmentalImpact": "Low",
        "subcategory": "Public Transport",
        "urgencyLevel": "Medium",
        "departmentAssigned": "State Transport Department",
        "relatedPolicies": ["Public Transport Regulations", "Urban Transport Policy"]
    },
    {
        "text": "Complaint: The government hospital lacks proper sanitation, and patients often wait for hours to be attended to. The hospital staff is overworked and seems to be in constant shortage.",
        "category": "Healthcare",
        "emotion": "Concern",
        "economicImpact": "Medium",
        "environmentalImpact": "Low",
        "subcategory": "Hospital Management",
        "urgencyLevel": "High",
        "departmentAssigned": "Health Department",
        "relatedPolicies": ["Public Health Act", "Hospital Management Guidelines"]
    },
    {
        "text": "Complaint: The police seem uninterested in solving local crimes. Even after repeated complaints, the authorities have not taken any serious action against local criminals.",
        "category": "Law & Order",
        "emotion": "Frustration",
        "economicImpact": "Medium",
        "environmentalImpact": "Low",
        "subcategory": "Crime Management",
        "urgencyLevel": "High",
        "departmentAssigned": "Police Department",
        "relatedPolicies": ["Police Act", "Criminal Procedure Code"]
    },
    {
        "text": "Complaint: Schools in our area are facing a severe shortage of teachers, and classes are often merged, causing disruptions. The government must improve the education system urgently.",
        "category": "Education",
        "emotion": "Concern",
        "economicImpact": "Medium",
        "environmentalImpact": "Low",
        "subcategory": "School Management",
        "urgencyLevel": "High",
        "departmentAssigned": "Education Department",
        "relatedPolicies": ["Education Act", "Teacher Recruitment Policy"]
    },
    {
        "text": "Complaint: We have to rely on tanker services for water, and even then, the supply is irregular. The authorities need to fix the local water system immediately.",
        "category": "Infrastructure",
        "emotion": "Frustration",
        "economicImpact": "Medium",
        "environmentalImpact": "Low",
        "subcategory": "Water Distribution",
        "urgencyLevel": "High",
        "departmentAssigned": "UP Jal Nigam",
        "relatedPolicies": ["UP Jal Nigam Regulations", "Water Supply Management Act"]
    },
    {
        "text": "Complaint: The electric supply in our area is very unstable. During the day, we experience frequent power fluctuations, and during the night, power cuts are a common issue.",
        "category": "Utilities",
        "emotion": "Disappointment",
        "economicImpact": "High",
        "environmentalImpact": "Medium",
        "subcategory": "Power Distribution",
        "urgencyLevel": "High",
        "departmentAssigned": "UP Power Corporation Ltd.",
        "relatedPolicies": ["UP Electricity Regulatory Commission Guidelines", "Power Distribution Policy"]
    },
    {
        "text": "Complaint: The garbage bins are never cleared on time, and the streets are always littered with waste. It's become a serious environmental concern.",
        "category": "Sanitation",
        "emotion": "Disgust",
        "economicImpact": "Medium",
        "environmentalImpact": "High",
        "subcategory": "Waste Management",
        "urgencyLevel": "High",
        "departmentAssigned": "Municipal Corporation",
        "relatedPolicies": ["Municipal Solid Waste Management Rules", "Public Health Act"]
    }
]
"""

# Load dataset function for the fixed format
def load_dataset(json_data):
    try:
        # Parse the JSON array
        records = json.loads(json_data)
        
        # Convert to DataFrame
        df = pd.DataFrame(records)
        
        # Fill missing values
        df = df.fillna('Unknown')
        
        # Clean up impact fields - remove descriptions after dash
        for col in ['economicImpact', 'environmentalImpact']:
            if col in df.columns:
                df[col] = df[col].apply(lambda x: x.split('-')[0].strip() if isinstance(x, str) and '-' in x else x)
        
        return df
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        raise ValueError("Failed to parse JSON data")

# Load the dataset
df = load_dataset(dataset_json_fixed)

# Label encoders for each target
label_encoders = {
    'emotion': LabelEncoder(),
    'urgencyLevel': LabelEncoder(),
    'economicImpact': LabelEncoder(),
    'environmentalImpact': LabelEncoder()
}

# Fit and transform each column
for col in label_encoders:
    df[col] = label_encoders[col].fit_transform(df[col])

# Split dataset
train_texts, test_texts, train_labels, test_labels = train_test_split(
    df['text'].tolist(), 
    df[['emotion', 'urgencyLevel', 'economicImpact', 'environmentalImpact']].values.tolist(),
    test_size=0.2,
    random_state=42
)

# Create datasets
train_dataset = Dataset.from_dict({
    'text': train_texts,
    'labels': train_labels
})

test_dataset = Dataset.from_dict({
    'text': test_texts,
    'labels': test_labels
})

# Tokenizer
model_name = "distilbert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)

def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)

train_dataset = train_dataset.map(tokenize_function, batched=True)
test_dataset = test_dataset.map(tokenize_function, batched=True)

# Model
class MultiLabelModel(torch.nn.Module):
    def __init__(self, model_name, num_emotions, num_urgency, num_economic, num_environmental):
        super().__init__()
        self.base_model = AutoModelForSequenceClassification.from_pretrained(
            model_name,
            num_labels=num_emotions
        )
        self.urgency_head = torch.nn.Linear(self.base_model.config.hidden_size, num_urgency)
        self.economic_head = torch.nn.Linear(self.base_model.config.hidden_size, num_economic)
        self.environmental_head = torch.nn.Linear(self.base_model.config.hidden_size, num_environmental)
        
    def forward(self, **kwargs):
        outputs = self.base_model(**kwargs)
        hidden_state = outputs.logits
        
        urgency_logits = self.urgency_head(hidden_state)
        economic_logits = self.economic_head(hidden_state)
        environmental_logits = self.environmental_head(hidden_state)
        
        return {
            'emotion_logits': outputs.logits,
            'urgency_logits': urgency_logits,
            'economic_logits': economic_logits,
            'environmental_logits': environmental_logits
        }

num_emotions = len(label_encoders['emotion'].classes_)
num_urgency = len(label_encoders['urgencyLevel'].classes_)
num_economic = len(label_encoders['economicImpact'].classes_)
num_environmental = len(label_encoders['environmentalImpact'].classes_)

model = MultiLabelModel(model_name, num_emotions, num_urgency, num_economic, num_environmental)

# Custom trainer
class MultiLabelTrainer(Trainer):
    def compute_loss(self, model, inputs, return_outputs=False):
        labels = inputs.pop("labels")
        outputs = model(**inputs)
        
        emotion_loss = torch.nn.functional.cross_entropy(
            outputs['emotion_logits'], 
            labels[:, 0].long()
        )
        
        urgency_loss = torch.nn.functional.cross_entropy(
            outputs['urgency_logits'], 
            labels[:, 1].long()
        )
        
        economic_loss = torch.nn.functional.cross_entropy(
            outputs['economic_logits'], 
            labels[:, 2].long()
        )
        
        environmental_loss = torch.nn.functional.cross_entropy(
            outputs['environmental_logits'], 
            labels[:, 3].long()
        )
        
        total_loss = emotion_loss + urgency_loss + economic_loss + environmental_loss
        
        return (total_loss, outputs) if return_outputs else total_loss

# Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=10,
    weight_decay=0.01,
    save_strategy="epoch",
    load_best_model_at_end=True
)

trainer = MultiLabelTrainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
)

# Prediction function
def predict_all_targets(text):
    # Tokenize input
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128)
    
    # Get predictions
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Get predicted classes
    emotion_pred = torch.argmax(outputs['emotion_logits'], dim=1).item()
    urgency_pred = torch.argmax(outputs['urgency_logits'], dim=1).item()
    economic_pred = torch.argmax(outputs['economic_logits'], dim=1).item()
    environmental_pred = torch.argmax(outputs['environmental_logits'], dim=1).item()
    
    # Decode predictions
    return {
        'emotion': label_encoders['emotion'].inverse_transform([emotion_pred])[0],
        'urgencyLevel': label_encoders['urgencyLevel'].inverse_transform([urgency_pred])[0],
        'economicImpact': label_encoders['economicImpact'].inverse_transform([economic_pred])[0],
        'environmentalImpact': label_encoders['environmentalImpact'].inverse_transform([environmental_pred])[0]
    }