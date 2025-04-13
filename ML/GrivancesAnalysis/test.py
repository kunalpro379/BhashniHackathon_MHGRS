import torch
from GrievanceAnalyzer import FineTunedGrievanceAnalyzer, ZeroShotGrievanceAnalyzer
import json

def test_grievance_model():
    # Sample test cases
    test_texts = [
        "Water supply has been irregular for the past week in our area",
        "Roads are damaged and full of potholes causing accidents",
        "Garbage collection is irregular and causing health issues",
        "Frequent power cuts affecting businesses in the industrial area",
        "Public transport buses are not following schedule"
    ]

    print("Testing Grievance Analysis Model\n")

    try:
        # Try loading the fine-tuned model
        print("=== Using Fine-tuned Model ===")
        print("Attempting to load fine-tuned model...")
        analyzer = FineTunedGrievanceAnalyzer("./grievance_model")
        print("Successfully loaded fine-tuned model!\n")

        # Test each grievance text
        for text in test_texts:
            print(f"\n📝 Analyzing Grievance: {text}")
            try:
                result = analyzer.predict(text)
                print("\n🤖 Fine-tuned Model Prediction:")
                print("----------------------------------------")
                print(f"😔 Emotion: {result.get('emotion', 'N/A')}")
                print(f"⚡ Urgency: {result.get('urgency', 'N/A')}")
                print(f"💰 Economic Impact: {result.get('economic_impact', 'N/A')}")
                print(f"🌍 Environmental Impact: {result.get('environmental_impact', 'N/A')}")
                print(f"📋 Subcategory: {result.get('subcategory', 'N/A')}")
                print(f"🏢 Department: {result.get('department', 'N/A')}")
                print("----------------------------------------")
            except Exception as e:
                print(f"Error during prediction: {e}")

    except Exception as e:
        print(f"\nError loading fine-tuned model: {e}")
        print("Falling back to zero-shot classification...\n")

        # Fallback to zero-shot classification
        print("=== Using Zero-shot Classification ===")
        analyzer = ZeroShotGrievanceAnalyzer()
        for text in test_texts:
            print(f"\n📝 Analyzing Grievance: {text}")
            try:
                result = analyzer.predict(text)
                print("\n🔍 Zero-shot Model Prediction:")
                print("----------------------------------------")
                print(f"😔 Emotion: {result.get('emotion', 'N/A')}")
                print(f"⚡ Urgency: {result.get('urgency', 'N/A')}")
                print(f"💰 Economic Impact: {result.get('economic_impact', 'N/A')}")
                print(f"🌍 Environmental Impact: {result.get('environmental_impact', 'N/A')}")
                print(f"📋 Subcategory: {result.get('subcategory', 'N/A')}")
                print(f"🏢 Department: {result.get('department', 'N/A')}")
                print("----------------------------------------")
            except Exception as e:
                print(f"Error during prediction: {e}")

if __name__ == "__main__":
    test_grievance_model()