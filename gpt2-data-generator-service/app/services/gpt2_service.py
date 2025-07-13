from transformers import GPT2LMHeadModel, GPT2Tokenizer
from datetime import datetime
from pathlib import Path
import os
import torch


class GPT2Service:
    def __init__(self, model_name="gpt2"):
        print("🔧 Initializing GPT-2 model...")
        self.model_name = model_name
        self.tokenizer = GPT2Tokenizer.from_pretrained(model_name)
        self.model = GPT2LMHeadModel.from_pretrained(model_name)
        self.model.eval()
        self.trained = True  # Pretrained GPT-2 används direkt
        self.last_prompt = None

    def generate(self, prompt: str, max_length: int = 200) -> str:
        # Generate synthetic journal text using GPT-2
        if not self.trained:
            raise Exception("Model not loaded.")
        self.last_prompt = prompt
        inputs = self.tokenizer.encode(prompt, return_tensors="pt")
        outputs = self.model.generate(
            inputs,
            max_length=max_length,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            no_repeat_ngram_size=2
        )
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

    def generate_multiple(self, prompt: str, max_length: int, count: int) -> list:
        outputs = []
        for _ in range(count):
            outputs.append(self.generate(prompt, max_length))
        return outputs


    def save_model(self, directory_path: str):
        # Save the GPT-2 model and tokenizer to disk
        if not self.trained:
            raise Exception("Model not loaded.")
        path = Path(directory_path)
        path.mkdir(parents=True, exist_ok=True)
        self.model.save_pretrained(path)
        self.tokenizer.save_pretrained(path)

    def load_model(self, directory_path: str):
        # Load a pre-trained GPT-2 model from disk
        path = Path(directory_path)
        self.model = GPT2LMHeadModel.from_pretrained(path)
        self.tokenizer = GPT2Tokenizer.from_pretrained(path)
        self.model.eval()
        self.trained = True

    def preview(self, max_length: int = 100) -> str:
        # Return a preview based on last used prompt
        if not self.last_prompt:
            raise Exception("No prompt has been provided yet.")
        return self.generate(self.last_prompt, max_length)

    def save_to_mongodb(self, text: str, collection):
        # Save generated journal text to MongoDB
        record = {"generated_text": text, "timestamp": datetime.now().isoformat()}
        collection.insert_one(record)

    def log_generation(self, message: str, log_path: str = "logs/gpt2_generation.log"):
        # Log generation messages to a file with a timestamp
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, "a") as f:
            f.write(f"{datetime.now()} - {message}\n")

    def export_to_txt(self, text: str, file_path: str):
        # Export generated text to a TXT file
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(text)

    def export_to_json(self, text: str, file_path: str):
        # Export generated text to a JSON file
        import json
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump({"generated_text": text}, f, ensure_ascii=False, indent=2)

    def get_generation_metadata(self) -> dict:
        # Return metadata about the last generation
        return {
            "model_type": "GPT-2",
            "trained": self.trained,
            "last_prompt": self.last_prompt,
            "timestamp": datetime.now().isoformat()
        }

gpt2_service = GPT2Service()
