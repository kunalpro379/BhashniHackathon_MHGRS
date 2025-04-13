import torch
import pandas as pd
from transformers import AutoTokenizer, AutoModel
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import os
from GrievanceAnalyzer import load_data, MultiTaskModel

class GrievanceDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=128):
        self.encodings = tokenizer(texts, truncation=True, padding=True, max_length=max_length, return_tensors='pt')
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: val[idx] for key, val in self.encodings.items()}
        item.update({key: torch.tensor(val[idx]) for key, val in self.labels.items()})
        return item

    def __len__(self):
        return len(self.encodings.input_ids)

def train_model():
    # Load and preprocess data
    with open('train.jsonl', 'r', encoding='utf-8') as f:
        data = f.read()
    df = load_data(data)

    # Initialize label encoders
    encoders = {}
    encoded_labels = {}
    for column in ['emotion', 'subcategory', 'departmentAssigned']:
        encoders[column] = LabelEncoder()
        encoded_labels[column] = encoders[column].fit_transform(df[column].fillna('Unknown'))

    # Encode impact levels
    impact_map = {'Low': 0, 'Medium': 1, 'High': 2}
    encoded_labels['impact'] = df['economicImpact'].map(impact_map).fillna(1).astype(int)

    # Initialize tokenizer and base model
    model_name = 'bert-base-uncased'
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    base_model = AutoModel.from_pretrained(model_name)

    # Create model
    model = MultiTaskModel(
        base_model=base_model,
        num_emotions=len(encoders['emotion'].classes_),
        num_subcategories=len(encoders['subcategory'].classes_),
        num_departments=len(encoders['departmentAssigned'].classes_)
    )

    # Create dataset
    dataset = GrievanceDataset(
        texts=df['text'].tolist(),
        labels=encoded_labels,
        tokenizer=tokenizer
    )

    # Create data loader
    train_loader = DataLoader(dataset, batch_size=16, shuffle=True)

    # Training setup
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)
    optimizer = optim.AdamW(model.parameters(), lr=2e-5)
    criterion = nn.CrossEntropyLoss()

    # Create model directory
    os.makedirs('grievance_model', exist_ok=True)

    # Training loop
    num_epochs = 10
    for epoch in range(num_epochs):
        model.train()
        total_loss = 0
        for batch in train_loader:
            optimizer.zero_grad()

            # Move batch to device
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = {k: v.to(device) for k, v in batch.items() if k not in ['input_ids', 'attention_mask']}

            # Forward pass
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)

            # Calculate loss for each task
            loss = 0
            for key in outputs:
                if key == 'impact':
                    loss += criterion(outputs[key], labels['impact'])
                else:
                    loss += criterion(outputs[key], labels[key])

            # Backward pass
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        print(f'Epoch {epoch+1}/{num_epochs}, Average Loss: {avg_loss:.4f}')

    # Save model and encoders
    torch.save(model, 'grievance_model/model.pt')
    torch.save(encoders, 'grievance_model/encoders.pt')
    tokenizer.save_pretrained('grievance_model')

if __name__ == '__main__':
    train_model()